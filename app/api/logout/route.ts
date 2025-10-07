import { NextResponse } from "next/server"
import { clearAllCookies } from "@/lib/auth"

export async function POST() {
  await clearAllCookies()
  return NextResponse.json({ ok: true })
}
