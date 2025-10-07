import { SiteHeader } from "@/components/site-header"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Team Login</h1>
        <LoginForm />
        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Use the sample teams from data/teams.json (e.g., Red Rooks with code red-1234).
        </p>
      </section>
    </main>
  )
}
