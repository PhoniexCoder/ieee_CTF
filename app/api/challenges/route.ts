import { NextResponse } from "next/server"
import data from "@/data/challenges.json"
import type { Challenge, PublicChallenge } from "@/lib/types"
import { getTeamFromCookies } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import crypto from "crypto"

export async function GET() {
  const all = data as Challenge[]
  const sanitized: PublicChallenge[] = all.map(({ flag, ...rest }) => rest)
  // Build base headers (static hints)
  const headers: Record<string, string> = {
    "x-ctf-warmup": "headers_help_hunters",
    "x-crypto-key-hint": "citrus",
    "cache-control": "no-store",
  }

  // Personalize brute-force target per team
  const team = await getTeamFromCookies()
  if (team) {
    try {
      const db = await getDb()
      type BFDoc = { teamId: string; token: string; createdAt: string }
      const col = db.collection<BFDoc>("bfTokens")
      let doc = await col.findOne({ teamId: team.teamId })
      if (!doc) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
        let token = ""
        for (let i = 0; i < 5; i++) token += alphabet[Math.floor(Math.random() * alphabet.length)]
        const toInsert: BFDoc = { teamId: team.teamId, token, createdAt: new Date().toISOString() }
  await col.insertOne(toInsert)
  doc = await col.findOne({ teamId: team.teamId })
      }
      const hash = crypto.createHash("sha256").update((doc as BFDoc).token).digest("hex")
      headers["x-brute-target-sha256"] = hash
    } catch {
      // If DB unavailable, omit per-team header
      headers["x-brute-target-sha256"] = "unavailable"
    }
  } else {
    headers["x-brute-target-sha256"] = "login-required"
  }

  return NextResponse.json(
    { challenges: sanitized },
    {
      status: 200,
      headers,
    },
  )
}
