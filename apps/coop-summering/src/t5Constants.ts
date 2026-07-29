/** Columns for T5 Coop paste + Excel export (export order). */
export const T5_COLUMNS = [
  'Resurs',
  'Transportdag',
  'Fraktsedelnummer',
  'Avs Namn',
  'Mott. Namn',
  'Mott. Ort',
  'Lev Tid',
  'Lev Tid2',
  'Godsslag',
  'Vikt',
  'Kolli',
] as const

export type T5Column = (typeof T5_COLUMNS)[number]

export type T5Row = Record<T5Column, string>

export const T5_HEADER_FILL = 'BFBFBF'
export const T5_HEADER_FONT = '000000'

/** Godsslag → Excel fill (RGB hex without #). */
export const GODSSLAG_FILLS: Record<string, string> = {
  Kylgods: 'BDD7EE',
  Frysgods: '5B9BD5',
  Torrgods: 'D9D9D9',
}

/** Resurs column background. */
export const RESURS_COLUMN_FILL = 'C6EFCE'

/** (TS) row highlight — solid yellow. */
export const TS_ROW_FILL = 'FFEB3B'
/** Fraktsedelnummer date mismatch / 10-digit — solid orange. */
export const FRAKTSEDEL_DATE_MISMATCH_FILL = 'FF9800'
export const BLACK_FONT = '000000'
