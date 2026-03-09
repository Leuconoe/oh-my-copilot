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
const prompt = input.prompt || ""

const session = getSessionRecord(cwd, timestamp, prompt)

appendJsonl(path.join(session.sessionDir, "prompts.jsonl"), {
  timestamp,
  kind: "user_prompt_submitted",
  prompt_preview: previewText(prompt, 180)
})

updateSessionCounts(session.sessionDir)
