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
  'Latest Requested Date (Unloading Location)': { width: 100, hidden: false },
  'Freight Unit': { width: 90, hidden: false },
  'Handling Unit': { width: 90, hidden: true },
  'Original Order': { width: 120, hidden: true },
  Quantity: { width: 60, hidden: false },
  'Load Carrier': { width: 70, hidden: false },
  'Latest Requested Time (Unloading Location)': { width: 90, hidden: true },
  'Gross Weight': { width: 80, hidden: false },
  'Transportation Group': { width: 60, hidden: false },
  'Transportation Group (Description)': { width: 110, hidden: false },
  Butiksnr: { width: 70, hidden: false },
  'Consigne address': { width: 200, hidden: false },
  Resurs: { width: 70, hidden: true },
  Littera: { width: 140, hidden: false },
  Lossinfo: { width: 70, hidden: false },
  Starttid: { width: 70, hidden: false },
  Sluttid: { width: 70, hidden: false },
  'Lastnings-ID': { width: 80, hidden: false },
  Lastningsnamn: { width: 120, hidden: false },
  Lastningsadress: { width: 140, hidden: true },
  Lastningspostnr: { width: 80, hidden: true },
  Lastningspostort: { width: 100, hidden: true },
}

/** Columns shown in the overview table (export order preserved). */
export function getVisibleOutputColumns(): OutputColumn[] {
  return OUTPUT_COLUMNS.filter((col) => !OUTPUT_COLUMN_DISPLAY[col].hidden)
}

export function getOutputColumnWidth(column: OutputColumn): number {
  return OUTPUT_COLUMN_DISPLAY[column].width
}
