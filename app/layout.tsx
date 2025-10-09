import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "technIEEEk's CTF",
  description: "Created by phoniexcoder",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <main>
            <header>{/* Header content here */}</header>
            <section>{children}</section>
            <footer>{/* Footer content here */}</footer>
          </main>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
