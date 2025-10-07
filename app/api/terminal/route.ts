import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

// Sandboxed training terminal with a small virtual filesystem (VFS).
// Includes a hidden file that initially lacks read permission, requiring chmod.

type VfsNode = { type: "dir"; children: string[] } | { type: "file" }

// VFS tree (logical structure only)
const VFS: Record<string, VfsNode> = {
  "/": { type: "dir", children: ["public", "readme.txt"] },
  "/public": { type: "dir", children: ["chals", "stego", "hidden"] },
  "/public/stego": { type: "dir", children: ["vector-secrets.svg"] },
  "/public/hidden": { type: "dir", children: [".secret.txt"] },
  "/public/hidden/chals": { type: "dir", children: ["predict.c"] },
  "/readme.txt": { type: "file" },
  "/public/chals/predict.c": { type: "file" },
  "/public/stego/vector-secrets.svg": { type: "file" },
  "/public/hidden/.secret.txt": { type: "file" },
  "/public/hidden/chals/predict.c": { type: "file" },
}

// Whitelisted mapping from VFS files to real project files
const FILE_MAP: Record<string, string> = {
  "/readme.txt": "README_TERMINAL.txt", // synthetic
  "/public/chals/predict.c": path.join(process.cwd(), "public", "chals", "predict.c"),
  "/public/stego/vector-secrets.svg": path.join(process.cwd(), "public", "stego", "vector-secrets.svg"),
  "/public/hidden/.secret.txt": path.join(process.cwd(), "public", "hidden", ".secret.txt"),
  "/public/hidden/chals/predict.c": path.join(process.cwd(), "public", "hidden", "chals", "predict.c"),
}

async function safeReadFile(vfsPath: string): Promise<string> {
  if (vfsPath === "/readme.txt") {
    return [
      "Welcome to the training terminal",
      "",
      "Commands: ls, cd, pwd, cat, find, chmod, help",
      "Examples:",
      "  ls -la",
      "  cd public/chals",
      "  cat predict.c",
      "  cd ../hidden && ls -la",
      "  chmod +r .secret.txt && cat .secret.txt",
      "",
      "Sandboxed, read-only (except permissions in VFS).",
    ].join("\n")
  }
  const real = FILE_MAP[vfsPath]
  if (!real) throw new Error("Permission denied")
  return fs.readFile(real, "utf8")
}

// Simple permission model (octal bits like 755/644)
const DEFAULT_DIR_MODE = 0o755
const DEFAULT_FILE_MODE = 0o644
const perms = new Map<string, number>()

function initPerms() {
  if (perms.size) return
  for (const p of Object.keys(VFS)) {
    perms.set(p, VFS[p].type === "dir" ? DEFAULT_DIR_MODE : DEFAULT_FILE_MODE)
  }
  // Hidden file starts with no read permissions
  perms.set("/public/hidden/.secret.txt", 0o000)
}

function getMode(p: string): number {
  initPerms()
  return perms.get(p) ?? 0o000
}

function setMode(p: string, mode: number) {
  initPerms()
  if (!VFS[p]) throw new Error("No such path")
  perms.set(p, mode & 0o777)
}

function modeToString(mode: number, type: "file" | "dir"): string {
  const r = (b: number) => ((mode & b) ? "r" : "-")
  const w = (b: number) => ((mode & b) ? "w" : "-")
  const x = (b: number) => ((mode & b) ? "x" : "-")
  const user = r(0o400) + w(0o200) + x(0o100)
  const group = r(0o040) + w(0o020) + x(0o010)
  const other = r(0o004) + w(0o002) + x(0o001)
  return (type === "dir" ? "d" : "-") + user + group + other
}

function isDir(p: string): boolean {
  const node = VFS[p]
  return !!node && node.type === "dir"
}

function isFile(p: string): boolean {
  const node = VFS[p]
  return !!node && node.type === "file"
}

function listDir(p: string): string[] {
  const node = VFS[p]
  if (!node || node.type !== "dir") throw new Error("Not a directory")
  return node.children
}

function joinPath(cwd: string, target?: string): string {
  if (!target || target.trim() === "") return cwd
  if (target.startsWith("/")) return normalize(target)
  return normalize(path.posix.join(cwd, target))
}

function normalize(p: string): string {
  const parts = p.split("/")
  const stack: string[] = []
  for (const part of parts) {
    if (!part || part === ".") continue
    if (part === "..") stack.pop()
    else stack.push(part)
  }
  return "/" + stack.join("/")
}

function findPaths(term: string): string[] {
  const t = term.toLowerCase()
  const results: string[] = []
  for (const key of Object.keys(VFS)) {
    if (key.toLowerCase().includes(t)) results.push(key)
  }
  return results.filter((p) => p !== "/")
}

