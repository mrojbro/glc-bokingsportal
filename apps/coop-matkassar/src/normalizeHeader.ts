import { INPUT_COLUMNS, type InputColumn } from './constants'

/** Strip BOM, zero-width chars, and surrounding whitespace from a header cell. */
export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
}

const HEADER_ALIASES: Record<string, InputColumn> = {
  telefonnr: 'Telefonnummer',
  telefonnummer: 'Telefonnummer',
  bruttovikt: 'Bruttovikt',
  'brutto vikt': 'Bruttovikt',
}

function normalizeKey(header: string): string {
  return normalizeHeaderName(header).replace(/\s+/g, ' ').toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

/** Map a raw header to a known input column, if recognized. */
export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return CANONICAL_BY_NORMALIZED.get(key) ?? HEADER_ALIASES[key]
}
