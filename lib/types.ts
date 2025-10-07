export type Challenge = {
  id: string
  title: string
  category: "web" | "crypto" | "forensics" | "misc" | "pwn" | "re"
  difficulty: "easy" | "medium" | "hard"
  points: number
  description: string
  hint?: string
  // server-only: do not send to client
  flag?: string
}

export type PublicChallenge = Omit<Challenge, "flag">

export type Team = {
  id: string
  name: string
  code: string // simple access code for demo (validate server-side)
}

export type Solve = {
  challengeId: string
  points: number
  solvedAt: string
}

export type TeamProgress = {
  teamId: string
  teamName: string
  solves: Solve[]
  totalPoints: number
}

export type LeaderboardEntry = {
  teamId: string
  teamName: string
  totalPoints: number
  solvesCount: number
  lastUpdate: string
}
