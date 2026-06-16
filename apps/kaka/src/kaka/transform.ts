import { OUTPUT_COLUMNS, type InputColumn } from './constants'
import { getTomorrowDate } from './getTomorrowDate'
import { normalizeHeaderName } from './normalizeHeader'
import { lookupTimes } from './timeRegister'
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

function buildChaufforsinstruktion(input: InputRow): string {
  const kod = cellToString(input.Lossningskod)
  const info = cellToString(input.Information)
  if (!kod && !info) return ''
  if (kod && info) return `Lossningskod: ${kod} - ${info}`
  if (kod) return `Lossningskod: ${kod}`
  return info
}

/** Multiline address cells: line 2 is the correct street address. */
function cleanAddress(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const lines = String(value)
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length >= 2) return lines[1]
  return lines[0] ?? ''
}

type FraktsedelSuffix = '' | 'F' | 'K'

interface KolliRule {
  column: InputColumn
  factor: number
}

const FROZEN_KOLLI_RULES: KolliRule[] = [
  { column: '½PL F', factor: 0.5 },
  { column: 'EUR F', factor: 1 },
  { column: 'SRS F', factor: 1 },
]

const CHILLED_KOLLI_RULES: KolliRule[] = [
  { column: 'C½pal', factor: 0.5 },
  { column: 'EUR', factor: 1 },
  { column: 'RB', factor: 1 },
  { column: 'SRS', factor: 1 },
  { column: 'PP', factor: 1 },
]

interface KolliResult {
  kolliAntal: string
  godsslag: string
}

interface WeightVariant {
  kolliVikt: string
  kolliAntal: string
  godsslag: string
  fraktsedelSuffix: FraktsedelSuffix
  godsslagTemp: string
}

const HALF_PALLET_FACTOR = 0.5
const HALF_FRACTION_EPSILON = 1e-9

/** Values ending in ,5 (0,5 / 1,5 / 2,5 …) round up — downstream cannot accept ,5. */
function normalizeNoHalfValues(value: number): number {
  if (value <= 0) return 0
  const rounded = Math.round(value * 1000) / 1000
  const fractional = Math.abs(rounded - Math.trunc(rounded))
  if (Math.abs(fractional - HALF_PALLET_FACTOR) < HALF_FRACTION_EPSILON) {
    return Math.ceil(rounded)
  }
  return rounded
}

function formatKolliAntal(sum: number): string {
  const normalized = normalizeNoHalfValues(sum)
  if (normalized <= 0) return ''
  return Number.isInteger(normalized)
    ? String(normalized)
    : String(normalized).replace('.', ',')
}

