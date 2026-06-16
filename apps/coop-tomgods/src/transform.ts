import {
  FIXED_OUTPUT_VALUES,
  OUTPUT_COLUMNS,
  VIKT_PER_LASTBARARE,
  VOLYM_PER_LASTBARARE,
  type OutputColumn,
} from './constants'
import { lookupLeverantor } from './leverantorRegister'
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

function viktFromAntalLastbarare(value: string | number | undefined): string {
  const antal = parseNumber(value)
  if (antal <= 0) return ''
  return String(antal * VIKT_PER_LASTBARARE)
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
  row.vikt = viktFromAntalLastbarare(input.antalLastbarare)
  row.volym = volymFromAntalLastbarare(input.antalLastbarare)
  applyLeverantorFields(row, input.leverantor)
  return row
}
