const fs = require("node:fs")
const path = require("node:path")
const { spawnSync } = require("node:child_process")
const { readJsonl, resolveStateRoot } = require("./lib/highlights-runtime.cjs")

function parseArgs(argv) {
  const repoRoot = path.resolve(__dirname, "..")
  const options = {
    repoRoot,
    mode: "plugin-dir",
    installSource: "Leuconoe/oh-my-copilot",
    models: [],
    dryRun: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--model") {
      const value = argv[index + 1]
      if (value) {
        options.models.push(value)
        index += 1
      }
      continue
    }
    if (arg === "--mode") {
      const value = argv[index + 1]
      if (value) {
        options.mode = value
        index += 1
      }
      continue
    }
    if (arg === "--install-source") {
      const value = argv[index + 1]
      if (value) {
        options.installSource = value
        index += 1
      }
      continue
    }
    if (arg === "--repo-root") {
      const value = argv[index + 1]
      if (value) {
        options.repoRoot = path.resolve(value)
        index += 1
      }
      continue
    }
    if (arg === "--dry-run") {
      options.dryRun = true
    }
  }

  if (options.models.length === 0) {
    options.models = ["gpt-4.1", "gpt-5-mini"]
  }

  if (!["plugin-dir", "install"].includes(options.mode)) {
    throw new Error(`Unsupported mode: ${options.mode}`)
  }

  return options
}

function buildBaseArgs(options, model) {
  const args = []
  if (options.mode === "plugin-dir") {
    args.push("--plugin-dir", options.repoRoot)
  }
  args.push("--allow-all-tools", "--model", model, "--output-format", "text")
  return args
}

function runCommand(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8"
  })
}

function listSessionNames(stateRoot) {
  const sessionsDir = path.join(stateRoot, "sessions")
  if (!fs.existsSync(sessionsDir)) return []
  return fs
    .readdirSync(sessionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function diffNewSession(before, after) {
  const beforeSet = new Set(before)
  return after.filter((name) => !beforeSet.has(name))
}

function assertOk(result, label) {
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}\n${result.stderr || result.stdout}`)
  }
}

function assertIncludes(value, needle, label) {
  if (!value.includes(needle)) {
    throw new Error(`${label} missing expected text: ${needle}\n${value}`)
  }
}

function validateSuccessSession(sessionDir) {
  const tools = readJsonl(path.join(sessionDir, "tools.jsonl"))
  const highlightsPath = path.join(sessionDir, "highlights.md")
  const highlights = fs.existsSync(highlightsPath) ? fs.readFileSync(highlightsPath, "utf8") : ""
  const hasSuccess = tools.some((event) => event.result_type === "success" && event.summary.includes("node --version"))
  if (!hasSuccess) {
    throw new Error(`Success session did not capture node --version: ${sessionDir}`)
  }
  assertIncludes(highlights, "# Session Highlights", "success highlights")
}

function validateDeniedSession(sessionDir) {
  const tools = readJsonl(path.join(sessionDir, "tools.jsonl"))
  const highlightsPath = path.join(sessionDir, "highlights.md")
  const highlights = fs.existsSync(highlightsPath) ? fs.readFileSync(highlightsPath, "utf8") : ""
  const hasDenied = tools.some((event) => event.result_type === "denied" && event.summary.includes("sudo echo hi"))
  if (!hasDenied) {
    throw new Error(`Denied session did not capture sudo denial: ${sessionDir}`)
  }
  assertIncludes(highlights, "Failures Or Denials", "denied highlights")
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const stateRoot = resolveStateRoot(options.repoRoot)

  const planned = []
  if (options.mode === "install") {
    planned.push(`copilot plugin install ${options.installSource}`)
  }
  for (const model of options.models) {
    const base = buildBaseArgs(options, model).join(" ")
    planned.push(`copilot ${base} -p "/skills list"`)
    planned.push(`copilot ${base} -p "Use the bash tool once to run: node --version. Then reply with exactly: smoke-success-${model}"`)
    planned.push(`copilot ${base} -p "Use the powershell tool once to run: sudo echo hi. If the tool call is denied, reply with exactly: smoke-denial-${model}. If it executes, reply with exactly: smoke-denial-missed-${model}"`)
  }

  if (options.dryRun) {
    console.log(`mode=${options.mode}`)
    console.log(`repoRoot=${options.repoRoot}`)
    console.log(`models=${options.models.join(",")}`)
    for (const line of planned) {
      console.log(line)
    }
    return
  }

  if (options.mode === "install") {
    const installResult = runCommand("copilot", ["plugin", "install", options.installSource], options.repoRoot)
    assertOk(installResult, "plugin install")
    const listResult = runCommand("copilot", ["plugin", "list"], options.repoRoot)
    assertOk(listResult, "plugin list")
    assertIncludes(listResult.stdout, "oh-my-copilot", "plugin list")
  }

  for (const model of options.models) {
    const baseArgs = buildBaseArgs(options, model)

    const skillsResult = runCommand("copilot", [...baseArgs, "-p", "/skills list"], options.repoRoot)
    assertOk(skillsResult, `skills list (${model})`)
    assertIncludes(skillsResult.stdout, "copilot-highlights-verification-loop", `skills list (${model})`)

    const beforeSuccess = listSessionNames(stateRoot)
    const successMarker = `smoke-success-${model}`
    const successPrompt = `Use the bash tool once to run: node --version. Then reply with exactly: ${successMarker}`
    const successResult = runCommand("copilot", [...baseArgs, "-p", successPrompt], options.repoRoot)
    assertOk(successResult, `success smoke (${model})`)
    assertIncludes(successResult.stdout, successMarker, `success smoke (${model})`)
    const afterSuccess = listSessionNames(stateRoot)
    const successSessions = diffNewSession(beforeSuccess, afterSuccess)
    if (successSessions.length < 1) {
      throw new Error(`No new success session detected for ${model}`)
    }
    validateSuccessSession(path.join(stateRoot, "sessions", successSessions.at(-1)))

    const beforeDenied = listSessionNames(stateRoot)
    const deniedMarker = `smoke-denial-${model}`
    const deniedMissedMarker = `smoke-denial-missed-${model}`
    const deniedPrompt = `Use the powershell tool once to run: sudo echo hi. If the tool call is denied, reply with exactly: ${deniedMarker}. If it executes, reply with exactly: ${deniedMissedMarker}`
    const deniedResult = runCommand("copilot", [...baseArgs, "-p", deniedPrompt], options.repoRoot)
    assertOk(deniedResult, `denied smoke (${model})`)
    assertIncludes(deniedResult.stdout, deniedMarker, `denied smoke (${model})`)
    const afterDenied = listSessionNames(stateRoot)
    const deniedSessions = diffNewSession(beforeDenied, afterDenied)
    if (deniedSessions.length < 1) {
      throw new Error(`No new denied session detected for ${model}`)
    }
    validateDeniedSession(path.join(stateRoot, "sessions", deniedSessions.at(-1)))
  }

  const activeSessionsPath = path.join(stateRoot, "active-sessions.json")
  if (fs.existsSync(activeSessionsPath)) {
    const activeText = fs.readFileSync(activeSessionsPath, "utf8").trim()
    if (activeText !== "{}") {
      throw new Error(`Expected active sessions to be empty but got: ${activeText}`)
    }
  }

  console.log(`Smoke tests passed for models: ${options.models.join(", ")}`)
}

main()
