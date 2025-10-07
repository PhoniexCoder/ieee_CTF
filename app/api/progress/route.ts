import { NextResponse } from "next/server"
import { getTeamFromCookies, getProgress } from "@/lib/auth"

export async function GET() {
  const team = await getTeamFromCookies()
  if (!team) {
    return NextResponse.json({ progress: null }, { status: 200 })
  }
  const progress = await getProgress(team.teamId, team.teamName)
  return NextResponse.json({ progress }, { status: 200 })
}
