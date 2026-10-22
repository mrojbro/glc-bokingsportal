import { INPUT_COLUMNS, type InputColumn } from './constants'

export function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
    .replace(/\.+$/, '')
}

function normalizeKey(header: string): string {
  return normalizeHeaderName(header)
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/, '')
    .replace(/[()]/g, '')
    .toLowerCase()
}

const CANONICAL_BY_NORMALIZED = new Map<string, InputColumn>(
  INPUT_COLUMNS.map((col) => [normalizeKey(col), col]),
)

const HEADER_ALIASES: Record<string, InputColumn> = {
  'requested date': 'Latest Requested Date (Unloading Location)',
  'latest requested date': 'Latest Requested Date (Unloading Location)',
  lastdatum: 'Latest Requested Date (Unloading Location)',
  datum: 'Latest Requested Date (Unloading Location)',
  'requested time': 'Latest Requested Time (Unloading Location)',
  'latest requested time': 'Latest Requested Time (Unloading Location)',
  tid: 'Latest Requested Time (Unloading Location)',
  'transport group': 'Transportation Group',
  transportgrupp: 'Transportation Group',
  varuslag: 'Transportation Group',
  'butik nr': 'Butiksnr',
  butik: 'Butiksnr',
  butiksnummer: 'Butiksnr',
  mottagaradress: 'Consignee Address',
  adress: 'Consignee Address',
}

export function resolveInputColumn(header: string): InputColumn | undefined {
  const key = normalizeKey(header)
  return CANONICAL_BY_NORMALIZED.get(key) ?? HEADER_ALIASES[key]
}
