const path = require("node:path")
const {
  appendJsonl,
  getSessionRecord,
  readStdinJson,
  safeParseToolArgs,
  summarizeToolEvent,
  updateSessionCounts
} = require("./lib/highlights-runtime.cjs")

const input = readStdinJson()
const cwd = input.cwd || process.cwd()
const timestamp = input.timestamp || Date.now()
const toolName = String(input.toolName || "unknown")
const toolArgs = safeParseToolArgs(input.toolArgs)
const toolResult = input.toolResult || {}

const session = getSessionRecord(cwd, timestamp, toolName)

appendJsonl(path.join(session.sessionDir, "tools.jsonl"), {
  timestamp,
  tool_name: toolName,
  result_type: toolResult.resultType || "unknown",
  summary: summarizeToolEvent(toolName, toolArgs, toolResult)
})

updateSessionCounts(session.sessionDir)
