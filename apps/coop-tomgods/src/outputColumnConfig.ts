import {
  OUTPUT_COLUMNS,
  getOutputColumnHeader,
  type OutputColumn,
} from './constants'

export interface OutputColumnDisplayConfig {
  width: number
  hidden: boolean
}

export const OUTPUT_COLUMN_DISPLAY: Record<
  OutputColumn,
  OutputColumnDisplayConfig
> = {
  leveransdatum: { width: 100, hidden: false },
  mottagarnummer: { width: 120, hidden: false },
  mottagarnamn: { width: 160, hidden: false },
  antalLastbarare: { width: 100, hidden: false },
  vikt: { width: 80, hidden: false },
  volym: { width: 80, hidden: false },
  artikelbeskrivning: { width: 160, hidden: false },
  uppamtningplats: { width: 120, hidden: false },
  varuslagForeHamtdatum: { width: 100, hidden: false },
  hamtdatum: { width: 100, hidden: false },
  varuslagEfterHamtdatum: { width: 100, hidden: false },
  lastbarartyp: { width: 100, hidden: false },
  antalPpl: { width: 90, hidden: false },
  meddelandetext: { width: 180, hidden: true },
  leveransplats: { width: 120, hidden: false },
}

export function getVisibleOutputColumns(): OutputColumn[] {
  return OUTPUT_COLUMNS.filter((col) => !OUTPUT_COLUMN_DISPLAY[col].hidden)
}

export function getOutputColumnWidth(column: OutputColumn): number {
  return OUTPUT_COLUMN_DISPLAY[column].width
}

export { getOutputColumnHeader }
