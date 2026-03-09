const assert = require("node:assert")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { spawnSync } = require("node:child_process")

const repoRoot = path.resolve(__dirname, "..")
const fixturesDir = path.join(__dirname, "fixtures", "hooks")

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, name), "utf8"))
}

function runScript(scriptName, payload) {
  return spawnSync(process.execPath, [path.join(repoRoot, "scripts", scriptName)], {
    cwd: repoRoot,
    encoding: "utf8",
    input: JSON.stringify(payload)
  })
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "oh-my-copilot-fixture-"))
fs.mkdirSync(path.join(projectDir, ".git"), { recursive: true })

const sessionStart = readFixture("session-start.json")
sessionStart.cwd = projectDir
let result = runScript("session-start.cjs", sessionStart)
assert.equal(result.status, 0, result.stderr)

const highlightsRoot = path.join(projectDir, ".copilot-highlights")
const activeSessions = readJson(path.join(highlightsRoot, "active-sessions.json"))
assert.ok(activeSessions[projectDir], "expected active session mapping")

const sessionDir = activeSessions[projectDir].sessionDir
assert.ok(fs.existsSync(path.join(sessionDir, "session.json")), "expected session.json")
for (const fileName of ["prompts.jsonl", "tools.jsonl", "errors.jsonl"]) {
  const filePath = path.join(sessionDir, fileName)
  assert.ok(fs.existsSync(filePath), `expected ${fileName}`)
  assert.equal(fs.readFileSync(filePath, "utf8"), "")
}

const promptEvent = readFixture("user-prompt-submitted.json")
promptEvent.cwd = projectDir
result = runScript("prompt-log.cjs", promptEvent)
assert.equal(result.status, 0, result.stderr)

const dangerousEvent = readFixture("pre-tool-use-dangerous.json")
dangerousEvent.cwd = projectDir
result = runScript("pre-tool-guard.cjs", dangerousEvent)
assert.equal(result.status, 0, result.stderr)
const denyPayload = JSON.parse(result.stdout)
assert.equal(denyPayload.permissionDecision, "deny")

const toolEvent = readFixture("post-tool-use.json")
toolEvent.cwd = projectDir
result = runScript("post-tool-capture.cjs", toolEvent)
assert.equal(result.status, 0, result.stderr)

const errorEvent = readFixture("error-occurred.json")
errorEvent.cwd = projectDir
result = runScript("error-occurred.cjs", errorEvent)
assert.equal(result.status, 0, result.stderr)

const endEvent = readFixture("session-end.json")
endEvent.cwd = projectDir
result = runScript("session-end.cjs", endEvent)
assert.equal(result.status, 0, result.stderr)

const sessionJson = readJson(path.join(sessionDir, "session.json"))
assert.ok(sessionJson.ended_at, "expected ended_at to be set")
assert.equal(sessionJson.plugin_version, "0.1.0")
assert.equal(sessionJson.prompt_count, 1)
assert.equal(sessionJson.tool_count, 1)
assert.equal(sessionJson.error_count, 1)

const prompts = readJsonl(path.join(sessionDir, "prompts.jsonl"))
assert.equal(prompts.length, 1)
assert.ok(!prompts[0].prompt_preview.includes("ghp_1234567890ABCDEFGHIJKLMNOPQRSTUV"), "prompt preview should redact tokens")
assert.ok(prompts[0].prompt_preview.includes("[REDACTED]") || prompts[0].prompt_preview.includes("[REDACTED_GITHUB_TOKEN]"), "prompt preview should contain a redaction marker")

const tools = readJsonl(path.join(sessionDir, "tools.jsonl"))
assert.equal(tools.length, 1)
assert.equal(tools[0].result_type, "success")

const errors = readJsonl(path.join(sessionDir, "errors.jsonl"))
assert.equal(errors.length, 1)

const highlights = fs.readFileSync(path.join(sessionDir, "highlights.md"), "utf8")
assert.ok(highlights.includes("# Session Highlights"))
assert.ok(highlights.includes("Prompt count: 1"))
assert.ok(highlights.includes("Tool events: 1"))

console.log("Hook fixture verification passed.")
