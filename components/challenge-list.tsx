"use client"

import useSWR from "swr"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import type { PublicChallenge, TeamProgress } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ChallengeList() {
  const { data: challenges } = useSWR<{ challenges: PublicChallenge[] }>("/api/challenges", fetcher)
  const { data: progress } = useSWR<{ progress: TeamProgress | null }>("/api/progress", fetcher)

  const solvedIds = new Set(progress?.progress?.solves?.map((s) => s.challengeId) ?? [])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {challenges?.challenges.map((c) => (
        <Card key={c.id} className="border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-balance">{c.title}</CardTitle>
              <CardDescription>
                {c.category} • {c.difficulty} • {c.points} pts
              </CardDescription>
            </div>
            {solvedIds.has(c.id) ? (
              <Badge variant="default">Solved</Badge>
            ) : (
              <Badge variant="secondary">Unsolved</Badge>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-pretty">{c.description}</p>
            <div className="mt-4">
              <Link
                href={`/challenges/${c.id}`}
                className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Open Challenge
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
