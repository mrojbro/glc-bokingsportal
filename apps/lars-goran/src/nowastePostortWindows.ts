import { CARRIER_OUTPUT_PRESETS } from './constants'
import type { OutputRow } from './types'

export const NOWASTE_KUNDR =
  CARRIER_OUTPUT_PRESETS['GLC Distribution Gbg'].Kundnr ?? '115343'

export interface NowasteDeliveryWindow {
  startid: string
  sluttid: string
  chaufforsinstruktion: string
}

const WINDOWS: Record<string, NowasteDeliveryWindow> = {
  gråbo: {
    startid: '06:00',
    sluttid: '09:00',
    chaufforsinstruktion: 'Leverans senast 09:00',
  },
  alingsås: {
    startid: '06:00',
    sluttid: '12:00',
    chaufforsinstruktion: 'Leverans senast 12:00',
  },
  strömstad: {
    startid: '06:00',
    sluttid: '11:30',
    chaufforsinstruktion: 'Leverans senast 11:30',
  },
  kungsbacka: {
    startid: '06:00',
    sluttid: '11:00',
    chaufforsinstruktion: 'Leverans senast 11:00',
  },
  nordstan: {
    startid: '06:00',
    sluttid: '10:00',
    chaufforsinstruktion: 'Leverans senast 10:00',
  },
}

const DEFAULT_WINDOW: NowasteDeliveryWindow = {
  startid: '06:00',
  sluttid: '12:00',
  chaufforsinstruktion: 'Leverans senast 12:00',
}

const PLACE_ALIASES: Record<string, string> = {
  grabo: 'gråbo',
  graabo: 'gråbo',
  alingsas: 'alingsås',
  allingsås: 'alingsås',
  allingsas: 'alingsås',
  stromstad: 'strömstad',
}

function normalizePlace(value: string): string {
  const key = value
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('sv')
  return PLACE_ALIASES[key] ?? key
}

export function lookupNowasteWindow(
  postort: string,
  mottNamn = '',
): NowasteDeliveryWindow | undefined {
  const post = normalizePlace(postort)
  if (post && WINDOWS[post]) return WINDOWS[post]

  const namn = normalizePlace(mottNamn)
  const haystacks = [post, namn].filter(Boolean)

  for (const [place, window] of Object.entries(WINDOWS)) {
    if (haystacks.some((text) => text === place || text.includes(place))) {
      return window
    }
  }

  return undefined
}

/** Start/end and chauffeur note for Nowaste rows with a known Mott. Postort. */
export function applyNowasteDeliveryWindow(row: OutputRow): void {
  if (row.Kundnr.trim() !== NOWASTE_KUNDR) return

  const window =
    lookupNowasteWindow(row['Mott. Postort'], row['Mott. Namn']) ??
    DEFAULT_WINDOW

  row.Startid = window.startid
  row.Sluttid = window.sluttid
  row.Chaufförsinstruktion = window.chaufforsinstruktion
}
