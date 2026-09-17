import {
  FIXED_OUTPUT_VALUES,
  INPUT_COLUMNS,
  OUTPUT_COLUMNS,
  type InputColumn,
  type OutputColumn,
} from './constants'
import { normalizeHeaderName } from './normalizeHeader'
import {
  applyTransportinstruktion,
  type PostnrRegisterEntry,
  buildPostnrRegisterLookup,
} from './postnrRegister'
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
  return cellToString(value).replace(/\s+/g, '')
}

function excelSerialToIso(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000
  const date = new Date(utc)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    return excelSerialToIso(serial)
  }

  const dmy = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/)
  if (dmy) {
    const day = dmy[1].padStart(2, '0')
    const month = dmy[2].padStart(2, '0')
    return `${dmy[3]}-${month}-${day}`
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
  if (registerLookup) applyTransportinstruktion(row, registerLookup)
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

export function transformInputRows(
  inputs: InputRow[],
  register?: readonly PostnrRegisterEntry[],
): OutputRow[] {
  const lookup = register ? buildPostnrRegisterLookup(register) : undefined
  const rows = inputs.flatMap((input) => {
    const row = transformInputRow(input, lookup)
    return row ? [row] : []
  })
  return sortOutputRows(rows)
}

export function applyRegisterToOutputRows(
  rows: OutputRow[],
  register: readonly PostnrRegisterEntry[],
): OutputRow[] {
  const lookup = buildPostnrRegisterLookup(register)
  const updated = rows.map((row) => {
    const next = { ...row }
    applyTransportinstruktion(next, lookup)
    return next
  })
  return sortOutputRows(updated)
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
