"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FlagForm({ challengeId }: { challengeId: string }) {
  const [flag, setFlag] = useState("")
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    const res = await fetch("/api/submit-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, flag }),
    })
    setSubmitting(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setStatus({ ok: false, msg: data.error || "Incorrect flag" })
    } else {
      setStatus({ ok: true, msg: data.message || "Correct!" })
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="space-y-2">
        <label className="text-sm">Flag</label>
        <Input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="CTF{...}"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </div>
      {status && (
        <p className={`text-sm ${status.ok ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          {status.msg}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Flag"}
      </Button>
    </form>
  )
}
