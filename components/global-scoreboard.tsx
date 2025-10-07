"use client"

import useSWR from "swr"

type Entry = {
  teamId: string
  teamName: string
  totalPoints: number
  solvesCount: number
  lastUpdate: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const error = new Error(data?.error || `Request failed: ${res.status}`)
    ;(error as any).status = res.status
    throw error
  }
  return res.json()
}

export function GlobalScoreboard() {
  const { data, error, isLoading } = useSWR<{ leaderboard: Entry[] }>("/api/leaderboard", fetcher, {
    refreshInterval: 10_000, // auto-refresh every 10s
  })

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading global leaderboard…</p>
  }

  if (error) {
    // 503 likely means DB not configured
    return (
      <div className="rounded-md border bg-card p-4 text-sm">
        <p className="text-muted-foreground">
          Global leaderboard unavailable. {error.message || "Please configure MongoDB (MONGODB_URI)."}
        </p>
      </div>
    )
  }

  const rows = data?.leaderboard ?? []

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 border-b p-3 text-sm font-medium">
        <div className="col-span-3">Team</div>
        <div className="text-center">Solves</div>
        <div className="text-right">Points</div>
        <div className="text-right">Updated</div>
      </div>
      <div className="divide-y">
        {rows.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">No teams have scored yet.</div>
        ) : (
          rows.map((e, i) => (
            <div key={`${e.teamId}-${i}`} className="grid grid-cols-6 items-center p-3 text-sm">
              <div className="col-span-3">
                <span className="font-semibold">{e.teamName}</span>
                <span className="ml-2 text-xs text-muted-foreground">({e.teamId})</span>
              </div>
              <div className="text-center">{e.solvesCount}</div>
              <div className="text-right font-mono">{e.totalPoints} pts</div>
              <div className="text-right text-xs text-muted-foreground">
                {new Date(e.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GlobalScoreboard
