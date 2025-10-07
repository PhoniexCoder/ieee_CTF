import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const col = db.collection("progress") // one doc per team

    // Sort by totalPoints desc, then earliest updatedAt for tie-break
    const cursor = col
      .find({}, { projection: { _id: 0, teamId: 1, teamName: 1, totalPoints: 1, solves: 1, updatedAt: 1 } })
      .sort({ totalPoints: -1, updatedAt: 1 })
      .limit(50)

    const entries = await cursor.toArray()
    const leaderboard = entries.map((e) => ({
      teamId: e.teamId as string,
      teamName: e.teamName as string,
      totalPoints: (e.totalPoints as number) ?? 0,
      solvesCount: Array.isArray(e.solves) ? e.solves.length : 0,
      lastUpdate: (e.updatedAt as string) ?? new Date(0).toISOString(),
    }))

    return NextResponse.json({ leaderboard }, { status: 200 })
  } catch (err: any) {
    // If MongoDB is not configured, return 503 with clear message
    return NextResponse.json({ error: err?.message || "MongoDB not available" }, { status: 503 })
  }
}
