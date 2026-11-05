import { matchKeyForAdress } from './inbaringRegister'
import type { OutputRow } from './types'

export interface CityPostnrRegisterEntry {
  postort: string
  postnr: string
}

/** City → postnr. Matching is case-insensitive and ignores accents. */
export const CITY_POSTNR_REGISTER: CityPostnrRegisterEntry[] = [
  { postort: 'Alafors', postnr: '449 50' },
  { postort: 'Bohus', postnr: '445 37' },
  { postort: 'Nol', postnr: '449 40' },
  { postort: 'Nödinge', postnr: '449 31' },
  { postort: 'Skepplanda', postnr: '446 40' },
  { postort: 'Surte', postnr: '445 57' },
  { postort: 'Älvängen', postnr: '446 32' },
]

const CITY_LOOKUP = new Map(
  CITY_POSTNR_REGISTER.map((entry) => [
    matchKeyForAdress(entry.postort),
    entry,
  ]),
)

export function lookupCityPostnr(
  postort: string,
): CityPostnrRegisterEntry | undefined {
  const key = matchKeyForAdress(postort)
  if (!key) return undefined

  const exact = CITY_LOOKUP.get(key)
  if (exact) return exact

  for (const entry of CITY_POSTNR_REGISTER) {
    const cityKey = matchKeyForAdress(entry.postort)
    if (cityKey && key.startsWith(`${cityKey} `)) return entry
  }

  return undefined
}

/** Fill Mott. Postnr / Mott. Postort from the city register. */
export function applyCityPostnrRegister(row: OutputRow): boolean {
  const hit = lookupCityPostnr(row['Mott. Postort'])
  if (!hit) return false
  row['Mott. Postnr'] = hit.postnr
  row['Mott. Postort'] = hit.postort
  return true
}