function helpText(): string {
  return [
    "Available commands:",
    "  ls [-a] [-l] [path] List directory contents",
    "  cd [path]           Change directory",
    "  back                Go up one directory (same as cd ..)",
    "  pwd                 Print current directory",
    "  cat <file>          Show file contents (requires read permission)",
    "  chmod <mode> <path> Change permissions (e.g., 644 or +r/-r/+w/-w/+x/-x)",
    "  find <term>         Search paths containing the term",
    "  help                Show this help",
  ].join("\n")
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { cmd?: string; cwd?: string }
  let cwd = normalize(body.cwd || "/")
  const cmdLine = String(body.cmd || "").trim()
  if (!cmdLine) return NextResponse.json({ output: "", cwd })

  const [rawCmd, ...rest] = cmdLine.split(/\s+/)
  const cmd = rawCmd.toLowerCase()
  const arg = rest.join(" ")

  try {
    switch (cmd) {
      case "pwd": {
        return NextResponse.json({ output: cwd, cwd })
      }
      case "ls": {
        const flags = new Set(rest.filter((s) => s.startsWith("-")))
        const nonFlags = rest.filter((s) => !s.startsWith("-"))
        const target = normalize(joinPath(cwd, nonFlags[0]))
        const pathToList = nonFlags.length ? target : cwd
        const entries = listDir(pathToList)
        const showAll = flags.has("-a") || flags.has("-la") || flags.has("-al")
        const long = flags.has("-l") || flags.has("-la") || flags.has("-al")
        const filtered = showAll ? entries : entries.filter((e) => !e.startsWith("."))
        if (!long) return NextResponse.json({ output: filtered.join("\n"), cwd })
        const lines = filtered.map((name) => {
          const childPath = normalize(path.posix.join(pathToList, name))
          const node = VFS[childPath]
          const permStr = modeToString(getMode(childPath), node.type)
          return `${permStr} ${name}`
        })
        return NextResponse.json({ output: lines.join("\n"), cwd })
      }
      case "cd": {
        const target = normalize(joinPath(cwd, rest[0] || "/"))
        if (!isDir(target)) throw new Error("No such directory")
        cwd = target
        return NextResponse.json({ output: "", cwd })
      }
      case "back": {
        const target = normalize(joinPath(cwd, ".."))
        if (!isDir(target)) throw new Error("No such directory")
        cwd = target
        return NextResponse.json({ output: "", cwd })
      }
      case "cat": {
        if (!rest[0]) throw new Error("Usage: cat <file>")
        const target = normalize(joinPath(cwd, rest[0]))
        if (!isFile(target)) throw new Error("No such file")
        if ((getMode(target) & 0o444) === 0) throw new Error("Permission denied")
        const content = await safeReadFile(target)
        return NextResponse.json({ output: content, cwd })
      }
      case "chmod": {
        if (rest.length < 2) throw new Error("Usage: chmod <mode> <path>")
        const modeRaw = rest[0]
        const target = normalize(joinPath(cwd, rest[1]))
        if (!VFS[target]) throw new Error("No such path")
        let newMode = getMode(target)
        if (/^[0-7]{3}$/.test(modeRaw)) {
          newMode = parseInt(modeRaw, 8)
        } else if (/^[+-][rwx]$/.test(modeRaw)) {
          const op = modeRaw[0]
          const bit = modeRaw[1]
          const mask = bit === "r" ? 0o444 : bit === "w" ? 0o222 : 0o111
          newMode = op === "+" ? newMode | mask : newMode & ~mask
        } else {
          throw new Error("Unsupported mode. Use 644 or +r/-r/+w/-w/+x/-x")
        }
        setMode(target, newMode)
        const node = VFS[target]
        return NextResponse.json({ output: `${modeToString(newMode, node.type)} ${target}`, cwd })
      }
      case "find": {
        if (!arg) throw new Error("Usage: find <term>")
        const results = findPaths(arg)
        return NextResponse.json({ output: results.join("\n") || "(no results)", cwd })
      }
      case "help": {
        return NextResponse.json({ output: helpText(), cwd })
      }
      default: {
        return NextResponse.json({ output: `Command not found: ${cmd}`, cwd })
      }
    }
  } catch (e) {
    const msg = (e as Error)?.message || "Error"
    return NextResponse.json({ output: `Error: ${msg}`, cwd })
  }
}

export async function GET() {
  return NextResponse.json({ info: "POST { cmd, cwd } to interact with the training terminal. Use 'help' for commands." })
}
