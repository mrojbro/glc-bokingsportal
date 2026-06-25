/** Export columns with stable internal keys (Varuslag appears twice in export). */
export const OUTPUT_COLUMN_DEFS = [
  { key: 'leveransdatum', header: 'Leveransdatum' },
  { key: 'mottagarnummer', header: 'Mottagarnummer (BP-ID)' },
  { key: 'mottagarnamn', header: 'Mottagarnamn' },
  { key: 'antalLastbarare', header: 'Antal lastbärare' },
  { key: 'vikt', header: 'Vikt' },
  { key: 'volym', header: 'Volym' },
  { key: 'artikelbeskrivning', header: 'Artikelbeskrivning' },
  { key: 'uppamtningplats', header: 'Upphämtningsplats' },
  { key: 'varuslagForeHamtdatum', header: 'Varuslag' },
  { key: 'hamtdatum', header: 'Hämtdatum' },
  { key: 'varuslagEfterHamtdatum', header: 'Varuslag' },
  { key: 'lastbarartyp', header: 'Lastbärartyp' },
  { key: 'antalPpl', header: 'Antal PPL' },
  { key: 'meddelandetext', header: 'Meddelandetext' },
  { key: 'leveransplats', header: 'Leveransplats' },
] as const

export type OutputColumn = (typeof OUTPUT_COLUMN_DEFS)[number]['key']

export const OUTPUT_COLUMNS: OutputColumn[] = OUTPUT_COLUMN_DEFS.map(
  (def) => def.key,
)

export function getOutputColumnHeader(key: OutputColumn): string {
  return OUTPUT_COLUMN_DEFS.find((def) => def.key === key)?.header ?? key
}

export const OUTPUT_HEADERS: string[] = OUTPUT_COLUMN_DEFS.map((def) => def.header)

/** Filled from leverantör register — highlighted when lookup fails. */
export const LEVERANTOR_REGISTER_OUTPUT_COLUMNS = [
  'mottagarnummer',
  'mottagarnamn',
  'leveransplats',
] as const satisfies readonly OutputColumn[]

/** Constant values applied to every output row. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  artikelbeskrivning: 'Palltransport',
  uppamtningplats: 'CDC ANGERED',
  varuslagForeHamtdatum: 'ZDRY',
  varuslagEfterHamtdatum: 'ZDRY',
}

export const LASTBARARTYP_OPTIONS = ['EUR', 'RLP', 'HLV', 'TSK'] as const
export type Lastbarartyp = (typeof LASTBARARTYP_OPTIONS)[number]

/** Vikt = Antal lastbärare × this factor. */
export const VIKT_PER_LASTBARARE = 25

/** Volym = Antal lastbärare × this factor. */
export const VOLYM_PER_LASTBARARE = 96
