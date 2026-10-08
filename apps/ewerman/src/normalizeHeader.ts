import { INPUT_COLUMNS, type InputColumn } from './constants'

/** Strip BOM, zero-width chars, surrounding whitespace, and trailing periods. */
export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
    .replace(/\.+$/, '')
}

function normalizeKey(header: string): string {
  return normalizeHeaderName(header)
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/, '')
    .toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

const HEADER_ALIASES: Record<string, InputColumn> = {
  'last datum': 'Lastdatum',
  lastdate: 'Lastdatum',
  'kund namn': 'Kundnamn',
  kundhamn: 'Kundnamn',
  'kund hamn': 'Kundnamn',
  'leveransadress 1': 'Kundnamn',
  'leveransadress 3': 'Adress',
  postnummer: 'Postnr',
  postort: 'Ort',
  vikt: 'Budget vikt',
  budgetvikt: 'Budget vikt',
}

/** Map a raw header to a known input column, if recognized. */
export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return CANONICAL_BY_NORMALIZED.get(key) ?? HEADER_ALIASES[key]
}
