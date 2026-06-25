import registerData from './data/customerRegister.json'
import type { CustomerRegisterEntry } from './types/customerRegister'

export const CUSTOMER_REGISTER: CustomerRegisterEntry[] =
  registerData as CustomerRegisterEntry[]

/** Input names silently skipped during parsing. */
export const IGNORED_INPUT_MOTTAGARE = ['Trunking Jönköping'] as const

export function isIgnoredInputMottagare(mottNamn: string): boolean {
  const key = normalizeMottagareKey(mottNamn)
  return IGNORED_INPUT_MOTTAGARE.some(
    (name) => normalizeMottagareKey(name) === key,
  )
}

export function normalizeMottagareKey(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

export function buildCustomerRegisterLookup(
  entries: readonly CustomerRegisterEntry[],
): Map<string, CustomerRegisterEntry> {
  const map = new Map<string, CustomerRegisterEntry>()
  for (const entry of entries) {
    const key = normalizeMottagareKey(entry.mottagare)
    if (!key) continue
    map.set(key, entry)
  }
  return map
}

export const CUSTOMER_REGISTER_LOOKUP = buildCustomerRegisterLookup(CUSTOMER_REGISTER)

export function findCustomerRegisterEntry(
  lookup: ReadonlyMap<string, CustomerRegisterEntry>,
  mottNamn: string,
): CustomerRegisterEntry | undefined {
  const key = normalizeMottagareKey(mottNamn)
  if (!key) return undefined
  return lookup.get(key)
}
