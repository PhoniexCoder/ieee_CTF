import { type NextRequest, NextResponse } from "next/server"
import teams from "@/data/teams.json"
import { setTeamCookie } from "@/lib/auth"
import type { Team } from "@/lib/types"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const teamId = String(body?.teamId ?? "").trim()
  const code = String(body?.code ?? "").trim()
  if (!teamId || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const all = teams as Team[]
  const found = all.find((t) => t.id === teamId && t.code === code)
  if (!found) {
    return NextResponse.json({ error: "Invalid team or code" }, { status: 401 })
  }
  await setTeamCookie(found.id, found.name)
  return NextResponse.json({ ok: true, team: { teamId: found.id, teamName: found.name } }, { status: 200 })
}
