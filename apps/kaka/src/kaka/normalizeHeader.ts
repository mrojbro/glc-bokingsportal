import { INPUT_COLUMNS, type InputColumn } from './constants'

/** Strip BOM, zero-width chars, and surrounding whitespace from a CSV header cell. */
export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
}

/** Fix UTF-8 misread as Latin-1 (common when Excel exports ANSI). */
function repairMojibake(text: string): string {
  return text
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã¥/g, 'å')
    .replace(/Ã…/g, 'Å')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã–/g, 'Ö')
    .replace(/Â½/g, '½')
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

function normalizeKey(header: string): string {
  return repairMojibake(normalizeHeaderName(header))
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/** Map a raw CSV header to a known input column, if recognized. */
export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return CANONICAL_BY_NORMALIZED.get(key)
}
