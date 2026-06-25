import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const registerPath = path.join(appDir, 'src/data/customerRegister.json')

const entries = JSON.parse(fs.readFileSync(registerPath, 'utf8'))
const used = new Set(
  entries
    .map((entry) => String(entry.fakeKundnr ?? '').trim())
    .filter(Boolean),
)

function nextFakeKundnr() {
  for (let attempt = 0; attempt < 10000; attempt++) {
    const value = String(Math.floor(10000 + Math.random() * 90000))
    if (!used.has(value)) {
      used.add(value)
      return value
    }
  }
  throw new Error('Could not generate a unique 5-digit fakeKundnr.')
}

let assigned = 0
for (const entry of entries) {
  if (entry.fakeKundnr) continue
  entry.fakeKundnr = nextFakeKundnr()
  assigned += 1
}

fs.writeFileSync(registerPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`Assigned ${assigned} fakeKundnr value(s) in ${registerPath}`)
