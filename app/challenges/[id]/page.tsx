import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import FlagForm from "@/components/flag-form"
import challengesData from "@/data/challenges.json"
import type { Challenge } from "@/lib/types"

export default async function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Read statically at build/run time. Do not expose flag in UI.
  const all = challengesData as Challenge[]
  const challenge = all.find((c) => c.id === id)
  if (!challenge) return notFound()

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-sm text-muted-foreground">
          {challenge.category} • {challenge.difficulty} • {challenge.points} pts
        </div>
        <h1 className="text-2xl font-semibold">{challenge.title}</h1>
        <p className="mt-4 text-pretty">{challenge.description}</p>
        {challenge.hint && (
          <details className="mt-4 rounded border p-3">
            <summary className="cursor-pointer text-sm">Hint</summary>
            <p className="mt-2 text-sm text-muted-foreground">{challenge.hint}</p>
          </details>
        )}
        <FlagForm challengeId={challenge.id} />
      </section>
    </main>
  )
}
