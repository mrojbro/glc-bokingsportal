import registerData from './data/postnrRegister.json'
import type { OutputRow } from './types'

export interface PostnrRegisterEntry {
  postnr: string
  transportinstruktion: string
}

export type EditablePostnrRegisterEntry = PostnrRegisterEntry & { id: string }

export const POSTNR_REGISTER: PostnrRegisterEntry[] =
  registerData as PostnrRegisterEntry[]

export function normalizePostnr(raw: string): string {
  return raw.replace(/\u00a0/g, ' ').replace(/\s+/g, '').trim()
}

export function newPostnrRegisterEntryId(): string {
  return `postnr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyPostnrRegisterEntry(): EditablePostnrRegisterEntry {
  return {
    id: newPostnrRegisterEntryId(),
    postnr: '',
    transportinstruktion: '',
  }
}

export function toEditablePostnrRegister(
  entries: readonly PostnrRegisterEntry[],
): EditablePostnrRegisterEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    id: `postnr-${index}-${normalizePostnr(entry.postnr) || index}`,
  }))
}

export function fromEditablePostnrRegister(
  entries: readonly EditablePostnrRegisterEntry[],
): PostnrRegisterEntry[] {
  return entries.map((entry) => ({
    postnr: normalizePostnr(entry.postnr),
    transportinstruktion: entry.transportinstruktion.trim(),
  }))
}

export function buildPostnrRegisterLookup(
  entries: readonly PostnrRegisterEntry[],
): Map<string, string> {
  const map = new Map<string, string>()
  for (const entry of entries) {
    const key = normalizePostnr(entry.postnr)
    if (!key) continue
    map.set(key, entry.transportinstruktion.trim())
  }
  return map
}

export function lookupTransportinstruktion(
  postnr: string,
  lookup: ReadonlyMap<string, string>,
): string {
  const key = normalizePostnr(postnr)
  if (!key) return ''
  return lookup.get(key) ?? ''
}

export function applyTransportinstruktion(
  row: Pick<OutputRow, 'Mott. Postnr' | 'Chaufförsinstruktion'>,
  lookup: ReadonlyMap<string, string>,
): boolean {
  const instruction = lookupTransportinstruktion(row['Mott. Postnr'], lookup)
  row.Chaufförsinstruktion = instruction
  return !normalizePostnr(row['Mott. Postnr']) || instruction !== ''
}
