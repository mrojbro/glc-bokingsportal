import { normalizeConsigneeKey } from './consigneeRegister'
import { weekdayKeyFromIsoDate } from '../utils/weekdayFromDate'
import type { OutputRow } from '../types'
import type { TidRegisterEntry } from '../types/tidRegister'

export type EditableTidRegisterEntry = TidRegisterEntry & { id: string }

export function newTidRegisterEntryId(): string {
  return `tid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyTidRegisterEntry(): EditableTidRegisterEntry {
  return {
    id: newTidRegisterEntryId(),
    butiksnr: '',
    butiksnamn: '',
    sunday: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
  }
}

export function toEditableTidRegister(
  entries: readonly TidRegisterEntry[],
): EditableTidRegisterEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    id: `tid-${index}-${normalizeConsigneeKey(entry.butiksnamn) || index}`,
  }))
}

export function fromEditableTidRegister(
  entries: readonly EditableTidRegisterEntry[],
): TidRegisterEntry[] {
  return entries.map(({ id: _id, ...entry }) => entry)
}

function addTidLookupKey(
  map: Map<string, TidRegisterEntry>,
  raw: string,
  entry: TidRegisterEntry,
): void {
  const key = normalizeConsigneeKey(raw)
  if (!key || map.has(key)) return
  map.set(key, entry)
}

/** Index tid-register by butiksnamn and butiksnr. */
export function buildTidRegisterLookup(
  entries: readonly TidRegisterEntry[],
): Map<string, TidRegisterEntry> {
  const map = new Map<string, TidRegisterEntry>()
  for (const entry of entries) {
    addTidLookupKey(map, entry.butiksnamn, entry)
    addTidLookupKey(map, entry.butiksnr, entry)
  }
  return map
}

function findTidRegisterEntry(
  lookup: ReadonlyMap<string, TidRegisterEntry>,
  consigneAddress: string,
  butiksnr = '',
): TidRegisterEntry | undefined {
  const byAddress = lookup.get(normalizeConsigneeKey(consigneAddress))
  if (byAddress) return byAddress
  if (butiksnr) {
    return lookup.get(normalizeConsigneeKey(butiksnr))
  }
  return undefined
}

/**
 * Tid from tid-register: match Consigne address to butiksnamn (or butiksnr),
 * then pick the weekday column from Leveransdatum (yyyy-mm-dd).
 */
export function lookupTid(
  lookup: ReadonlyMap<string, TidRegisterEntry>,
  consigneAddress: string,
  deliveryDateIso: string,
  butiksnr = '',
): string {
  const entry = findTidRegisterEntry(lookup, consigneAddress, butiksnr)
  if (!entry) return ''

  const weekday = weekdayKeyFromIsoDate(deliveryDateIso)
  if (!weekday) return ''

  return entry[weekday]?.trim() ?? ''
}

/** Apply tid-register lookup to output row (Leveranstid). */
export function applyTidLookup(
  lookup: ReadonlyMap<string, TidRegisterEntry>,
  row: OutputRow,
): void {
  const deliveryDate = row['Latest Requested Date (Unloading Location)']
  row['Latest Requested Time (Unloading Location)'] = lookupTid(
    lookup,
    row['Consigne address'],
    deliveryDate,
    row.Butiksnr,
  )
}
