const { previewText, readStdinJson, safeParseToolArgs } = require("./lib/highlights-runtime.cjs")

const input = readStdinJson()
const toolName = String(input.toolName || "")
const toolArgs = safeParseToolArgs(input.toolArgs)
const command = String(toolArgs.command || toolArgs.raw || "")

const shellLike = ["bash", "powershell", "execute"].includes(toolName.toLowerCase())
const dangerousPatterns = [
  /curl[^\n|]*\|\s*(bash|sh)\b/i,
  /wget[^\n|]*\|\s*(bash|sh)\b/i,
  /\biex\s*\(irm\b/i,
  /\brm\s+-rf\s+\//i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bformat\b/i,
  /\bsudo\b/i,
  /\bsu\b/i,
  /\brunas\b/i
]

if (shellLike && dangerousPatterns.some((pattern) => pattern.test(command))) {
  const payload = {
    permissionDecision: "deny",
    permissionDecisionReason: `Blocked risky command: ${previewText(command, 120)}`
  }
  process.stdout.write(JSON.stringify(payload))
}
