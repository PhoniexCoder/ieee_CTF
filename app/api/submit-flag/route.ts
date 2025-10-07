import { type NextRequest, NextResponse } from "next/server"
import { getTeamFromCookies, addSolve } from "@/lib/auth"
import challenges from "@/data/challenges.json"
import type { Challenge } from "@/lib/types"
import { getDb } from "@/lib/mongodb"
import type { Filter, UpdateFilter } from "mongodb"

// Simple in-memory rate limiter (per-team). Resets on server restart.
const attemptsByTeam = new Map<string, number[]>()
const WINDOW_MS = 60_000 // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 10
const BURST_WINDOW_MS = 10_000 // 10s
const MAX_BURST = 3

function rateLimited(teamKey: string) {
  const now = Date.now()
  const arr = (attemptsByTeam.get(teamKey) ?? []).filter((t) => now - t <= WINDOW_MS)
  arr.push(now)
  attemptsByTeam.set(teamKey, arr)
  const inWindow = arr.length
  const inBurst = arr.filter((t) => now - t <= BURST_WINDOW_MS).length
  return inWindow > MAX_ATTEMPTS_PER_WINDOW || inBurst > MAX_BURST
}

export async function POST(req: NextRequest) {
  const team = await getTeamFromCookies()
  if (!team) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  // Rate limit per team to deter automated guessing
  const key = team.teamId
  if (rateLimited(key)) {
    return NextResponse.json({ error: "Too many attempts. Please slow down." }, { status: 429 })
  }
  const body = await req.json().catch(() => null)
  const challengeId = String(body?.challengeId ?? "")
  const submittedFlag = String(body?.flag ?? "").trim()

  if (!challengeId || !submittedFlag) {
    return NextResponse.json({ error: "Missing challengeId or flag" }, { status: 400 })
  }

  const all = challenges as Challenge[]
  const ch = all.find((c) => c.id === challengeId)
  if (!ch) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  const normalized = (s: string) => s.replace(/\s+/g, "").toLowerCase()
  let isCorrect = false

  if (ch.id === "misc-02") {
    // Dynamic, per-team brute-force flag: CTF{<token>} where token is stored in bfTokens
    try {
      const db = await getDb()
      const col = db.collection<{ teamId: string; token: string }>("bfTokens")
      const doc = await col.findOne({ teamId: team.teamId })
      const token = doc?.token || ""
      const expected = `CTF{${token}}`
      isCorrect = normalized(submittedFlag) === normalized(expected)
    } catch {
      // If DB fails, fall back to static comparison (for local dev)
      const correct = ch.flag ?? ""
      isCorrect = normalized(submittedFlag) === normalized(correct)
    }
  } else {
    const correct = ch.flag ?? ""
    isCorrect = normalized(submittedFlag) === normalized(correct)
  }

  if (!isCorrect) {
    return NextResponse.json({ error: "Incorrect flag" }, { status: 400 })
  }

  const progress = await addSolve(team.teamId, team.teamName, ch.id, ch.points)

  // Best-effort persistence: don't block user result if DB fails
  ;(async () => {
    try {
      const db = await getDb()
      type ProgressDoc = {
        teamId: string
        teamName: string
        totalPoints: number
        solves: { challengeId: string; points: number; solvedAt: string }[]
        updatedAt: string
      }
      const col = db.collection<ProgressDoc>("progress")
      const nowIso = new Date().toISOString()
      // Only add if this challenge wasn't solved before; also increment totalPoints accordingly
      const filter: Filter<ProgressDoc> = {
        teamId: team.teamId,
        // dot-notation is acceptable but TS can't infer path types cleanly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...( { "solves.challengeId": { $ne: ch.id } } as any ),
      }
      const update: UpdateFilter<ProgressDoc> = {
        $set: { teamName: team.teamName, updatedAt: nowIso },
        $push: { solves: { challengeId: ch.id, points: ch.points, solvedAt: nowIso } },
        $inc: { totalPoints: ch.points },
      }
      await col.updateOne(filter, update, { upsert: true })
    } catch (e) {
    }
  })()

  return NextResponse.json({
    ok: true,
    message: "Correct! Progress updated.",
    progress,
  })
}
