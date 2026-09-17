import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const excelPath =
  process.argv[2] ?? 'C:/Users/martin.rojbro/Desktop/Bok1.xlsx'
const outPath = path.join(appDir, 'src/data/postnrRegister.json')

function cellText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function normalizePostnr(value) {
  return cellText(value).replace(/\s+/g, '')
}

function pickColumn(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim() !== '') {
      return row[name]
    }
  }
  const keys = Object.keys(row)
  for (const name of names) {
    const match = keys.find((key) => key.trim().toLowerCase() === name.toLowerCase())
    if (match) return row[match]
  }
  return ''
}

const workbook = XLSX.readFile(excelPath, { raw: false })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })

const entries = []
const seen = new Set()

for (const row of rows) {
  const postnr = normalizePostnr(
    pickColumn(row, ['Postnr', 'Postnummer', 'Mott. Postnr']),
  )
  if (!postnr) continue
  if (seen.has(postnr)) continue
  seen.add(postnr)

  entries.push({
    postnr,
    transportinstruktion: cellText(
      pickColumn(row, [
        'Sorteringskod v1',
        'Sorteringskod',
        'Transportinstruktion',
        'Chaufförsinstruktion',
      ]),
    ),
  })
}

entries.sort((a, b) => a.postnr.localeCompare(b.postnr, 'sv'))

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`Wrote ${entries.length} entries to ${outPath}`)
