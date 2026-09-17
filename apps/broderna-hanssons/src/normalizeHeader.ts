import { INPUT_COLUMNS, type InputColumn } from './constants'

/** Strip BOM, zero-width chars, and surrounding whitespace from a header cell. */
export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
}

function repairMojibake(text: string): string {
  return text
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã¥/g, 'å')
    .replace(/Ã…/g, 'Å')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã–/g, 'Ö')
}

function normalizeKey(header: string): string {
  return repairMojibake(normalizeHeaderName(header))
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

const HEADER_ALIASES: Record<string, InputColumn> = {
  'sedel nr': 'Sedelnummer',
  sedelnr: 'Sedelnummer',
  markning: 'Märkning',
  'angoring namn - sista': 'Angöring Namn - Sista',
  'angoring adress - sista': 'Angöring Adress - Sista',
  'angoring postnr - sista': 'Angöring Postnr - Sista',
  'angoring postort - sista': 'Angöring Postort - Sista',
  'angöring namn-sista': 'Angöring Namn - Sista',
  'angöring adress-sista': 'Angöring Adress - Sista',
  'angöring postnr-sista': 'Angöring Postnr - Sista',
  'angöring postort-sista': 'Angöring Postort - Sista',
  'namn - sista': 'Angöring Namn - Sista',
  'adress - sista': 'Angöring Adress - Sista',
  'postnr - sista': 'Angöring Postnr - Sista',
  'postort - sista': 'Angöring Postort - Sista',
  'angöring namn': 'Angöring Namn - Sista',
  'angöring adress': 'Angöring Adress - Sista',
  'angöring postnr': 'Angöring Postnr - Sista',
  'angöring postort': 'Angöring Postort - Sista',
}

/** Map a raw header to a known input column, if recognized. */
export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return CANONICAL_BY_NORMALIZED.get(key) ?? HEADER_ALIASES[key]
}
