const assert = require("node:assert")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { spawnSync } = require("node:child_process")

const repoRoot = path.resolve(__dirname, "..")
const scriptPath = path.join(repoRoot, "scripts", "flush-highlights.cjs")

function run(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  })
}

const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "oh-my-copilot-flush-"))
fs.mkdirSync(path.join(projectDir, ".git"), { recursive: true })

const highlightsRoot = path.join(projectDir, ".copilot-highlights")
fs.mkdirSync(path.join(highlightsRoot, "sessions", "example"), { recursive: true })
fs.writeFileSync(path.join(highlightsRoot, "active-sessions.json"), "{}\n", "utf8")
fs.writeFileSync(path.join(highlightsRoot, "sessions", "example", "highlights.md"), "# Session Highlights\n", "utf8")

let result = run(["--cwd", projectDir])
assert.equal(result.status, 0, result.stderr)
assert.ok(fs.existsSync(highlightsRoot), "expected highlights directory to remain without --yes")
assert.match(result.stdout, /Refusing to delete without --yes/)

result = run(["--cwd", projectDir, "--dry-run"])
assert.equal(result.status, 0, result.stderr)
assert.ok(fs.existsSync(highlightsRoot), "expected dry run to keep highlights directory")
assert.match(result.stdout, /Would remove/)

result = run(["--cwd", projectDir, "--yes"])
assert.equal(result.status, 0, result.stderr)
assert.ok(!fs.existsSync(highlightsRoot), "expected highlights directory to be removed")
assert.match(result.stdout, /Removed/)

console.log("Flush highlights verification passed.")
