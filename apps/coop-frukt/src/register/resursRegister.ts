import { normalizeConsigneeKey } from './consigneeRegister'
import { weekdayKeyFromIsoDate } from '../utils/weekdayFromDate'
import type { ResursRegisterEntry } from '../types/resursRegister'

export type EditableResursRegisterEntry = ResursRegisterEntry & { id: string }

export function newResursRegisterEntryId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyResursRegisterEntry(): EditableResursRegisterEntry {
  return {
    id: newResursRegisterEntryId(),
    consignee: '',
    butiksnr: '',
    butiksnamn: '',
    ekipage: '',
    typ: '',
    tur: '',
    littera: '',
    lastningsId: '',
    lastningsnamn: '',
    lastningsadress: '',
    lastningspostnr: '',
    lastningspostort: '',
    sunday: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
  }
}

export function toEditableResursRegister(
  entries: readonly ResursRegisterEntry[],
): EditableResursRegisterEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    id: `res-${index}-${normalizeConsigneeKey(entry.butiksnamn) || index}`,
  }))
}

export function fromEditableResursRegister(
  entries: readonly EditableResursRegisterEntry[],
): ResursRegisterEntry[] {
  return entries.map(({ id: _id, ...entry }) => entry)
}

export function buildResursRegisterLookup(
  entries: readonly ResursRegisterEntry[],
): Map<string, ResursRegisterEntry> {
  const map = new Map<string, ResursRegisterEntry>()
  for (const entry of entries) {
    const key = normalizeConsigneeKey(entry.butiksnamn)
    if (!key) continue
    map.set(key, entry)
  }
  return map
}

export function lookupLossinfo(
  lookup: ReadonlyMap<string, ResursRegisterEntry>,
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
