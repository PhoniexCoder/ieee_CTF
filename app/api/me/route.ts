import { NextResponse } from "next/server"
import { getTeamFromCookies } from "@/lib/auth"

export async function GET() {
  const team = await getTeamFromCookies()
  return NextResponse.json({ team: team ?? null }, { status: 200 })
}
