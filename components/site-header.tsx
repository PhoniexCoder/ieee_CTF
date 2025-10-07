"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import useSWR from "swr"

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/rules", label: "Rules" },
  { href: "/terminal", label: "Terminal" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data } = useSWR("/api/me", (u) => fetch(u).then((r) => r.json()))
  const team = data?.team

  return (
    <header className="w-full border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded bg-primary" aria-hidden />
          <span className="font-mono text-sm">ctf.site</span>
        </Link>
        <ul className="flex items-center gap-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded px-3 py-2 text-sm transition-colors ${
                  pathname === l.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          {!team ? (
            <Link href="/login">
              <Button size="sm" variant="secondary">
                Login
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" })
                router.push("/")
                router.refresh()
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
