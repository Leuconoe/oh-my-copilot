function redactSensitiveText(value) {
  let text = String(value ?? "")

  const replacements = [
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]"],
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_API_KEY]"],
    [/Bearer\s+[A-Za-z0-9._-]{10,}/gi, "Bearer [REDACTED_TOKEN]"],
    [/\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|KEY)[A-Z0-9_]*)\s*=\s*([^\s]+)/g, "$1=[REDACTED]"],
    [/("[^"\\]*(?:token|secret|password|apiKey|key)[^"\\]*"\s*:\s*")([^"]+)(")/gi, "$1[REDACTED]$3"]
  ]

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement)
  }

  return text
}

function previewText(value, maxLength = 160) {
  const redacted = redactSensitiveText(value).replace(/\s+/g, " ").trim()
  if (redacted.length <= maxLength) return redacted
  return `${redacted.slice(0, maxLength - 3)}...`
}

module.exports = {
  previewText,
  redactSensitiveText
}
