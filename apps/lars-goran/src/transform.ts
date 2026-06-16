import {
  CONSIGNEE_KEYWORDS,
  FIXED_OUTPUT_VALUES,
  OUTPUT_COLUMNS,
  type OutputColumn,
} from './constants'
import { getTomorrowDate } from './getTomorrowDate'
import { normalizeHeaderName } from './normalizeHeader'
import {
  kolliAntalFromViktAndAverage,
  lookupConsignee,
} from './consigneeRegister'
import { parseWeightKg } from './parseWeightKg'
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

function formatOutputNumber(value: number): string {
  if (value <= 0) return ''
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

/** Only rows where Consignee contains Foodora or Trofo. */
export function matchesConsigneeFilter(input: InputRow): boolean {
  const consignee = cellToString(input.Consignee).toLowerCase()
  if (!consignee) return false
  return CONSIGNEE_KEYWORDS.some((kw) => consignee.includes(kw))
}

function isEmptyDataRow(input: InputRow): boolean {
  return (
    !cellToString(input.Consignee) &&
    !cellToString(input['Shipment reference']) &&
    parseWeightKg(input['Weight (kg)']) <= 0
  )
}

export function transformInputRow(input: InputRow, deliveryDate: string): OutputRow | null {
  if (!matchesConsigneeFilter(input) || isEmptyDataRow(input)) return null

  const consignee = cellToString(input.Consignee)
  const register = lookupConsignee(consignee)
  const kolliVikt = parseWeightKg(input['Weight (kg)'])

  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = deliveryDate
  row.Fraktsedel = cellToString(input['Shipment reference'])
  row['Mott. Namn'] = consignee
  row['Kolli vikt'] = formatOutputNumber(kolliVikt)

  if (register) {
    row['Mott. Adress'] = register.adress
    row['Mott. Postnr'] = register.postnr
    row['Mott. Postort'] = register.postort
    const kolliAntal = kolliAntalFromViktAndAverage(kolliVikt, register.average)
    if (kolliAntal > 0) {
      const antal = String(kolliAntal)
      row['Kolli antal'] = antal
      row['Gods antal1'] = antal
    }
  } else {
    row['Mott. Postort'] = cellToString(input['Consignee city'])
  }

  return row
}

export function transformInputRows(
  inputs: InputRow[],
  deliveryDate?: string,
): OutputRow[] {
  const date = deliveryDate ?? getTomorrowDate()
  return inputs
    .map((input) => transformInputRow(input, date))
    .filter((row): row is OutputRow => row !== null)
}

export function createBlankOutputRow(): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = getTomorrowDate()
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
