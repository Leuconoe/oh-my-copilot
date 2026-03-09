const fs = require("node:fs")
const path = require("node:path")
const { previewText } = require("./redaction.cjs")

function readStdinJson() {
  const raw = fs.readFileSync(0, "utf8").trim()
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function ensureFile(filePath, initialContents = "") {
  ensureDir(path.dirname(filePath))
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, initialContents, "utf8")
  }
}

function ensureSessionArtifacts(sessionDir) {
  ensureFile(path.join(sessionDir, "prompts.jsonl"))
  ensureFile(path.join(sessionDir, "tools.jsonl"))
  ensureFile(path.join(sessionDir, "errors.jsonl"))
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    return fallback
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function appendJsonl(filePath, value) {
  ensureDir(path.dirname(filePath))
  fs.appendFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8")
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return []
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function slugify(value, fallback = "session") {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return normalized || fallback
}

function toIso(timestamp) {
  return new Date(timestamp || Date.now()).toISOString()
}

function findGitRoot(startDir) {
  if (!startDir) return null
  let current = path.resolve(startDir)
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

function resolveStateRoot(cwd) {
  const gitRoot = findGitRoot(cwd)
  return path.join(gitRoot || path.resolve(cwd || process.cwd()), ".copilot-highlights")
}

function pluginRootFromLib() {
  return path.resolve(__dirname, "..", "..")
}

function readPluginVersion() {
  const pluginJsonPath = path.join(pluginRootFromLib(), "plugin.json")
  const pluginJson = readJson(pluginJsonPath, {})
  return pluginJson.version || "0.0.0"
}

function activeSessionsPath(stateRoot) {
  return path.join(stateRoot, "active-sessions.json")
}

function loadActiveSessions(stateRoot) {
  return readJson(activeSessionsPath(stateRoot), {})
}

function saveActiveSessions(stateRoot, sessions) {
  writeJson(activeSessionsPath(stateRoot), sessions)
}

function buildSessionId(timestamp, seed) {
  const stamp = toIso(timestamp).replace(/[:]/g, "").replace(/\.\d{3}Z$/, "Z")
  return `${stamp.replace(/[-]/g, "").replace(/T/, "-")}-${slugify(seed, "session")}`
}

function createSessionRecord(cwd, timestamp, initialPrompt) {
  const stateRoot = resolveStateRoot(cwd)
  const sessions = loadActiveSessions(stateRoot)
  const existing = sessions[cwd]

  if (existing && fs.existsSync(existing.sessionDir)) {
    ensureSessionArtifacts(existing.sessionDir)
    return {
      stateRoot,
      sessionId: existing.sessionId,
      sessionDir: existing.sessionDir
    }
  }

  const sessionId = buildSessionId(timestamp, initialPrompt)
  const sessionDir = path.join(stateRoot, "sessions", sessionId)
  ensureDir(sessionDir)

  writeJson(path.join(sessionDir, "session.json"), {
    session_id: sessionId,
    started_at: toIso(timestamp),
    ended_at: null,
    cwd: path.resolve(cwd || process.cwd()),
    git_root: findGitRoot(cwd || process.cwd()),
    plugin_version: readPluginVersion(),
    prompt_count: 0,
    tool_count: 0,
    error_count: 0
  })

  ensureSessionArtifacts(sessionDir)

  sessions[cwd] = { sessionId, sessionDir }
  saveActiveSessions(stateRoot, sessions)

  return { stateRoot, sessionId, sessionDir }
}

function getSessionRecord(cwd, timestamp, seed) {
  return createSessionRecord(cwd || process.cwd(), timestamp || Date.now(), seed || "session")
}

function updateSessionCounts(sessionDir) {
  const sessionJsonPath = path.join(sessionDir, "session.json")
  const session = readJson(sessionJsonPath, {})
  session.prompt_count = readJsonl(path.join(sessionDir, "prompts.jsonl")).length
  session.tool_count = readJsonl(path.join(sessionDir, "tools.jsonl")).length
  session.error_count = readJsonl(path.join(sessionDir, "errors.jsonl")).length
  writeJson(sessionJsonPath, session)
  return session
}

function endSession(cwd, timestamp) {
  const stateRoot = resolveStateRoot(cwd)
  const sessions = loadActiveSessions(stateRoot)
  const active = sessions[cwd]
  if (!active || !fs.existsSync(active.sessionDir)) return null

  ensureSessionArtifacts(active.sessionDir)

  const sessionJsonPath = path.join(active.sessionDir, "session.json")
  const session = readJson(sessionJsonPath, {})
  session.ended_at = toIso(timestamp)
  writeJson(sessionJsonPath, session)
  updateSessionCounts(active.sessionDir)
  delete sessions[cwd]
  saveActiveSessions(stateRoot, sessions)

  return {
    stateRoot,
    sessionId: active.sessionId,
    sessionDir: active.sessionDir
  }
}

function safeParseToolArgs(value) {
  if (!value) return {}
  if (typeof value === "object") return value
  try {
    return JSON.parse(value)
  } catch {
    return { raw: String(value) }
  }
}

function summarizeToolEvent(toolName, toolArgs, toolResult) {
  const command = toolArgs.command || toolArgs.raw || ""
  const resultText = toolResult?.textResultForLlm || toolResult?.text || ""
  const parts = [toolName]
  if (command) parts.push(previewText(command, 120))
  if (resultText) parts.push(previewText(resultText, 160))
  return parts.join(" :: ")
}

function writeHighlightsSummary(sessionDir) {
  const session = updateSessionCounts(sessionDir)
  const prompts = readJsonl(path.join(sessionDir, "prompts.jsonl"))
  const tools = readJsonl(path.join(sessionDir, "tools.jsonl"))
  const errors = readJsonl(path.join(sessionDir, "errors.jsonl"))

  const toolCounts = new Map()
  for (const event of tools) {
    toolCounts.set(event.tool_name, (toolCounts.get(event.tool_name) || 0) + 1)
  }

  const topTools = Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([toolName, count]) => `${toolName} (${count})`)

  const failureSummaries = tools
    .filter((event) => event.result_type && event.result_type !== "success")
    .slice(0, 3)
    .map((event) => `- ${event.summary}`)

  const latestPrompt = prompts.at(-1)?.prompt_preview || "No prompt captured."

  const lines = [
    "# Session Highlights",
    "",
    `- Session ID: ${session.session_id}`,
    `- Started: ${session.started_at}`,
    `- Ended: ${session.ended_at || "in-progress"}`,
    `- Prompt count: ${session.prompt_count || 0}`,
    `- Tool events: ${session.tool_count || 0}`,
    `- Errors: ${session.error_count || 0}`,
    "",
    "## Highlights",
    "",
    `- Latest prompt: ${latestPrompt}`,
    `- Most used tools: ${topTools.join(", ") || "none"}`,
    `- Error count: ${errors.length}`
  ]

  if (failureSummaries.length > 0) {
    lines.push("", "## Failures Or Denials", "", ...failureSummaries)
  }

  fs.writeFileSync(path.join(sessionDir, "highlights.md"), `${lines.join("\n")}\n`, "utf8")
}

module.exports = {
  appendJsonl,
  createSessionRecord,
  endSession,
  getSessionRecord,
  pluginRootFromLib,
  previewText,
  readJson,
  readJsonl,
  readStdinJson,
  resolveStateRoot,
  safeParseToolArgs,
  summarizeToolEvent,
  toIso,
  updateSessionCounts,
  writeHighlightsSummary,
  writeJson
}
