import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

// Simple admin endpoint to clear leaderboard data (progress collection)
// In a real deployment, protect this with auth or a secret token.

export async function POST() {
  try {
    const db = await getDb()
    const col = db.collection("progress")
    const result = await col.deleteMany({})
    return NextResponse.json(
      { ok: true, deletedCount: result.deletedCount ?? 0 },
      { status: 200 },
    )
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to reset leaderboard" },
      { status: 500 },
    )
  }
}
