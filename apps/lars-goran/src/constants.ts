/** Columns read from the PrimeLog export (header row in file). */
export const INPUT_COLUMNS = [
  'Shipment date',
  'Carrier',
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

/** Constant values applied to every output row (not carrier-specific). */
export const SHARED_FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  'Godsslag Temp': 'Kylgods',
  Godsslag: 'Pall',
  'Gods sort1': 'Ppl',
  Startid: '00:00',
  Sluttid: '00:00',
}

/** Only these carriers become booking rows (case-insensitive). */
export const ALLOWED_CARRIERS = [
  'P-frakt Åkeri',
  'GLC Distribution Gbg',
] as const

export type AllowedCarrier = (typeof ALLOWED_CARRIERS)[number]

export const DEFAULT_CARRIER: AllowedCarrier = 'P-frakt Åkeri'

/** Littera, kundkontakt, tjänst and terminal per carrier. */
export const CARRIER_OUTPUT_PRESETS: Record<
  AllowedCarrier,
  Partial<Record<OutputColumn, string>>
> = {
  'P-frakt Åkeri': {
    Kundnr: '115820',
    Littera: 'Göteborg Distribution Kg',
    Kundkontakt: 'Lars-Göran Pedersen',
    Tjänst: 'DISTTRP',
    'Term. Namn': 'GLC TERMINAL',
    'Term. Adress': 'Gårdstens Industriväg 6',
    'Term. Postnr': '424 38',
    'Term. Postort': 'Agnesberg',
  },
  'GLC Distribution Gbg': {
    Kundnr: '115343',
    Littera: 'Helsingborg-Distribution',
    Kundkontakt: 'Daniel Ryden',
    Tjänst: 'DISTTRP',
    'Term. Namn': 'Nowaste Helsingborg',
    'Term. Adress': 'Långebergavägen 190',
    'Term. Postnr': '256 69',
    'Term. Postort': 'Helsingborg',
  },
}

/** Blank rows and fallback: same as P-frakt Åkeri. */
export const FIXED_OUTPUT_VALUES: Partial<Record<OutputColumn, string>> = {
  ...SHARED_FIXED_OUTPUT_VALUES,
  ...CARRIER_OUTPUT_PRESETS[DEFAULT_CARRIER],
}

export const KUNDR_SUMMARY_LABELS: Record<string, string> = {
  '115820': 'Lars-Göran',
  '115343': 'Nowaste',
}

export function getKundnrSummaryGroups(): {
  kundnr: string
  label: string
  carrier: AllowedCarrier
}[] {
  return ALLOWED_CARRIERS.map((carrier) => {
    const kundnr = CARRIER_OUTPUT_PRESETS[carrier].Kundnr ?? ''
    return {
      carrier,
      kundnr,
      label: KUNDR_SUMMARY_LABELS[kundnr] ?? kundnr,
    }
  })
}

export function normalizeCarrierName(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('sv')
}
