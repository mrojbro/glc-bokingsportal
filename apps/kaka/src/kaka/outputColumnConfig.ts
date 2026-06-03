import { OUTPUT_COLUMNS, type OutputColumn } from './constants'

/**
 * Overview table settings (section 4 — Förhandsgranskning).
 * Edit width (pixels) and hidden here, then rebuild/redeploy.
 *
 * hidden: true  → column not shown in the overview table
 * hidden: false → column shown and editable in the overview
 *
 * Download (.xlsx) always includes ALL columns in export order,
 * regardless of hidden.
 */
export interface OutputColumnDisplayConfig {
  /** Column width in pixels in the overview table. */
  width: number
  /** Hide from overview when true; still exported on download. */
  hidden: boolean
}

export const OUTPUT_COLUMN_DISPLAY: Record<
  OutputColumn,
  OutputColumnDisplayConfig
> = {
  Kundnr: { width: 60, hidden: false },
  Datum: { width: 90, hidden: false },
  Märkning: { width: 100, hidden: true },
  Fraktsedel: { width: 130, hidden: false },
  Littera: { width: 110, hidden: true },
  Kundkontakt: { width: 140, hidden: true },
  Tjänst: { width: 200, hidden: true },
  'Tjänst antal': { width: 90, hidden: true },
  'Term. Namn': { width: 130, hidden: true },
  'Term. Adress': { width: 160, hidden: true },
  'Term. Postnr': { width: 90, hidden: true },
  'Term. Postort': { width: 90, hidden: true },
  'Mott. Nr': { width: 90, hidden: true },
  'Mott. Namn': { width: 160, hidden: false },
  'Mott. Adress': { width: 160, hidden: false },
  'Mott. Postnr': { width: 90, hidden: false },
  'Mott. Postort': { width: 110, hidden: false },
  'Godsslag Temp': { width: 110, hidden: false },
  Godsslag: { width: 80, hidden: false },
  'Kolli antal': { width: 80, hidden: false },
  'Kolli vikt': { width: 80, hidden: false },
  'Pall pallplats': { width: 110, hidden: true },
  Chaufförsinstruktion: { width: 150, hidden: false },
  Telefonnr: { width: 110, hidden: true },
  Inbärning: { width: 90, hidden: true },
  Startid: { width: 70, hidden: false },
  Sluttid: { width: 70, hidden: false },
  Resurs: { width: 90, hidden: true },
  'Gods antal1': { width: 80, hidden: false },
  'Gods sort1': { width: 80, hidden: false },
}

/** Columns shown in the overview table (export order preserved). */
export function getVisibleOutputColumns(): OutputColumn[] {
  return OUTPUT_COLUMNS.filter((col) => !OUTPUT_COLUMN_DISPLAY[col].hidden)
}

export function getOutputColumnWidth(column: OutputColumn): number {
  return OUTPUT_COLUMN_DISPLAY[column].width
}
