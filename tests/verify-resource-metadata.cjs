const assert = require("node:assert")
const fs = require("node:fs")
const path = require("node:path")

const repoRoot = path.resolve(__dirname, "..")

function listFiles(dirPath, predicate) {
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(dirPath, entry.name))
}

function listSkillFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      folderName: entry.name,
      filePath: path.join(dirPath, entry.name, "SKILL.md")
    }))
}

function extractFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(match, `expected frontmatter in ${filePath}`)
  return match[1]
}

function readField(frontmatter, fieldName) {
  const match = frontmatter.match(new RegExp(`^${fieldName}:\s*(.+)$`, "m"))
  return match ? match[1].trim() : null
}

function assertSingleQuoted(value, label) {
  assert.ok(/^'.+'$/.test(value), `${label} should be wrapped in single quotes`) 
}

function assertLowerHyphen(value, label) {
  assert.ok(/^[a-z0-9-]+$/.test(value), `${label} should be lowercase with hyphens`) 
}

const agentFiles = listFiles(path.join(repoRoot, "agents"), (name) => name.endsWith(".agent.md"))
for (const filePath of agentFiles) {
  const fileName = path.basename(filePath)
  assert.ok(/^[a-z0-9-]+\.agent\.md$/.test(fileName), `invalid agent file name: ${fileName}`)
  const frontmatter = extractFrontmatter(filePath)
  const name = readField(frontmatter, "name")
  const description = readField(frontmatter, "description")
  const model = readField(frontmatter, "model")
  assert.ok(name, `missing agent name in ${filePath}`)
  assertLowerHyphen(name, `agent name in ${filePath}`)
  assert.ok(description, `missing agent description in ${filePath}`)
  assertSingleQuoted(description, `agent description in ${filePath}`)
  if (model) {
    assertSingleQuoted(model, `agent model in ${filePath}`)
  }
}

const skillEntries = listSkillFiles(path.join(repoRoot, "skills"))
for (const { folderName, filePath } of skillEntries) {
  assert.ok(fs.existsSync(filePath), `missing SKILL.md in ${folderName}`)
  assertLowerHyphen(folderName, `skill folder ${folderName}`)
  const frontmatter = extractFrontmatter(filePath)
  const name = readField(frontmatter, "name")
  const description = readField(frontmatter, "description")
  assert.equal(name, folderName, `skill name must match folder for ${folderName}`)
  assert.ok(description, `missing skill description in ${filePath}`)
  assertSingleQuoted(description, `skill description in ${filePath}`)
  const unquoted = description.slice(1, -1)
  assert.ok(unquoted.length >= 10, `skill description too short in ${filePath}`)
  assert.ok(unquoted.length <= 1024, `skill description too long in ${filePath}`)
}

console.log("Resource metadata verification passed.")
