export interface ConsigneeRegisterEntry {
  namn: string
  adress: string
  postnr: string
  postort: string
  /** Divisor for Kolli antal: ceil(kolli vikt / average). */
  average: number
}

export const CONSIGNEE_REGISTER: ConsigneeRegisterEntry[] = [
  {
    namn: 'Foodora Askim',
    adress: 'Datavägen 17',
    postnr: '436 32',
    postort: 'Askim',
    average: 146,
  },
  {
    namn: 'Foodora Hisingen',
    adress: 'Gustaf Dalénsgatan 32',
    postnr: '417 24',
    postort: 'Göteborg',
    average: 139,
  },
  {
    namn: 'Foodora Borås',
    adress: 'Källegatan 6',
    postnr: '503 38',
    postort: 'Borås',
    average: 120,
  },
  {
    namn: 'Trofo Trading Kållered',
    adress: 'Streteredsvägen 80',
    postnr: '428 34',
    postort: 'Kållered',
    average: 265,
  },
  {
    namn: 'Foodora Göteborg',
    adress: 'Ekelundsgatan 4',
    postnr: '411 18',
    postort: 'Göteborg',
    average: 130,
  },
  {
    namn: 'Foodora Partille',
    adress: 'Sofiagatan 2',
    postnr: '416 72',
    postort: 'Göteborg',
    average: 143,
  },
]

/** Known spelling variants in PrimeLog exports. */
const CONSIGNEE_ALIASES: Record<string, string> = {
  'foodora hisinge': 'foodora hisingen',
}

function normalizeConsigneeKey(name: string): string {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return CONSIGNEE_ALIASES[key] ?? key
}

export function lookupConsignee(consignee: string): ConsigneeRegisterEntry | undefined {
  const key = normalizeConsigneeKey(consignee)
  if (!key) return undefined

  const exact = CONSIGNEE_REGISTER.find(
    (entry) => normalizeConsigneeKey(entry.namn) === key,
  )
  if (exact) return exact

  return CONSIGNEE_REGISTER.find((entry) => {
    const entryKey = normalizeConsigneeKey(entry.namn)
    return key.includes(entryKey) || entryKey.includes(key)
  })
}

/** Kolli antal = kolli vikt ÷ average, rounded up. */
export function kolliAntalFromViktAndAverage(
  kolliVikt: number,
  average: number,
): number {
  if (kolliVikt <= 0 || average <= 0) return 0
  return Math.ceil(kolliVikt / average)
}
