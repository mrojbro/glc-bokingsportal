import {
  FIXED_OUTPUT_VALUES,
  GODS_ANTAL_FACTOR,
  KOLLI_VIKT_FACTOR,
  OUTPUT_COLUMNS,
  type OutputColumn,
} from './constants'
import {
  CUSTOMER_REGISTER_LOOKUP,
  findCustomerRegisterEntry,
  normalizeMottagareKey,
} from './customerRegister'
import { formatCompactIsoDate, getTomorrowDate } from './getTomorrowDate'
import type { InputRow, OutputRow } from './types'

export interface TransformResult {
  rows: OutputRow[]
  unmatchedMottagare: string[]
  registerMatched: boolean[]
}

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

function formatOutputNumber(value: number): string {
  if (value <= 0) return ''
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

/** Special output rules based on Mott. Namn. */
export function applyMottNamnRules(row: OutputRow): void {
  if (normalizeMottagareKey(row['Mott. Namn']) === normalizeMottagareKey('Bakels')) {
    row.Littera = 'Göteborg Distribution'
    row.Tjänst = 'DISTTRPTIM'
    return
  }

  row.Littera = FIXED_OUTPUT_VALUES.Littera ?? ''
  row.Tjänst = FIXED_OUTPUT_VALUES.Tjänst ?? ''
}

export function transformInputRow(
  input: InputRow,
  deliveryDate: string,
  lookup = CUSTOMER_REGISTER_LOOKUP,
): { row: OutputRow; matchedRegister: boolean } {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = deliveryDate
  row['Mott. Namn'] = input.mottNamn
  const antal = formatOutputNumber(input.quantity)
  row['Kolli antal'] = antal
  row['Gods antal1'] = formatOutputNumber(input.quantity * GODS_ANTAL_FACTOR)
  row['Kolli vikt'] = formatOutputNumber(input.quantity * KOLLI_VIKT_FACTOR)

  const registerEntry = findCustomerRegisterEntry(lookup, input.mottNamn)
  if (registerEntry) {
    row.Kundnr = registerEntry.kundnr
    row['Mott. Adress'] = registerEntry.adress
    row['Mott. Postnr'] = registerEntry.postnr
    row['Mott. Postort'] = registerEntry.postort
    row.Fraktsedel = `${registerEntry.fakeKundnr}-${formatCompactIsoDate(deliveryDate)}`
  }

  applyMottNamnRules(row)
  return { row, matchedRegister: !!registerEntry }
}

export function transformInputRows(
  inputs: InputRow[],
  deliveryDate?: string,
  lookup = CUSTOMER_REGISTER_LOOKUP,
): TransformResult {
  const date = deliveryDate ?? getTomorrowDate()
  const rows: OutputRow[] = []
  const unmatchedMottagare: string[] = []
  const registerMatched: boolean[] = []

  for (const input of inputs) {
    const { row, matchedRegister } = transformInputRow(input, date, lookup)
    rows.push(row)
    registerMatched.push(matchedRegister)
    if (!matchedRegister) {
      unmatchedMottagare.push(input.mottNamn)
    }
  }

  return { rows, unmatchedMottagare, registerMatched }
}

export function createBlankOutputRow(): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = getTomorrowDate()
  return row
}
