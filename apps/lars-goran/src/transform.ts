import {
  ALLOWED_CARRIERS,
  CARRIER_OUTPUT_PRESETS,
  DEFAULT_CARRIER,
  FIXED_OUTPUT_VALUES,
  OUTPUT_COLUMNS,
  normalizeCarrierName,
  type InputColumn,
  type OutputColumn,
} from './constants'
import { getTomorrowDate, shiftIsoDate } from './getTomorrowDate'
import { normalizeHeaderName } from './normalizeHeader'
import {
  kolliAntalFromViktAndAverage,
  lookupConsignee,
  nowasteKolliAverage,
} from './consigneeRegister'
import {
  applyNowasteDeliveryWindow,
  NOWASTE_KUNDR,
} from './nowastePostortWindows'
import { parseWeightKg } from './parseWeightKg'
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

function formatOutputNumber(value: number): string {
  if (value <= 0) return ''
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

const ALLOWED_CARRIER_KEYS = new Set(
  ALLOWED_CARRIERS.map((name) => normalizeCarrierName(name)),
)

const CARRIER_PRESET_BY_KEY = new Map(
  ALLOWED_CARRIERS.map((name) => [normalizeCarrierName(name), name] as const),
)

const GLC_CARRIER_KEY = normalizeCarrierName('GLC Distribution Gbg')

/** Only rows whose Carrier is P-frakt Åkeri or GLC Distribution Gbg. */
export function matchesCarrierFilter(input: InputRow): boolean {
  const carrier = normalizeCarrierName(cellToString(input.Carrier))
  if (!carrier) return false
  return ALLOWED_CARRIER_KEYS.has(carrier)
}

function applyFixedOutputValues(row: OutputRow, carrierRaw?: string): void {
  const carrierKey = normalizeCarrierName(cellToString(carrierRaw))
  const carrierName =
    (carrierKey && CARRIER_PRESET_BY_KEY.get(carrierKey)) || DEFAULT_CARRIER
  const values = {
    ...FIXED_OUTPUT_VALUES,
    ...CARRIER_OUTPUT_PRESETS[carrierName],
  }
  for (const col of Object.keys(values) as OutputColumn[]) {
    const value = values[col]
    if (value !== undefined) row[col] = value
  }
}

function isEmptyDataRow(input: InputRow): boolean {
  return (
    !cellToString(input.Consignee) &&
    !cellToString(input['Shipment reference']) &&
    parseWeightKg(input['Weight (kg)']) <= 0
  )
}

/** Nowaste (115343) is always one calendar day before the Lars-Göran date. */
function datumForKundnr(baseDate: string, kundnr: string): string {
  if (kundnr.trim() === NOWASTE_KUNDR) return shiftIsoDate(baseDate, -1)
  return baseDate
}

export function transformInputRow(input: InputRow, deliveryDate: string): OutputRow | null {
  if (!matchesCarrierFilter(input) || isEmptyDataRow(input)) return null

  const consignee = cellToString(input.Consignee)
  const register = lookupConsignee(consignee)
  const kolliVikt = parseWeightKg(input['Weight (kg)'])
  const isGlc =
    normalizeCarrierName(cellToString(input.Carrier)) === GLC_CARRIER_KEY

  if (isGlc && kolliVikt <= 0) return null

  const row = emptyOutputRow()
  applyFixedOutputValues(row, cellToString(input.Carrier))
  row.Datum = datumForKundnr(deliveryDate, row.Kundnr)
  row.Fraktsedel = cellToString(input['Shipment reference'])
  row['Mott. Namn'] = consignee
  row['Kolli vikt'] = formatOutputNumber(kolliVikt)

  if (register) {
    row['Mott. Adress'] = register.adress
    row['Mott. Postnr'] = register.postnr
    row['Mott. Postort'] = register.postort
  } else {
    row['Mott. Postort'] = cellToString(input['Consignee city'])
  }

  const average =
    row.Kundnr.trim() === NOWASTE_KUNDR
      ? nowasteKolliAverage(consignee, register)
      : (register?.average ?? 0)
  const kolliAntal = kolliAntalFromViktAndAverage(kolliVikt, average)
  if (kolliAntal > 0) {
    const antal = String(kolliAntal)
    row['Kolli antal'] = antal
    row['Gods antal1'] = antal
  }

  applyNowasteDeliveryWindow(row)
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
