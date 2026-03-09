const path = require("node:path")
const {
  appendJsonl,
  getSessionRecord,
  previewText,
  readStdinJson,
  updateSessionCounts
} = require("./lib/highlights-runtime.cjs")

const input = readStdinJson()
const cwd = input.cwd || process.cwd()
const timestamp = input.timestamp || Date.now()
const error = input.error || {}

const session = getSessionRecord(cwd, timestamp, error.message || "error")

appendJsonl(path.join(session.sessionDir, "errors.jsonl"), {
  timestamp,
  name: String(error.name || "Error"),
  message: previewText(error.message || "Unknown error", 180)
})

updateSessionCounts(session.sessionDir)
