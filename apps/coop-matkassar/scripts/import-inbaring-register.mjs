import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const excelPath =
  process.argv[2] ?? 'C:/Users/Win/Downloads/Coop Inbärning.xlsx'
const outPath = path.join(appDir, 'src/inbaringRegister.ts')

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeAddress(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('sv')
}

const workbook = XLSX.readFile(excelPath, { raw: false })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

const seen = new Set()
const addresses = []

for (const row of rows) {
  const raw =
    row['Default shipment address'] ??
    row.Adress ??
    row.adress ??
    Object.values(row)[0]
  const adress = String(raw ?? '').trim().replace(/\s+/g, ' ')
  if (!adress) continue
  const key = normalizeAddress(adress)
  if (seen.has(key)) continue
  seen.add(key)
  addresses.push(adress)
}

addresses.sort((a, b) => a.localeCompare(b, 'sv'))

let output = `/** Inbärningsadresser — importerade från Coop Inbärning.xlsx (${addresses.length} adresser) */
export interface InbaringRegisterEntry {
  adress: string
  inbaring: true
}

export const INBARING_REGISTER: InbaringRegisterEntry[] = [
`

for (const adress of addresses) {
  output += `  { adress: '${esc(adress)}', inbaring: true },\n`
}

output += `]

export function normalizeMottAdress(adress: string): string {
  return adress.trim().replace(/\\s+/g, ' ').toLocaleLowerCase('sv')
}

const INBARING_ADDRESS_KEYS = new Set(
  INBARING_REGISTER.map((entry) => normalizeMottAdress(entry.adress)),
)

/** True when Mott. Adress matches the built-in inbärningsregister. */
export function isInbaringAddress(mottAdress: string): boolean {
  const key = normalizeMottAdress(mottAdress)
  if (!key) return false
  return INBARING_ADDRESS_KEYS.has(key)
}
`

fs.writeFileSync(outPath, output, 'utf8')
console.log(`Wrote ${addresses.length} addresses to ${outPath}`)
