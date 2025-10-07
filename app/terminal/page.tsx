"use client"

import { useEffect, useRef, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TermResp = { output: string; cwd: string }

export default function TerminalPage() {
  const [cwd, setCwd] = useState("/")
  const [lines, setLines] = useState<string[]>(["Type 'help' to begin."])
  const [cmd, setCmd] = useState("")
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  async function run() {
    const toSend = cmd.trim()
    if (!toSend) return
    setLines((l) => [...l, `$ ${toSend}`])
    setCmd("")
    const res = await fetch("/api/terminal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cmd: toSend, cwd }),
    })
    const data = (await res.json()) as TermResp
    if (data.output) setLines((l) => [...l, data.output])
    if (data.cwd) setCwd(data.cwd)
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") run()
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 text-sm text-muted-foreground">Sandboxed training terminal</div>
            <div className="h-80 overflow-y-auto rounded bg-black p-3 font-mono text-sm text-green-400">
              {lines.map((ln, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {ln}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{cwd} $</span>
              <Input
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                onKeyDown={onKey}
                placeholder="help"
              />
              <Button onClick={run}>Run</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
