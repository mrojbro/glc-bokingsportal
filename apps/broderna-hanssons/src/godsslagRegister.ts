import registerData from './data/godsslagRegister.json'

export interface GodsslagRegisterEntry {
  kollislag: string
  godsslag: string
}

export const GODSSLAG_REGISTER: GodsslagRegisterEntry[] =
  registerData as GodsslagRegisterEntry[]

function normalizeKollislag(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/[–—−]/g, '-')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

export function buildGodsslagLookup(
  entries: readonly GodsslagRegisterEntry[],
): Map<string, string> {
  const map = new Map<string, string>()
  for (const entry of entries) {
    const key = normalizeKollislag(entry.kollislag)
    if (!key) continue
    map.set(key, entry.godsslag.trim())
  }
  return map
}

export const GODSSLAG_LOOKUP = buildGodsslagLookup(GODSSLAG_REGISTER)

export function lookupGodsslag(kollislag: string): string {
  const key = normalizeKollislag(kollislag)
  if (!key) return ''
  return GODSSLAG_LOOKUP.get(key) ?? ''
}

function parseVikt(value: string | number | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const text = String(value ?? '').trim().replace(/\s+/g, '').replace(',', '.')
  if (!text) return null
  const match = text.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const n = Number(match[0])
  return Number.isFinite(n) ? n : null
}

export function formatDecimal2(value: string | number | undefined): string {
  const n = parseVikt(value)
  if (n === null) return ''
  return n.toFixed(2).replace('.', ',')
}

function ceilViktPer400(vikt: string | number | undefined): string {
  const weight = parseVikt(vikt)
  if (weight === null || weight <= 0) return ''
  return formatDecimal2(Math.ceil(weight / 400))
}

function isEmptyOrZero(value: string | number | undefined): boolean {
  const text = String(value ?? '').trim()
  if (!text) return true
  const n = parseVikt(value)
  return n === null || n === 0
}

/** Kolli with weight 1–150 kg is booked as 1 Halvpall. */
export function applyKolliHalvpallRule(
  godsslag: string,
  vikt: string | number | undefined,
): { godsslag: string; kolliAntal: string } {
  const isKolli = godsslag.trim().toLocaleLowerCase('sv') === 'kolli'
  const weight = parseVikt(vikt)
  if (isKolli && weight !== null && weight >= 1 && weight <= 150) {
    return { godsslag: 'Halvpall', kolliAntal: '1' }
  }
  return { godsslag, kolliAntal: '' }
}

export function resolveKolliAntal(
  kolli: string | number | undefined,
  pallplats: string | number | undefined,
  vikt: string | number | undefined,
  godsslag: string,
  forcedAntal: string,
): string {
  const key = godsslag.trim().toLocaleLowerCase('sv')
  if (key === 'halvpall') return formatDecimal2(1)
  if (forcedAntal) return formatDecimal2(forcedAntal)
  const source = key === 'pall' ? pallplats : kolli
  if (key === 'pall' && isEmptyOrZero(source)) {
    return ceilViktPer400(vikt)
  }
  return formatDecimal2(source)
}

export function resolveGodsAntal1(godsslag: string, kolliAntal: string): string {
  const key = godsslag.trim().toLocaleLowerCase('sv')
  const antal = parseVikt(kolliAntal)
  if (antal === null || antal <= 0) return ''
  if (key === 'halvpall') return formatDecimal2(antal * 0.5)
  if (key === 'pall') return formatDecimal2(antal)
  return ''
}

export function resolveGodsSort1(godsslag: string): string {
  const key = godsslag.trim().toLocaleLowerCase('sv')
  if (key === 'halvpall' || key === 'pall') return 'Ppl'
  return ''
}
