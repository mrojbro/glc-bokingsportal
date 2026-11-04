import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const excelPath =
  process.argv[2] ?? 'C:/Users/martin.rojbro/Desktop/CoopRegisterMottAdress.xlsx'
const outPath = path.join(appDir, 'src/data/mottAdressRegister.json')

function cellText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().replace(/\s+/g, ' ')
}

function formatPostnr(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length === 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return cellText(value)
}

function matchKey(adress) {
  const cleaned = cellText(adress).toLocaleLowerCase('sv')
  if (!cleaned) return ''
  return cleaned.normalize('NFD').replace(/\p{M}/gu, '')
}

function pickColumn(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim() !== '') {
      return row[name]
    }
  }
  const keys = Object.keys(row)
  for (const name of names) {
    const match = keys.find(
      (key) => key.trim().toLowerCase() === name.toLowerCase(),
    )
    if (match) return row[match]
  }
  return ''
}

const workbook = XLSX.readFile(excelPath, { raw: false })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })

const byKey = new Map()

for (const row of rows) {
  const adress = cellText(
    pickColumn(row, ['Mott. Adress', 'Adress', 'Gata']),
  )
  const key = matchKey(adress)
  if (!key) continue

  byKey.set(key, {
    adress,
    postnr: formatPostnr(pickColumn(row, ['Mott. Postnr', 'Postnr'])),
    postort: cellText(pickColumn(row, ['Mott. Postort', 'Postort', 'Ort'])),
  })
}

const entries = [...byKey.values()].sort((a, b) =>
  a.adress.localeCompare(b.adress, 'sv'),
)

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`Wrote ${entries.length} addresses to ${outPath}`)
