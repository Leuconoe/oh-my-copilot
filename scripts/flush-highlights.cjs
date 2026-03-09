const fs = require("node:fs")
const path = require("node:path")
const { resolveStateRoot } = require("./lib/highlights-runtime.cjs")

function parseArgs(argv) {
  const options = {
    cwd: process.cwd(),
    dryRun: false,
    yes: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--cwd") {
      options.cwd = argv[index + 1] || options.cwd
      index += 1
      continue
    }
    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }
    if (arg === "--yes" || arg === "-y") {
      options.yes = true
    }
  }

  options.cwd = path.resolve(options.cwd)
  return options
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const target = resolveStateRoot(options.cwd)

  if (path.basename(target) !== ".copilot-highlights") {
    console.error(`Refusing to touch unexpected path: ${target}`)
    process.exit(1)
  }

  if (!fs.existsSync(target)) {
    console.log(`No highlights directory found at ${target}`)
    return
  }

  if (options.dryRun) {
    console.log(`Would remove ${target}`)
    return
  }

  if (!options.yes) {
    console.log(`Refusing to delete without --yes. Target: ${target}`)
    return
  }

  fs.rmSync(target, { recursive: true, force: true })
  console.log(`Removed ${target}`)
}

main()
