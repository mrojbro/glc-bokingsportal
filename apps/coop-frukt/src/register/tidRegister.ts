import { normalizeConsigneeKey } from './consigneeRegister'
import { tidWindowFromCenter, BLANK_TID_OUTPUT } from '../utils/timeOfDay'
import { weekdayKeyFromIsoDate } from '../utils/weekdayFromDate'
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

export function buildTidRegisterLookup(
  entries: readonly TidRegisterEntry[],
): Map<string, TidRegisterEntry> {
  const map = new Map<string, TidRegisterEntry>()
  for (const entry of entries) {
    const key = normalizeConsigneeKey(entry.butiksnamn)
    if (!key) continue
    map.set(key, entry)
  }
  return map
}

export function lookupTidCenterTime(
  lookup: ReadonlyMap<string, TidRegisterEntry>,
  consigneAddress: string,
  deliveryDateIso: string,
): string {
  const key = normalizeConsigneeKey(consigneAddress)
  if (!key) return ''

  const entry = lookup.get(key)
  if (!entry) return ''

  const weekday = weekdayKeyFromIsoDate(deliveryDateIso)
  if (!weekday) return ''

  return entry[weekday]?.trim() ?? ''
}

export function lookupTidWindow(
  lookup: ReadonlyMap<string, TidRegisterEntry>,
  consigneAddress: string,
  deliveryDateIso: string,
): { starttid: string; sluttid: string } {
  const center = lookupTidCenterTime(lookup, consigneAddress, deliveryDateIso)
  if (!center) {
    return { starttid: BLANK_TID_OUTPUT, sluttid: BLANK_TID_OUTPUT }
  }
  return tidWindowFromCenter(center)
}