function parseWeight(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return value > 0 ? value : 0
  const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatOutputNumber(value: number): string {
  if (value <= 0) return ''
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

function parseNumericCell(value: string): number {
  if (!value.trim()) return 0
  const n = parseFloat(value.trim().replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Gods antal1 = Kolli antal × factor based on Godsslag. */
function computeGodsAntal1(godsslag: string, kolliAntal: string): string {
  const antal = parseNumericCell(kolliAntal)
  if (antal <= 0) return ''

  if (godsslag === 'Halvpall' || godsslag === 'B-Halvpall') {
    return formatKolliAntal(antal * HALF_PALLET_FACTOR)
  }
  if (godsslag === 'Pall' || godsslag === 'B-Pall') {
    return formatKolliAntal(antal)
  }
  return ''
}

function computeGodsSort1(godsAntal1: string): string {
  return parseNumericCell(godsAntal1) > 0 ? 'Ppl' : ''
}

/** Sum value × factor for each column > 0 in rules. */
function sumKolliAntal(input: InputRow, rules: KolliRule[]): number {
  let sum = 0
  for (const { column, factor } of rules) {
    const value = parseWeight(input[column])
    if (value > 0) sum += value * factor
  }
  return sum
}

function lossningskodIsA(input: InputRow): boolean {
  return cellToString(input.Lossningskod).toUpperCase() === 'A'
}

function godsslagByLossningskod(
  input: InputRow,
  ifA: string,
  ifNotA: string,
): string {
  return lossningskodIsA(input) ? ifA : ifNotA
}

function resolveKolli(
  input: InputRow,
  rules: KolliRule[],
  fallbackColumn: InputColumn,
): KolliResult {
  const activePrimary = rules.filter(({ column }) => parseWeight(input[column]) > 0)

  if (activePrimary.length === 0) {
    const fallback = parseWeight(input[fallbackColumn])
    return {
      kolliAntal: formatKolliAntal(fallback),
      godsslag: fallback > 0 ? 'Kolli' : '',
    }
  }

  const sum = sumKolliAntal(input, rules)

  if (Math.abs(sum - HALF_PALLET_FACTOR) < 1e-9) {
    return {
      kolliAntal: '1',
      godsslag: godsslagByLossningskod(input, 'Halvpall', 'B-Halvpall'),
    }
  }

  if (sum > HALF_PALLET_FACTOR) {
    return {
      kolliAntal: formatKolliAntal(sum),
      godsslag: godsslagByLossningskod(input, 'Pall', 'B-Pall'),
    }
  }

  return {
    kolliAntal: formatKolliAntal(sum),
    godsslag: '',
  }
}

/** F-rows: ½PL F / EUR F / SRS F; otherwise fallback to FP F. */
function kolliFrozen(input: InputRow): KolliResult {
  return resolveKolli(input, FROZEN_KOLLI_RULES, 'FP F')
}

/** K-rows: C½pal / EUR / RB / SRS / PP; otherwise fallback to CP. */
function kolliChilled(input: InputRow): KolliResult {
  return resolveKolli(input, CHILLED_KOLLI_RULES, 'CP')
}

/** One row per weight > 0 (F = fryst, K = kylt/torrt); otherwise a single base row. */
function weightVariants(input: InputRow): WeightVariant[] {
  const fryst = parseWeight(input['Vikt Kg Fryst'])
  const kylt = parseWeight(input['Vikt Kg Kylt/Torrt'])
  const variants: WeightVariant[] = []
  if (fryst > 0) {
    const kolli = kolliFrozen(input)
    variants.push({
      kolliVikt: formatOutputNumber(fryst),
      kolliAntal: kolli.kolliAntal,
      godsslag: kolli.godsslag,
      fraktsedelSuffix: 'F',
      godsslagTemp: 'Frysgods',
    })
  }
  if (kylt > 0) {
    const kolli = kolliChilled(input)
    variants.push({
      kolliVikt: formatOutputNumber(kylt),
      kolliAntal: kolli.kolliAntal,
      godsslag: kolli.godsslag,
      fraktsedelSuffix: 'K',
      godsslagTemp: 'Kylgods',
    })
  }
  if (variants.length === 0) {
    variants.push({
      kolliVikt: '',
      kolliAntal: '',
      godsslag: '',
      fraktsedelSuffix: '',
      godsslagTemp: '',
    })
  }
  return variants
}

function baseGlcRow(
  input: InputRow,
  tomorrow: string,
  variant: WeightVariant,
): OutputRow {
  const kundnr = cellToString(input.Kundnr)
  const row = emptyOutputRow()

  row.Kundnr = '112951'
  row.Datum = tomorrow
  row.Kundkontakt = 'Tobias Danielsson'
  row['Term. Namn'] = 'GLC TERMINAL'
  row['Term. Adress'] = 'Gårdstens Industriväg 6'
  row['Term. Postnr'] = '42438'
  row['Term. Postort'] = 'Agnesberg'
  row.Startid = '00:00'
  row.Sluttid = '00:00'
  row['Mott. Namn'] = cellToString(input.Namn)
  row['Mott. Nr'] = kundnr
  row['Mott. Adress'] = cleanAddress(input.Adress)
  row['Mott. Postnr'] = cellToString(input.Postnr)
  row['Mott. Postort'] = cellToString(input.Ort)
  row.Chaufförsinstruktion = buildChaufforsinstruktion(input)
  row['Kolli antal'] = variant.kolliAntal
  row.Godsslag = variant.godsslag
  row['Gods antal1'] = computeGodsAntal1(variant.godsslag, variant.kolliAntal)
  row['Gods sort1'] = computeGodsSort1(row['Gods antal1'])
  row['Kolli vikt'] = variant.kolliVikt
  row['Godsslag Temp'] = variant.godsslagTemp
  const fraktsedelBase = kundnr ? `${kundnr}-${tomorrow.replace(/-/g, '')}` : ''
  row.Fraktsedel = fraktsedelBase + variant.fraktsedelSuffix

  return row
}

function buildGlcRowsForCase(
  input: InputRow,
  tomorrow: string,
  tjanst: string,
  littera: string,
): OutputRow[] {
  return weightVariants(input).map((variant) => {
    const row = baseGlcRow(input, tomorrow, variant)
    row.Tjänst = tjanst
    row.Littera = littera
    if (littera === 'Charter') {
      row.Resurs = '163'
    }

    const times = lookupTimes(littera, row['Mott. Namn'])
    if (times) {
      row.Startid = times.startid
      row.Sluttid = times.sluttid
    }

    return row
  })
}

/**
 * Transform one input row into zero or more output rows.
 * Add new Trpsätt cases here; each case can push one or more rows.
 */
export function transformInputRow(
  input: InputRow,
  deliveryDate?: string,
): OutputRow[] {
  const trpsatt = cellToString(input.Trpsätt)
  const date = deliveryDate ?? getTomorrowDate()
  const results: OutputRow[] = []

  if (trpsatt.includes('GLC/Turbil/Gbg')) {
    results.push(
      ...buildGlcRowsForCase(input, date, 'DISTTRP', 'Distribution'),
    )
  }

  if (trpsatt.includes('GLC/Timbil/Gbg')) {
    results.push(
      ...buildGlcRowsForCase(
        input,
        date,
        'PRODUKTIONSORDRAR - FAKTURERAS EJ',
        'Charter',
      ),
    )
  }

  return results
}

/** Transform all input rows; one input row may yield multiple output rows. */
export function transformInputRows(
  inputs: InputRow[],
  deliveryDate?: string,
): OutputRow[] {
  return inputs.flatMap((input) => transformInputRow(input, deliveryDate))
}

export function createBlankOutputRow(): OutputRow {
  return emptyOutputRow()
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
