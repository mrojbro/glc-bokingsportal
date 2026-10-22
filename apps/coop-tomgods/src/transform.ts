import {
  FIXED_OUTPUT_VALUES,
  OUTPUT_COLUMNS,
  TYPED_VIKT_PER_LASTBARARE,
  VIKT_PER_LASTBARARE,
  VOLYM_PER_LASTBARARE,
  type Lastbarartyp,
  type OutputColumn,
} from './constants'
import { lookupLeverantor, usesTypedVikt } from './leverantorRegister'
import type { OutputRow } from './types'

function emptyOutputRow(): OutputRow {
  return Object.fromEntries(
    OUTPUT_COLUMNS.map((col) => [col, '']),
  ) as unknown as OutputRow
}

function applyFixedOutputValues(row: OutputRow): void {
  for (const col of Object.keys(FIXED_OUTPUT_VALUES) as OutputColumn[]) {
    const value = FIXED_OUTPUT_VALUES[col]
    if (value !== undefined) row[col] = value
  }
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

function kgPerLastbarare(leverantor: string, lastbarartyp: string): number | undefined {
  if (!usesTypedVikt(leverantor)) return VIKT_PER_LASTBARARE
  return TYPED_VIKT_PER_LASTBARARE[lastbarartyp as Lastbarartyp]
}

function viktFromAntalLastbarare(
  value: string | number | undefined,
  leverantor: string,
  lastbarartyp: string,
): string {
  const antal = parseNumber(value)
  if (antal <= 0) return ''
  const kg = kgPerLastbarare(leverantor, lastbarartyp)
  if (kg == null) return ''
  return String(antal * kg)
}

function volymFromAntalLastbarare(value: string | number | undefined): string {
  const antal = parseNumber(value)
  if (antal <= 0) return ''
  return String(antal * VOLYM_PER_LASTBARARE)
}

function applyLeverantorFields(row: OutputRow, leverantor: string): void {
  const entry = lookupLeverantor(leverantor)
  if (!entry) return
  row.mottagarnamn = entry.mottagarnamn
  row.mottagarnummer = entry.mottagarnummer
  row.leveransplats = entry.leveransplats
  if (entry.varuslag) {
    row.varuslagForeHamtdatum = entry.varuslag
    row.varuslagEfterHamtdatum = entry.varuslag
  }
}

export interface ManualOutputRowInput {
  leverantor: string
  date: string
  antalLastbarare: string
  antalPpl: string
  lastbarartyp: string
}

export function createManualOutputRow(input: ManualOutputRowInput): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.leveransdatum = input.date
  row.hamtdatum = input.date
  row.antalLastbarare = input.antalLastbarare
  row.antalPpl = input.antalPpl
  row.lastbarartyp = input.lastbarartyp
  row.vikt = viktFromAntalLastbarare(
    input.antalLastbarare,
    input.leverantor,
    input.lastbarartyp,
  )
  row.volym = volymFromAntalLastbarare(input.antalLastbarare)
  applyLeverantorFields(row, input.leverantor)
  return row
}
