const { endSession, readStdinJson, writeHighlightsSummary } = require("./lib/highlights-runtime.cjs")

const input = readStdinJson()
const cwd = input.cwd || process.cwd()
const timestamp = input.timestamp || Date.now()

const session = endSession(cwd, timestamp)
if (session) {
  writeHighlightsSummary(session.sessionDir)
}
