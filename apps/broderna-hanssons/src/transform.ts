import {
  FIXED_OUTPUT_VALUES,
  INPUT_COLUMNS,
  OUTPUT_COLUMNS,
  type InputColumn,
  type OutputColumn,
} from './constants'
import { normalizeHeaderName } from './normalizeHeader'
import { POSTNR_REGISTER_LOOKUP, applyPostnrRewrite, applyRegisterLookups, normalizePostnr } from './postnrRegister'
import { applyKolliHalvpallRule, formatDecimal2, lookupGodsslag, resolveGodsAntal1, resolveGodsSort1, resolveKolliAntal } from './godsslagRegister'
import type { InputRow, OutputRow } from './types'

function emptyOutputRow(): OutputRow {
  return Object.fromEntries(
    OUTPUT_COLUMNS.map((col) => [col, '']),
  ) as OutputRow
}

function cellToString(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function formatPostnr(value: string | number | undefined): string {
  return normalizePostnr(cellToString(value))
}

function excelSerialToIso(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000
  const date = new Date(utc)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function expandYear(year: string): string {
  if (year.length === 4) return year
  const n = Number(year)
  if (!Number.isFinite(n)) return year
  return n >= 70 ? `19${year.padStart(2, '0')}` : `20${year.padStart(2, '0')}`
}

function toIsoDate(year: string, month: string, day: string): string {
  return `${expandYear(year)}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatDatum(value: string | number | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 20000) {
    return excelSerialToIso(value)
  }

  const raw = cellToString(value)
  if (!raw) return ''

  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]

  const serial = Number(raw.replace(',', '.'))
  if (
    Number.isFinite(serial) &&
    serial > 20000 &&
    serial < 80000 &&
    !/[./-]/.test(raw)
  ) {
    return excelSerialToIso(serial)
  }

  const parts = raw.match(/^(\d{1,2})([./-])(\d{1,2})\2(\d{2}|\d{4})(?:\b|$)/)
  if (parts) {
    const first = Number(parts[1])
    const second = Number(parts[3])
    const year = parts[4]
    const separator = parts[2]
    if (second > 12) return toIsoDate(year, parts[1], parts[3])
    if (first > 12) return toIsoDate(year, parts[3], parts[1])
    if (separator === '/') return toIsoDate(year, parts[1], parts[3])
    return toIsoDate(year, parts[3], parts[1])
  }

  return raw
}

function applyFixedOutputValues(row: OutputRow): void {
  for (const col of Object.keys(FIXED_OUTPUT_VALUES) as OutputColumn[]) {
    const value = FIXED_OUTPUT_VALUES[col]
    if (value !== undefined) row[col] = value
  }
}

function isEmptyInputRow(input: InputRow): boolean {
  return INPUT_COLUMNS.every((col) => !cellToString(input[col]))
}

export function applyGodsDerivedFields(row: OutputRow): void {
  row['Gods antal1'] = resolveGodsAntal1(row.Godsslag, row['Kolli antal'])
  row['Gods sort1'] = resolveGodsSort1(row.Godsslag)
}

export function transformInputRow(
  input: InputRow,
  registerLookup?: ReadonlyMap<string, string>,
): OutputRow | null {
  if (isEmptyInputRow(input)) return null

  const row = emptyOutputRow()
  applyFixedOutputValues(row)
  row.Datum = formatDatum(input.Datum)
  row.Fraktsedel = cellToString(input.Sedelnummer)
  row.Märkning = cellToString(input.Märkning)
  row['Mott. Namn'] = cellToString(input['Angöring Namn - Sista'])
  row['Mott. Adress'] = cellToString(input['Angöring Adress - Sista'])
  row['Mott. Postnr'] = formatPostnr(input['Angöring Postnr - Sista'])
  row['Mott. Postort'] = cellToString(input['Angöring Postort - Sista'])
  applyPostnrRewrite(row)
  if (registerLookup) applyRegisterLookups(row, registerLookup)
  const godsslag = applyKolliHalvpallRule(
    lookupGodsslag(cellToString(input.Kollislag)),
    input.Vikt,
  )
  row.Godsslag = godsslag.godsslag
  row['Kolli antal'] = resolveKolliAntal(
    input.Kolli,
    input.Pallplats,
    input.Vikt,
    godsslag.godsslag,
    godsslag.kolliAntal,
  )
  row['Kolli vikt'] = formatDecimal2(input.Vikt)
  applyGodsDerivedFields(row)
  return row
}

export function sortOutputRows(rows: OutputRow[]): OutputRow[] {
  return [...rows].sort((a, b) => {
    const byInstruction = a.Chaufförsinstruktion.localeCompare(
      b.Chaufförsinstruktion,
      'sv',
      { sensitivity: 'base' },
    )
    if (byInstruction !== 0) return byInstruction

    const byPostort = a['Mott. Postort'].localeCompare(b['Mott. Postort'], 'sv', {
      sensitivity: 'base',
    })
    if (byPostort !== 0) return byPostort

    return a['Mott. Namn'].localeCompare(b['Mott. Namn'], 'sv', {
      sensitivity: 'base',
    })
  })
}

export function transformInputRows(inputs: InputRow[]): OutputRow[] {
  const rows = inputs.flatMap((input) => {
    const row = transformInputRow(input, POSTNR_REGISTER_LOOKUP)
    return row ? [row] : []
  })
  return sortOutputRows(rows)
}

export function createBlankOutputRow(): OutputRow {
  const row = emptyOutputRow()
  applyFixedOutputValues(row)
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
