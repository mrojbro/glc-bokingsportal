import registerData from './data/postnrRegister.json'
import litteraData from './data/litteraRegister.json'
import litteraOverrideData from './data/litteraOverrides.json'
import postnrRewriteData from './data/postnrRewriteRules.json'
import type { OutputRow } from './types'

export interface PostnrRegisterEntry {
  postnr: string
  transportinstruktion: string
}

export interface LitteraRegisterEntry {
  sorteringskod: string
  littera: string
}

export interface LitteraOverrideEntry {
  postnr: string
  littera: string
}

export interface PostnrRewriteRule {
  namn?: string
  fromPostnr?: string
  toPostnr: string
}

export const POSTNR_REGISTER: PostnrRegisterEntry[] =
  registerData as PostnrRegisterEntry[]

export const LITTERA_REGISTER: LitteraRegisterEntry[] =
  litteraData as LitteraRegisterEntry[]

/** Postnr that should not follow the Sorteringskod v1 → Littera default. */
export const LITTERA_OVERRIDES: LitteraOverrideEntry[] =
  litteraOverrideData as LitteraOverrideEntry[]

/** Rewrite incoming Mott. Postnr for specific mottagare before register lookup. */
export const POSTNR_REWRITE_RULES: PostnrRewriteRule[] =
  postnrRewriteData as PostnrRewriteRule[]

export function normalizePostnr(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .replace(/\.0+$/, '')
    .trim()
}

function normalizeSorteringskod(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

function normalizeNamn(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/[–—−]/g, '-')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

function namnTokens(raw: string): string[] {
  return normalizeNamn(raw)
    .split(/[^a-z0-9åäö]+/)
    .filter((token) => token.length > 1)
}

function namnMatchesRule(
  row: Pick<OutputRow, 'Mott. Namn' | 'Mott. Adress' | 'Mott. Postort' | 'Märkning'>,
  ruleNamn: string,
): boolean {
  const tokens = namnTokens(ruleNamn)
  if (tokens.length === 0) return true

  const haystack = normalizeNamn(
    [
      row['Mott. Namn'],
      row['Mott. Adress'],
      row['Mott. Postort'],
      row.Märkning,
    ].join(' '),
  )

  return tokens.every((token) => haystack.includes(token))
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

export function buildLitteraRegisterLookup(
  entries: readonly LitteraRegisterEntry[],
): Map<string, string> {
  const map = new Map<string, string>()
  for (const entry of entries) {
    const key = normalizeSorteringskod(entry.sorteringskod)
    if (!key) continue
    map.set(key, entry.littera.trim())
  }
  return map
}

export function buildLitteraOverrideLookup(
  entries: readonly LitteraOverrideEntry[],
): Map<string, string> {
  const map = new Map<string, string>()
  for (const entry of entries) {
    const key = normalizePostnr(entry.postnr)
    if (!key) continue
    map.set(key, entry.littera.trim())
  }
  return map
}

export const POSTNR_REGISTER_LOOKUP = buildPostnrRegisterLookup(POSTNR_REGISTER)
export const LITTERA_REGISTER_LOOKUP = buildLitteraRegisterLookup(LITTERA_REGISTER)
export const LITTERA_OVERRIDE_LOOKUP = buildLitteraOverrideLookup(LITTERA_OVERRIDES)

export function applyPostnrRewrite(
  row: Pick<
    OutputRow,
    'Mott. Namn' | 'Mott. Adress' | 'Mott. Postnr' | 'Mott. Postort' | 'Märkning'
  >,
  rules: readonly PostnrRewriteRule[] = POSTNR_REWRITE_RULES,
): boolean {
  const postnr = normalizePostnr(row['Mott. Postnr'])

  for (const rule of rules) {
    const toPostnr = normalizePostnr(rule.toPostnr)
    if (!toPostnr) continue

    const fromPostnr = rule.fromPostnr ? normalizePostnr(rule.fromPostnr) : ''
    if (fromPostnr && fromPostnr !== postnr) continue

    if (rule.namn && !namnMatchesRule(row, rule.namn)) continue

    if (!rule.namn && !fromPostnr) continue

    row['Mott. Postnr'] = toPostnr
    return true
  }

  return false
}

export function lookupTransportinstruktion(
  postnr: string,
  lookup: ReadonlyMap<string, string> = POSTNR_REGISTER_LOOKUP,
): string {
  const key = normalizePostnr(postnr)
  if (!key) return ''
  return lookup.get(key) ?? ''
}

export function lookupLittera(
  sorteringskod: string,
  lookup: ReadonlyMap<string, string> = LITTERA_REGISTER_LOOKUP,
): string {
  const key = normalizeSorteringskod(sorteringskod)
  if (!key) return ''
  return lookup.get(key) ?? ''
}

export function lookupLitteraForRow(
  postnr: string,
  sorteringskod: string,
  overrideLookup: ReadonlyMap<string, string> = LITTERA_OVERRIDE_LOOKUP,
  litteraLookup: ReadonlyMap<string, string> = LITTERA_REGISTER_LOOKUP,
): string {
  const override = overrideLookup.get(normalizePostnr(postnr))
  if (override) return override
  return lookupLittera(sorteringskod, litteraLookup)
}

export function applyRegisterLookups(
  row: Pick<OutputRow, 'Mott. Postnr' | 'Chaufförsinstruktion' | 'Littera'>,
  postnrLookup: ReadonlyMap<string, string> = POSTNR_REGISTER_LOOKUP,
  litteraLookup: ReadonlyMap<string, string> = LITTERA_REGISTER_LOOKUP,
  overrideLookup: ReadonlyMap<string, string> = LITTERA_OVERRIDE_LOOKUP,
): boolean {
  const instruction = lookupTransportinstruktion(row['Mott. Postnr'], postnrLookup)
  row.Chaufförsinstruktion = instruction
  row.Littera = lookupLitteraForRow(
    row['Mott. Postnr'],
    instruction,
    overrideLookup,
    litteraLookup,
  )
  const postnr = normalizePostnr(row['Mott. Postnr'])
  if (!postnr) return true
  return instruction !== '' && row.Littera !== ''
}
