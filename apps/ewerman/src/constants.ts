/** Ewerman input columns (Leveransadress fields). */
export const INPUT_COLUMNS = [
  'Leveransadress 1',
  'Leveransadress 3',
  'Leveransadress 4',
  'Budget vikt',
  'Företagskod',
] as const

/** Same export columns as Kåkå Excel Transform. */
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

/** Kolli vikt ÷ this value → Kolli antal / Gods antal1 (rounded up). */
export const KOLLI_ANTAL_DIVISOR = 390

/** Constant values applied to every output row. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  Kundnr: '124014',
  Littera: 'Göteborg Distribution',
  Kundkontakt: 'Anders Petersson',
  Tjänst: 'DISTTRP',
  'Term. Namn': 'GLC Terminal',
  'Term. Adress': 'Gårdstens Industriväg 6',
  'Term. Postnr': '424 38',
  'Term. Postort': 'Agnesberg',
  'Godsslag Temp': 'Kylgods',
  Godsslag: 'Pall',
  'Gods sort1': 'Ppl',
}
