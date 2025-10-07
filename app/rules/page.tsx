import { SiteHeader } from "@/components/site-header"

export default function RulesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Rules</h1>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-pretty">
          <li>Be respectful. Do not attack other teams or the platform.</li>
          <li>No automated scanning beyond the provided challenges.</li>
          <li>Flag format: CTF{"{...}"} — paste exactly.</li>
          <li>Hints cost nothing in this demo; real events might deduct points.</li>
          <li>Have fun and learn something new!</li>
        </ul>
      </section>
    </main>
  )
}
