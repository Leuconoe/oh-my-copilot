const assert = require("node:assert")
const path = require("node:path")
const { spawnSync } = require("node:child_process")

const repoRoot = path.resolve(__dirname, "..")
const scriptPath = path.join(repoRoot, "scripts", "smoke-test-models.cjs")

const result = spawnSync(
  process.execPath,
  [scriptPath, "--dry-run", "--mode", "plugin-dir", "--model", "gpt-4.1", "--model", "gpt-5-mini"],
  {
    cwd: repoRoot,
    encoding: "utf8"
  }
)

assert.equal(result.status, 0, result.stderr)
assert.match(result.stdout, /mode=plugin-dir/)
assert.match(result.stdout, /models=gpt-4.1,gpt-5-mini/)
assert.match(result.stdout, /--plugin-dir/)
assert.match(result.stdout, /smoke-success-gpt-4.1/)
assert.match(result.stdout, /smoke-denial-gpt-5-mini/)

console.log("Smoke test script verification passed.")
