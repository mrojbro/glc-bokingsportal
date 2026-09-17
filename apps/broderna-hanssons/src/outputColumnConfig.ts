import { OUTPUT_COLUMNS, type OutputColumn } from './constants'

export interface OutputColumnDisplayConfig {
  width: number
  hidden: boolean
}

export const OUTPUT_COLUMN_DISPLAY: Record<
  OutputColumn,
  OutputColumnDisplayConfig
> = {
  Kundnr: { width: 80, hidden: false },
  Datum: { width: 90, hidden: false },
  Märkning: { width: 110, hidden: false },
  Fraktsedel: { width: 130, hidden: false },
  Littera: { width: 110, hidden: true },
  Kundkontakt: { width: 140, hidden: true },
  Tjänst: { width: 120, hidden: true },
  'Tjänst antal': { width: 90, hidden: true },
  'Term. Namn': { width: 140, hidden: true },
  'Term. Adress': { width: 120, hidden: true },
  'Term. Postnr': { width: 90, hidden: true },
  'Term. Postort': { width: 110, hidden: true },
  'Mott. Nr': { width: 90, hidden: true },
  'Mott. Namn': { width: 160, hidden: false },
  'Mott. Adress': { width: 160, hidden: false },
  'Mott. Postnr': { width: 90, hidden: false },
  'Mott. Postort': { width: 120, hidden: false },
  'Godsslag Temp': { width: 110, hidden: false },
  Godsslag: { width: 80, hidden: true },
  'Kolli antal': { width: 80, hidden: true },
  'Kolli vikt': { width: 80, hidden: true },
  'Pall pallplats': { width: 110, hidden: true },
  Chaufförsinstruktion: { width: 180, hidden: false },
  Telefonnr: { width: 110, hidden: true },
  Inbärning: { width: 90, hidden: true },
  Startid: { width: 70, hidden: true },
  Sluttid: { width: 70, hidden: true },
  Resurs: { width: 90, hidden: true },
  'Gods antal1': { width: 80, hidden: true },
  'Gods sort1': { width: 80, hidden: true },
}

export function getVisibleOutputColumns(): OutputColumn[] {
  return OUTPUT_COLUMNS.filter((col) => !OUTPUT_COLUMN_DISPLAY[col].hidden)
}

export function getOutputColumnWidth(column: OutputColumn): number {
  return OUTPUT_COLUMN_DISPLAY[column].width
}
