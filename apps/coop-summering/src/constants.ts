/** Shared paste columns for all Coop Summering sources. */
export const INPUT_COLUMNS = [
  'Latest Requested Date (Unloading Location)',
  'Freight Unit',
  'Handling Unit',
  'Original Order',
  'Quantity',
  'Load Carrier',
  'Latest Requested Time (Unloading Location)',
  'Gross Weight',
  'Transportation Group',
  'Transportation Group (Description)',
  'Butiksnr',
  'Consigne address',
  'Resurs',
  'Littera',
  'Lossinfo',
  'Lastnings-ID',
  'Lastningsnamn',
  'Lastningsadress',
  'Lastningspostnr',
  'Lastningspostort',
] as const

export type InputColumn = (typeof INPUT_COLUMNS)[number]

export const ROW_FIELD = 'Transportation Group (Description)' as const
export const COLUMN_FIELD = 'Load Carrier' as const
export const VALUE_FIELD = 'Quantity' as const

export type SourceStatus = 'ready' | 'coming-soon'
export type SourceKind = 'pivot' | 'excel'

export interface SourceConfig {
  id: string
  label: string
  status: SourceStatus
  kind: SourceKind
}

export const SOURCES: SourceConfig[] = [
  {
    id: 'coop-eskilstuna-enkoping',
    label: 'Coop Eskilstuna-Enköping',
    status: 'ready',
    kind: 'pivot',
  },
  {
    id: 'nowaste-helsingborg',
    label: 'Nowaste Helsingborg',
    status: 'ready',
    kind: 'pivot',
  },
  {
    id: 't5-coop',
    label: 'T5 Coop',
    status: 'ready',
    kind: 'excel',
  },
]

/** Short rule hint shown under each paste source. */
export const SOURCE_RULE_HINTS: Record<string, string> = {
  'coop-eskilstuna-enkoping':
    'Summerar endast Dry, Fresh/Chilled och Frozen. Datum (Latest Requested Date) måste matcha Nowaste.',
  'nowaste-helsingborg':
    'Tillåter Fruits (Direkt/GLC/Flytten). Fruits (Direkt) räknas inte i summeringen eller datumkollen.',
  't5-coop':
    'Klistra in T5-data (kolumnordning spelar ingen roll). Ladda ner Excel med formatering.',
}
