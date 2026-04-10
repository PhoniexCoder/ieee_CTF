import { SiteHeader } from "@/components/site-header"

export default function RulesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Rules</h1>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-pretty">
          <li>Be respectful. Do not attack other teams or the platform.</li>
          <li>Avoid automated scanning beyond the provided challenges.</li>
          <li>Flag format: flag{"{...}"} — submit exactly, including case and symbols.</li>
          <li>Hints are free in this demo; real events might deduct points.</li>
          <li>Have fun, experiment, and learn something new!</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Internal CTF Rules (Points Only)</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-pretty">
          <li>No ChatGPT or other AI tools are allowed.</li>
          <li>No collaboration between participants.</li>
          <li>No flag sharing.</li>
          <li>Do not attack the CTF platform infrastructure.</li>
          <li>Do not brute-force platform accounts.</li>
          <li>Respect all time limits.</li>
          <li>Submit flags in the exact required format.</li>
          <li>Each participant must use only their own account.</li>
          <li>Any unfair means result in disqualification.</li>
          <li>Decisions of the organizers are final.</li>
          <li>
            If anyone is found using AI tools, unethical methods, or other prohibited activities, they will be
            immediately disqualified.
          </li>
          <li>No excuses, no warnings, no second chances.</li>
        </ul>
      </section>
    </main>
  )
}
