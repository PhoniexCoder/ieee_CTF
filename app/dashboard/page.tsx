import { SiteHeader } from "@/components/site-header"
import ChallengeList from "@/components/challenge-list"
import { getTeamFromCookies } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const team = await getTeamFromCookies()

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {team ? `Welcome, ${team.teamName}.` : "Please log in to track progress."}
            </p>
          </div>
          <Link href="/scoreboard" className="rounded bg-secondary px-3 py-2 text-sm">
            View Scoreboard
          </Link>
        </div>
        <ChallengeList />
      </section>
    </main>
  )
}
