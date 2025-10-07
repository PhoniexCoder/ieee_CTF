"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function LoginForm() {
  const router = useRouter()
  const [teamId, setTeamId] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data } = useSWR("/api/me", fetcher)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, code }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || "Login failed")
      return
    }
    router.push("/dashboard")
  }

  if (data?.team) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm">
          Logged in as <span className="font-semibold">{data.team.teamName}</span>.
        </p>
        <div className="mt-3">
          <Button
            onClick={() => {
              window.location.href = "/dashboard"
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <label className="text-sm">Team ID</label>
        <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="e.g., t001" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Access Code</label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your team code"
          type="password"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">Error: {error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Logging in…" : "Login"}
      </Button>
      <p className="text-xs text-muted-foreground">
        This demo uses cookies for session and progress. Do not share codes.
      </p>
    </form>
  )
}
