/** Known input column headers — optional; mapped when present (order-independent). */
export const INPUT_COLUMNS = [
  'Datum',
  'Sedelnummer',
  'Märkning',
  'Angöring Namn - Sista',
  'Angöring Adress - Sista',
  'Angöring Postnr - Sista',
  'Angöring Postort - Sista',
] as const

/** Output column headers in exact Kåkå export order. */
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

export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  Kundnr: '109158',
  Kundkontakt: 'Laila Augustsson',
  Tjänst: 'DISTTRP',
  'Term. Namn': 'Bröderna Hansson',
  'Term. Adress': 'Fiskhamnen',
  'Term. Postnr': '41458',
  'Term. Postort': 'GÖTEBORG',
  'Godsslag Temp': 'Kylgods',
}
