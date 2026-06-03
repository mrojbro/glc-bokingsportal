import {
  FIXED_OUTPUT_VALUES,
  KOLLI_ANTAL_DIVISOR,
  OUTPUT_COLUMNS,
} from './constants'
import { getTomorrowDate, getTomorrowDateCompact } from './getTomorrowDate'
import { normalizeHeaderName } from './normalizeHeader'
import { applyPostortTimes } from './postortRegister'
import { splitPostnrOrt } from './splitPostnrOrt'
import type { InputColumn, OutputColumn } from './constants'
import type { InputRow, OutputRow } from './types'

function emptyOutputRow(): OutputRow {
  return Object.fromEntries(
    OUTPUT_COLUMNS.map((col) => [col, '']),
  ) as OutputRow
}

function applyFixedOutputValues(row: OutputRow): void {
  for (const col of Object.keys(FIXED_OUTPUT_VALUES) as OutputColumn[]) {
    const value = FIXED_OUTPUT_VALUES[col]
    if (value !== undefined) row[col] = value
  }
}

function cellToString(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function namnKey(namn: string): string {
  return namn.trim().toLowerCase()
}

function dedupeKey(namn: string, adress: string, postLine: string): string {
  return `${namnKey(namn)}\x1f${adress.toLowerCase()}\x1f${postLine.toLowerCase()}`
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

function formatOutputNumber(value: number): string {
  if (value <= 0) return ''
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

function buildBudgetViktByNamn(inputs: InputRow[]): Map<string, number> {
  const sums = new Map<string, number>()
  for (const input of inputs) {
    const namn = cellToString(input['Leveransadress 1'])
    if (!namn) continue
    const key = namnKey(namn)
    const prev = sums.get(key) ?? 0
    sums.set(key, prev + parseNumber(input['Budget vikt']))
  }
  return sums
}

/** Kolli vikt ÷ 390, rounded up. */
export function kolliAntalFromVikt(kolliVikt: number): number {
  if (kolliVikt <= 0) return 0
  return Math.ceil(kolliVikt / KOLLI_ANTAL_DIVISOR)
}

function applyKolliAntalFromVikt(row: OutputRow, kolliVikt: number): void {
  const antal = kolliAntalFromVikt(kolliVikt)
  if (antal <= 0) return
  const formatted = String(antal)
  row['Kolli antal'] = formatted
  row['Gods antal1'] = formatted
}

function buildFraktsedel(företagskod: string, tomorrowCompact: string): string {
  const kod = företagskod.trim()
  if (!kod) return tomorrowCompact
  return `${kod}-${tomorrowCompact}`
}

/** One output row per unique (namn, adress, post) triple. */
export function transformInputRows(inputs: InputRow[]): OutputRow[] {
  const seen = new Set<string>()
  const results: OutputRow[] = []
  const budgetViktByNamn = buildBudgetViktByNamn(inputs)
  const tomorrow = getTomorrowDate()
  const tomorrowCompact = getTomorrowDateCompact()

  for (const input of inputs) {
    const namn = cellToString(input['Leveransadress 1'])
    const adress = cellToString(input['Leveransadress 3'])
    const postLine = cellToString(input['Leveransadress 4'])

    if (!namn && !adress && !postLine) continue

    const key = dedupeKey(namn, adress, postLine)
    if (seen.has(key)) continue
    seen.add(key)

    const { postnr, postort } = splitPostnrOrt(postLine)
    const row = emptyOutputRow()
    applyFixedOutputValues(row)
    row['Mott. Namn'] = namn
    row['Mott. Adress'] = adress
    row['Mott. Postnr'] = postnr
    row['Mott. Postort'] = postort
    applyPostortTimes(row)
    row['Datum'] = tomorrow
    row.Fraktsedel = buildFraktsedel(
      cellToString(input['Företagskod']),
      tomorrowCompact,
    )
    const kolliVikt = budgetViktByNamn.get(namnKey(namn)) ?? 0
    row['Kolli vikt'] = formatOutputNumber(kolliVikt)
    applyKolliAntalFromVikt(row, kolliVikt)
    results.push(row)
  }

  return results
}

export function createBlankOutputRow(): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  applyPostortTimes(row)
  row['Datum'] = getTomorrowDate()
  return row
}

export function normalizeInputRow(
  raw: Record<string, unknown>,
  headerMap: Map<string, InputColumn>,
): InputRow {
  const row: InputRow = {}
  for (const [header, value] of Object.entries(raw)) {
    const column = headerMap.get(normalizeHeaderName(header))
    if (!column) continue
    if (typeof value === 'number') {
      row[column] = value
    } else {
      row[column] = value == null ? '' : String(value)
    }
  }
  return row
}
