import {
  FIXED_OUTPUT_VALUES,
  OUTPUT_COLUMNS,
  type OutputColumn,
} from './constants'
import { formatTelefonnr } from './formatTelefonnr'
import { getTomorrowDate } from './getTomorrowDate'
import { applyInbaringFields } from './applyInbaringFields'
import { litteraForDate } from './litteraForDate'
import { normalizeHeaderName } from './normalizeHeader'
import type { InputColumn } from './constants'
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

function isEmptyDataRow(input: InputRow): boolean {
  return (
    !cellToString(input.Kund) &&
    !cellToString(input.Gata) &&
    !cellToString(input.Ordernr) &&
    parseNumber(input.Bruttovikt) <= 0
  )
}

export function transformInputRow(input: InputRow, tomorrow: string): OutputRow | null {
  if (isEmptyDataRow(input)) return null

  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = tomorrow
  row.Littera = litteraForDate(tomorrow)
  row.Fraktsedel = cellToString(input.Ordernr)
  row['Mott. Namn'] = cellToString(input.Kund)
  row['Mott. Adress'] = cellToString(input.Gata)
  row['Mott. Postnr'] = cellToString(input.Postnr)
  row['Mott. Postort'] = cellToString(input.Ort)
  row['Kolli vikt'] = formatOutputNumber(parseNumber(input.Bruttovikt))
  applyInbaringFields(row, { meddelande: cellToString(input.Meddelande) })
  row.Telefonnr = formatTelefonnr(cellToString(input.Telefonnummer))

  return row
}

export function transformInputRows(inputs: InputRow[]): OutputRow[] {
  const tomorrow = getTomorrowDate()
  return inputs
    .map((input) => transformInputRow(input, tomorrow))
    .filter((row): row is OutputRow => row !== null)
}

export function createBlankOutputRow(): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  const tomorrow = getTomorrowDate()
  row.Datum = tomorrow
  row.Littera = litteraForDate(tomorrow)
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
