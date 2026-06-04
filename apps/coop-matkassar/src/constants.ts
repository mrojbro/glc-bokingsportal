/** Columns read from Coop route export (header row in file). */
export const INPUT_COLUMNS = [
  'Ordernr',
  'Kund',
  'Gata',
  'Postnr',
  'Ort',
  'Meddelande',
  'Telefonnummer',
  'Bruttovikt',
] as const

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

export type InputColumn = (typeof INPUT_COLUMNS)[number]
export type OutputColumn = (typeof OUTPUT_COLUMNS)[number]

/** Constant values applied to every output row. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  Kundnr: '119817',
  Märkning: '252500 Bäckebol',
  Kundkontakt: 'Olle Pettersson',
  Tjänst: 'DISTTRP',
  'Term. Namn': 'Stora Coop Bäckebol',
  'Term. Adress': 'Transportgatan 19',
  'Term. Postnr': '422 46',
  'Term. Postort': 'Hisings Backa',
  'Godsslag Temp': 'Kylgods',
  Godsslag: 'Kolli',
  'Kolli antal': '1',
  Startid: '00:00',
  Sluttid: '00:00',
  Resurs: '1107',
}
