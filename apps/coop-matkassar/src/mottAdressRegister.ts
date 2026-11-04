import mottAdressData from './data/mottAdressRegister.json'
import { matchKeyForAdress } from './inbaringRegister'
import type { OutputRow } from './types'

export interface MottAdressRegisterEntry {
  adress: string
  postnr: string
  postort: string
}

export const MOTT_ADRESS_REGISTER: MottAdressRegisterEntry[] =
  mottAdressData as MottAdressRegisterEntry[]

const MOTT_ADRESS_LOOKUP = new Map(
  MOTT_ADRESS_REGISTER.map((entry) => [
    matchKeyForAdress(entry.adress),
    entry,
  ]),
)

export function lookupMottAdress(
  gata: string,
): MottAdressRegisterEntry | undefined {
  const key = matchKeyForAdress(gata)
  if (!key) return undefined
  return MOTT_ADRESS_LOOKUP.get(key)
}

/** Fill Mott. Postnr / Mott. Postort from the address register when Gata matches. */
export function applyMottAdressRegister(row: OutputRow): boolean {
  const hit = lookupMottAdress(row['Mott. Adress'])
  if (!hit) return false
  row['Mott. Postnr'] = hit.postnr
  row['Mott. Postort'] = hit.postort
  return true
}
