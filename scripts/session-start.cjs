const path = require("node:path")
const { createSessionRecord, readStdinJson, writeJson } = require("./lib/highlights-runtime.cjs")

const input = readStdinJson()
const cwd = input.cwd || process.cwd()
const timestamp = input.timestamp || Date.now()
const initialPrompt = input.initialPrompt || "session"

const session = createSessionRecord(cwd, timestamp, initialPrompt)

writeJson(path.join(session.sessionDir, "session-start.json"), {
  source: input.source || "unknown",
  timestamp
})
