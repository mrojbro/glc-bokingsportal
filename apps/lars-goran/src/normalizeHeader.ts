import { INPUT_COLUMNS, type InputColumn } from './constants'

export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeKey(header: string): string {
  return normalizeHeaderName(header).toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

/** Aliases from messy HTML/Excel exports. */
const ALIASES: Record<string, InputColumn> = {
  'shipment date': 'Shipment date',
  consignee: 'Consignee',
  'consignee city': 'Consignee city',
  'shipment reference': 'Shipment reference',
  'weight (kg)': 'Weight (kg)',
  'weight kg': 'Weight (kg)',
}

export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return ALIASES[key] ?? CANONICAL_BY_NORMALIZED.get(key)
}
