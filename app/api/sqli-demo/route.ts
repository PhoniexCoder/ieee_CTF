import { NextRequest, NextResponse } from "next/server"

// Teaching-only demo endpoint to illustrate SQL injection
// POST { username, password }
// Intentionally vulnerable string concatenation logic (simulated)

function buildQuery(username: string, password: string) {
  // This is the vulnerable pattern we want students to recognize
  return `SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1;`
}

function isInjection(username: string, password: string) {
  // Accept common tautology patterns for the demo: ' OR '1'='1, ' OR 1=1 --, etc.
  const s = `${username} ${password}`.toLowerCase()
  return /'\s*or\s*'1'='1|"\s*or\s*"1"="1|or\s*1=1|--|#/i.test(s)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>))
  const username = String(body.username ?? "")
  const password = String(body.password ?? "")

  // Illustrate how a naive query would look
  const query = buildQuery(username, password)

  // For the demo, we don't connect to a DB. We "succeed" if injection is detected.
  if (!username) {
    return NextResponse.json({ ok: false, error: "Missing username", query }, { status: 400 })
  }

  // Only allow access via SQL injection for the challenge.
  if (isInjection(username, password)) {
    // Return the secret like a protected resource
    return NextResponse.json(
      {
        ok: true,
        user: { username: "admin", role: "admin" },
        secret: "CTF{quote_escape_failure}",
        note: "This endpoint is a mock to teach SQL injection. Never build queries via string concatenation.",
        query,
      },
      { status: 200 },
    )
  }

  return NextResponse.json({ ok: false, error: "Invalid credentials", query }, { status: 401 })
}

export async function GET() {
  // Hide examples to avoid leaking the approach; enforce POST-only usage.
  return new NextResponse(
    JSON.stringify({ error: "Method not allowed. Use POST with JSON body: { username, password }." }),
    {
      status: 405,
      headers: { "content-type": "application/json", Allow: "POST" },
    },
  )
}
