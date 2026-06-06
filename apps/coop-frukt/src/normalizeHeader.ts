import {
  REQUIRED_COLUMNS,
  SHEET_COLUMNS,
  type RequiredColumn,
  type SheetColumn,
} from './constants'

/** Strip BOM, zero-width chars, and surrounding whitespace from a header cell. */
export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
}

function normalizeKey(header: string): string {
  return normalizeHeaderName(header).replace(/\s+/g, ' ').toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, SheetColumn>(
  SHEET_COLUMNS.map((col) => [normalizeKey(col), col]),
)

/** Map a raw header to a known sheet column, if recognized (exact names first). */
export function resolveInputColumn(header: string): SheetColumn | undefined {
  const key = normalizeKey(header)
  if (!key) return undefined

  const direct = CANONICAL_BY_NORMALIZED.get(key)
  if (direct) return direct

  // Legacy typo seen in some exports
  if (key === 'shipment referer') {
    return 'Shipment reference'
  }

  return undefined
}

export function findMissingRequiredColumns(
  matched: readonly (SheetColumn | string)[],
): RequiredColumn[] {
  const found = new Set<SheetColumn>()
  for (const header of matched) {
    const column =
      typeof header === 'string' && SHEET_COLUMNS.includes(header as SheetColumn)
        ? (header as SheetColumn)
        : resolveInputColumn(String(header))
    if (column) found.add(column)
  }
  return REQUIRED_COLUMNS.filter((col) => !found.has(col))
}

export function countMatchedSheetColumns(headers: string[]): number {
  const found = new Set<SheetColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) found.add(column)
  }
  return found.size
}
