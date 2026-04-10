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

  const renderWithLinks = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlPattern)
    return parts.map((part, idx) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary break-all"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-sm text-muted-foreground">
          {challenge.category} • {challenge.difficulty} • {challenge.points} pts
        </div>
        <h1 className="text-2xl font-semibold">{challenge.title}</h1>
        <p className="mt-4 text-pretty whitespace-pre-line">{challenge.description}</p>
        {challenge.hint && (
          <details className="mt-4 rounded border p-3">
            <summary className="cursor-pointer text-sm">Hint</summary>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
              {renderWithLinks(challenge.hint)}
            </p>
          </details>
        )}
        <FlagForm challengeId={challenge.id} />
      </section>
    </main>
  )
}
