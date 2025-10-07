import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Flag, Lock, Shield, Zap } from "lucide-react"
import challengesData from "@/data/challenges.json"
import type { Challenge } from "@/lib/types"

export default function HomePage() {
  const all = challengesData as Challenge[]
  const totalChallenges = all.length
  const categories = Array.from(new Set(all.map((c) => c.category)))
  const mediums = all.filter((c) => c.difficulty === "medium").length
  const hards = all.filter((c) => c.difficulty === "hard").length

  return (
    <main className="relative min-h-screen">
      <SiteHeader />

      {/* Hero with gradient background */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-transparent" />
        <div className="pointer-events-none absolute inset-0 -z-20 opacity-60 [background:radial-gradient(60rem_30rem_at_50%_-10%,hsl(var(--primary)/0.15),transparent_60%)]" />

        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <Badge className="bg-primary/15 text-primary">New</Badge>
              <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
                Capture The Flag, simplified.
              </h1>
              <p className="text-pretty text-muted-foreground md:text-lg">
                Fast, classroom-friendly CTF platform. Server-validated flags, cookie-based progress, optional
                MongoDB leaderboard, and a clean mobile-first UI.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/scoreboard">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Trophy className="h-4 w-4" /> View Scoreboard
                  </Button>
                </Link>
                <Link href="/rules" className="text-sm underline underline-offset-4">
                  Read the rules
                </Link>
              </div>
              <div className="flex gap-6 pt-2 text-sm text-muted-foreground">
                <div>{totalChallenges} challenges</div>
                <div>{categories.length} categories</div>
                <div>{mediums} medium • {hards} hard</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-primary" /> Server-side checks
                  </CardTitle>
                  <CardDescription>Flags are validated on the server.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flag className="h-4 w-4 text-primary" /> Progress tracking
                  </CardTitle>
                  <CardDescription>Per-team local progress via cookies.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-primary" /> Leaderboard
                  </CardTitle>
                  <CardDescription>Global standings (MongoDB optional).</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4 text-primary" /> Safe by default
                  </CardTitle>
                  <CardDescription>Flags stripped from API responses.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explore categories</h2>
          <Link href="/dashboard" className="text-sm underline underline-offset-4">
            Browse all challenges
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat} className="hover:bg-accent/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{cat}</div>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {all.filter((c) => c.category === cat).length} challenges
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Built for learning • <span className="font-mono">CTF</span> demo
      </footer>
    </main>
  )
}
