import fs from 'fs'
import XLSX from 'xlsx'

const excelPath =
  'c:/Users/Win/Downloads/Namnlöst kalkylark (5).xlsx'
const outPath = 'src/kaka/timeRegister.ts'

function excelTimeToHHMM(value) {
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const totalMin = Math.round(value * 24 * 60)
    const h = Math.floor(totalMin / 60) % 24
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const s = String(value ?? '').trim()
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':')
    return `${String(h).padStart(2, '0')}:${m}`
  }
  return s
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const workbook = XLSX.readFile(excelPath, { cellDates: true })
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
  defval: '',
})

const map = new Map()
for (const row of rows) {
  const littera = String(row.Littera ?? '').trim()
  const mottNamn = String(row.Namn ?? '').trim()
  if (!littera || !mottNamn) continue

  const key = `${littera.toLocaleLowerCase('sv')}\0${mottNamn.toLocaleLowerCase('sv')}`
  if (map.has(key)) continue

  map.set(key, {
    littera,
    mottNamn,
    startid: excelTimeToHHMM(row.Startid),
    sluttid: excelTimeToHHMM(row.Sluttid),
  })
}

const entries = [...map.values()].sort(
  (a, b) =>
    a.littera.localeCompare(b.littera, 'sv') ||
    a.mottNamn.localeCompare(b.mottNamn, 'sv'),
)

let output = `/** Lookup: Littera + Mott. Namn → Startid + Sluttid */
export interface TimeRegisterEntry {
  littera: string
  mottNamn: string
  startid: string
  sluttid: string
}

/** Imported from Namnlöst kalkylark (5).xlsx — ${entries.length} unique rows */
export const TIME_REGISTER: TimeRegisterEntry[] = [
`

for (const entry of entries) {
  output += `  { littera: '${esc(entry.littera)}', mottNamn: '${esc(entry.mottNamn)}', startid: '${esc(entry.startid)}', sluttid: '${esc(entry.sluttid)}' },\n`
}

output += `]

function registerKey(littera: string, mottNamn: string): string {
  return \`\${littera.trim().toLocaleLowerCase('sv')}\\0\${mottNamn.trim().toLocaleLowerCase('sv')}\`
}

const TIME_REGISTER_MAP = new Map(
  TIME_REGISTER.map((entry) => [
    registerKey(entry.littera, entry.mottNamn),
    { startid: entry.startid, sluttid: entry.sluttid },
  ]),
)

export function lookupTimes(
  littera: string,
  mottNamn: string,
): { startid: string; sluttid: string } | undefined {
  if (!littera.trim() || !mottNamn.trim()) return undefined
  return TIME_REGISTER_MAP.get(registerKey(littera, mottNamn))
}
`

fs.writeFileSync(outPath, output, 'utf8')
console.log(`Wrote ${entries.length} entries to ${outPath}`)
