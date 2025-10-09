"use client"

import React, { useState } from "react"

// examples removed — UI now accepts a single login input only

export default function SqliDemoPage() {
  const [username, setUsername] = useState("")
  // only username (login) is needed for the demo UI
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/sqli-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await res.json().catch(() => ({}))
      setResult(JSON.stringify({ status: res.status, body: data }, null, 2))
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  // no example helper — users type/paste their login payload directly

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">SQLi Demo — interactive tester</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        This page lets you send JSON payloads to <code>/api/sqli-demo</code>.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="username"
        />
      </div>

      {/* password/answer removed from UI - only login field is shown */}

      {/* examples removed — enter payload directly into the username field */}

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={(e) => submit(e)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>
        <button
          onClick={() => {
            setUsername("")
            setResult(null)
            setError(null)
          }}
          type="button"
          className="px-3 py-1 border rounded"
        >
          Reset
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Server response</label>
        <pre className="p-3 border rounded bg-black text-white overflow-auto max-h-80 whitespace-pre-wrap">
          {error ? `Error: ${error}` : result ?? "(no response yet)"}
        </pre>
      </div>

      <div className="text-sm text-gray-600">
        <strong>Notes:</strong> This page is for demonstration — do not reuse these techniques on systems you do not own.
      </div>
    </div>
  )
}
