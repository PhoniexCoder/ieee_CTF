import { SiteHeader } from "@/components/site-header"
import { getTeamFromCookies, getProgress } from "@/lib/auth"
import GlobalScoreboard from "@/components/global-scoreboard"
import type { TeamProgress } from "@/lib/types"

export default async function ScoreboardPage() {
  const team = await getTeamFromCookies()
  const progress: TeamProgress | null = team ? await getProgress(team.teamId, team.teamName) : null

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Scoreboard</h1>
        {!team ? (
          <p className="mt-4 text-sm text-muted-foreground">Please log in to view your team&apos;s scoreboard.</p>
        ) : (
          <div className="mt-6 space-y-8">
            <div>
              <h2 className="mb-2 text-lg font-medium">Your Team</h2>
              <div className="rounded border">
                <div className="grid grid-cols-4 border-b p-3 text-sm font-medium">
                  <div>Team</div>
                  <div className="col-span-2">Solved Challenges</div>
                  <div className="text-right">Total</div>
                </div>
                <div className="grid grid-cols-4 items-center p-3 text-sm">
                  <div className="font-semibold">{progress?.teamName}</div>
                  <div className="col-span-2 text-pretty">
                    {progress?.solves.length ? progress?.solves.map((s: { challengeId: string }) => s.challengeId).join(", ") : "—"}
                  </div>
                  <div className="text-right font-mono">{progress?.totalPoints ?? 0} pts</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                This reflects progress stored in your browser (cookie-based).
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-medium">Global Leaderboard</h2>
              <GlobalScoreboard />
              <p className="mt-3 text-xs text-muted-foreground">
                The global leaderboard uses MongoDB. If not configured, you&apos;ll see a helpful message here. Set
                MONGODB_URI (and optionally MONGODB_DB) in your project environment.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
