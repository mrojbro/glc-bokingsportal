/** Same export columns as Kåkå / Ewerman / Lars-Göran. */
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

export type OutputColumn = (typeof OUTPUT_COLUMNS)[number]

/** Kolli vikt = Kolli antal × this factor (kg). */
export const KOLLI_VIKT_FACTOR = 105

/** Gods antal1 = Kolli antal × this factor. */
export const GODS_ANTAL_FACTOR = 0.66

/** Constant values applied to every output row. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  Littera: 'Produktionsorder',
  Kundkontakt: 'Mats Olofson',
  Tjänst: 'PRODUKTIONSORDRAR - FAKTURERAS EJ ',
  'Term. Namn': 'Comforta',
  'Term. Adress': 'Filaregatan 19',
  'Term. Postnr': '44234',
  'Term. Postort': 'Kungälv',
  'Godsslag Temp': 'Torrgods',
  Godsslag: 'RC',
  'Gods sort1': 'Ppl',
  Startid: '00:00',
  Sluttid: '00:00',
}
