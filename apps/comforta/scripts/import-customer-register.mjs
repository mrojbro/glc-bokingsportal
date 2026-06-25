import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const excelPath =
  process.argv[2] ?? 'C:/Users/Win/Downloads/ComfortaRegister.xlsx'
const outPath = path.join(appDir, 'src/data/customerRegister.json')

function cellText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function normalizeKey(value) {
  return cellText(value).toLocaleLowerCase('sv').replace(/\s+/g, ' ')
}

function loadExistingFakeNumbers() {
  const map = new Map()
  if (!fs.existsSync(outPath)) return map
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'))
    for (const entry of existing) {
      const key = normalizeKey(entry.mottagare)
      if (key && entry.fakeKundnr) map.set(key, String(entry.fakeKundnr))
    }
  } catch {
    // ignore invalid existing file
  }
  return map
}

function createFakeKundnrGenerator(existingValues) {
  const used = new Set(existingValues)
  return () => {
    for (let attempt = 0; attempt < 10000; attempt++) {
      const value = String(Math.floor(10000 + Math.random() * 90000))
      if (!used.has(value)) {
        used.add(value)
        return value
      }
    }
    throw new Error('Could not generate a unique 5-digit fakeKundnr.')
  }
}

const existingFakeByMottagare = loadExistingFakeNumbers()
const nextFakeKundnr = createFakeKundnrGenerator([...existingFakeByMottagare.values()])

const workbook = XLSX.readFile(excelPath, { raw: false })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

const entries = []
const seen = new Set()

for (const row of rows) {
  const mottagare = cellText(row.Mottagare)
  if (!mottagare) continue

  const key = normalizeKey(mottagare)
  if (seen.has(key)) continue
  seen.add(key)

  const fakeKundnr =
    existingFakeByMottagare.get(key) ?? nextFakeKundnr()

  entries.push({
    mottagare,
    adress: cellText(row.Adress),
    postnr: cellText(row.Postnr),
    postort: cellText(row.Postort),
    kundnr: cellText(row.Kundnr),
    fakeKundnr,
  })
}

entries.sort((a, b) => a.mottagare.localeCompare(b.mottagare, 'sv'))

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`Wrote ${entries.length} entries to ${outPath}`)
