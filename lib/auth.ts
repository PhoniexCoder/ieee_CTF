import { cookies } from "next/headers"
import type { TeamProgress } from "./types"

const TEAM_COOKIE = "ctf_team"
const SOLVES_COOKIE = "ctf_solves" // stores per-team progress JSON

export async function getTeamFromCookies() {
  const store = await cookies()
  const c = store.get(TEAM_COOKIE)?.value
  if (!c) return null
  try {
    return JSON.parse(c) as { teamId: string; teamName: string }
  } catch {
    return null
  }
}

export async function setTeamCookie(teamId: string, teamName: string) {
  const store = await cookies()
  store.set(TEAM_COOKIE, JSON.stringify({ teamId, teamName }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6, // 6 hours
  })
}

export async function clearTeamCookie() {
  const store = await cookies()
  store.delete(TEAM_COOKIE)
}

export async function clearAllCookies() {
  const store = await cookies()
  // Clear both the team identity and local progress cookies
  store.delete(TEAM_COOKIE)
  store.delete(SOLVES_COOKIE)
}

type SolvesStore = Record<
  string, // teamId
  TeamProgress
>

async function parseSolvesCookie(): Promise<SolvesStore> {
  const store = await cookies()
  const raw = store.get(SOLVES_COOKIE)?.value
  if (!raw) return {}
  try {
    return JSON.parse(raw) as SolvesStore
  } catch {
    return {}
  }
}

async function writeSolvesCookie(storeValue: SolvesStore) {
  const store = await cookies()
  store.set(SOLVES_COOKIE, JSON.stringify(storeValue), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6,
  })
}

export async function getProgress(teamId: string, teamName: string): Promise<TeamProgress> {
  const store = await parseSolvesCookie()
  const existing = store[teamId]
  if (existing) return existing
  const empty: TeamProgress = { teamId, teamName, solves: [], totalPoints: 0 }
  store[teamId] = empty
  await writeSolvesCookie(store)
  return empty
}

export async function addSolve(teamId: string, teamName: string, challengeId: string, points: number) {
  const store = await parseSolvesCookie()
  const current = store[teamId] ?? { teamId, teamName, solves: [], totalPoints: 0 }
  if (!current.solves.find((s) => s.challengeId === challengeId)) {
    current.solves.push({ challengeId, points, solvedAt: new Date().toISOString() })
    current.totalPoints = current.solves.reduce((sum, s) => sum + s.points, 0)
  }
  store[teamId] = current
  await writeSolvesCookie(store)
  return current
}
