/** Columns read from the PrimeLog export (header row in file). */
export const INPUT_COLUMNS = [
  'Shipment date',
  'Consignee',
  'Consignee city',
  'Shipment reference',
  'Weight (kg)',
] as const

/** Same export columns as Kåkå / Ewerman. */
export const OUTPUT_COLUMNS = [
  'Kundnr',
  'Datum',
  'Märkning',
  'Fraktsedel',
  'Littera',
  'Kundkontakt',
  'Tjänst',
  'Tjänst antal',
  'Term. Namn',
  'Term. Adress',
  'Term. Postnr',
  'Term. Postort',
  'Mott. Nr',
  'Mott. Namn',
  'Mott. Adress',
  'Mott. Postnr',
  'Mott. Postort',
  'Godsslag Temp',
  'Godsslag',
  'Kolli antal',
  'Kolli vikt',
  'Pall pallplats',
  'Chaufförsinstruktion',
  'Telefonnr',
  'Inbärning',
  'Startid',
  'Sluttid',
  'Resurs',
  'Gods antal1',
  'Gods sort1',
] as const

export type InputColumn = (typeof INPUT_COLUMNS)[number]
export type OutputColumn = (typeof OUTPUT_COLUMNS)[number]

/** Constant values applied to every output row. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  Kundnr: '115820',
  Littera: 'Göteborg Distribution Kg',
  Kundkontakt: 'Lars-Göran Pedersen',
  Tjänst: 'DISTTRP',
  'Term. Namn': 'GLC TERMINAL',
  'Term. Adress': 'Gårdstens Industriväg 6',
  'Term. Postnr': '424 38',
  'Term. Postort': 'Agnesberg',
  'Godsslag Temp': 'Kylgods',
  Godsslag: 'Pall',
  'Gods sort1': 'Ppl',
  Startid: '00:00',
  Sluttid: '00:00',
}

/** Consignee must contain one of these (case-insensitive). */
export const CONSIGNEE_KEYWORDS = ['foodora', 'trofo'] as const
