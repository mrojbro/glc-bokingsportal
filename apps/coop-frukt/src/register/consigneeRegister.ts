import type { RegisterEntry } from '../types/register'
import type { OutputRow } from '../types'

export type EditableRegisterEntry = RegisterEntry & { id: string }

export function normalizeConsigneeKey(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function newRegisterEntryId(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyRegisterEntry(): EditableRegisterEntry {
  return {
    id: newRegisterEntryId(),
    consignee: '',
    butiksnr: '',
    butiksnamn: '',
    ekipage: '',
    tur: '',
    littera: '',
    lastningsId: '',
    lastningsnamn: '',
    lastningsadress: '',
    lastningspostnr: '',
    lastningspostort: '',
    typ: '',
  }
}

export function toEditableRegister(
  entries: readonly RegisterEntry[],
): EditableRegisterEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    id: `reg-${index}-${normalizeConsigneeKey(entry.consignee) || index}`,
  }))
}

export function fromEditableRegister(
  entries: readonly EditableRegisterEntry[],
): RegisterEntry[] {
  return entries.map(({ id: _id, ...entry }) => entry)
}

export function buildRegisterLookup(
  entries: readonly RegisterEntry[],
): Map<string, RegisterEntry> {
  const map = new Map<string, RegisterEntry>()
  for (const entry of entries) {
    const key = normalizeConsigneeKey(entry.consignee)
    if (!key) continue
    map.set(key, entry)
  }
  return map
}

export function findRegisterEntry(
  lookup: ReadonlyMap<string, RegisterEntry>,
  consignee: string,
): RegisterEntry | undefined {
  const key = normalizeConsigneeKey(consignee)
  if (!key) return undefined
  return lookup.get(key)
}

export function applyRegisterToOutputRow(
  row: OutputRow,
  entry: RegisterEntry,
): void {
  row.Butiksnr = entry.butiksnr
  row['Consigne address'] = entry.butiksnamn
  row.Littera = entry.littera
  row['Lastnings-ID'] = entry.lastningsId
  row.Lastningsnamn = entry.lastningsnamn
  row.Lastningsadress = entry.lastningsadress
  row.Lastningspostnr = entry.lastningspostnr
  row.Lastningspostort = entry.lastningspostort
  row['Transportation Group (Description)'] = entry.typ
}
