export type BookingToolStatus = 'ready' | 'coming-soon'

export interface BookingTool {
  id: string
  label: string
  segment: string
  status: BookingToolStatus
}

const BOOKING_TOOLS_UNSORTED: BookingTool[] = [
  { id: 'kaka', label: 'Kåkå', segment: 'kaka', status: 'ready' },
  { id: 'ewerman', label: 'Ewerman', segment: 'ewerman', status: 'ready' },
  {
    id: 'broderna-hanssons',
    label: 'Bröderna Hanssons',
    segment: 'broderna-hanssons',
    status: 'coming-soon',
  },
  { id: 'coop-matkassar', label: 'Coop Matkassar', segment: 'coop-matkassar', status: 'ready' },
  { id: 'coop-frukt', label: 'Coop Frukt', segment: 'coop-frukt', status: 'ready' },
  {
    id: 'coop-distribution',
    label: 'Coop Distribution',
    segment: 'coop-distribution',
    status: 'coming-soon',
  },
  { id: 'comforta', label: 'Comforta', segment: 'comforta', status: 'coming-soon' },
  { id: 'lars-goran', label: 'Lars-Göran', segment: 'lars-goran', status: 'ready' },
  { id: 'placeholder-1', label: '', segment: 'placeholder-1', status: 'coming-soon' },
]

/** All booking tools linked from the portal (A–Ö by label; empty slots last). */
export const BOOKING_TOOLS: BookingTool[] = [...BOOKING_TOOLS_UNSORTED].sort((a, b) => {
  const aEmpty = !a.label.trim()
  const bEmpty = !b.label.trim()
  if (aEmpty && !bEmpty) return 1
  if (!aEmpty && bEmpty) return -1
  return a.label.localeCompare(b.label, 'sv', { sensitivity: 'base' })
})

/** Greyed-out summary tools below the booking grid (not yet available). */
export const SUMMERING_TOOLS: BookingTool[] = [
  {
    id: 'coop-summering',
    label: 'Coop Summering',
    segment: 'coop-summering',
    status: 'coming-soon',
  },
  {
    id: 'lokalt-summering',
    label: 'Lokalt Summering',
    segment: 'lokalt-summering',
    status: 'coming-soon',
  },
  {
    id: 'fjarr-summering',
    label: 'Fjärr Summering',
    segment: 'fjarr-summering',
    status: 'coming-soon',
  },
]

/** Direct dev-server URLs when using `npm run dev:vite` (avoids broken proxy on :5173). */
const DEV_TOOL_ORIGINS: Record<string, string> = {
  kaka: 'http://localhost:5174/kaka/',
  ewerman: 'http://localhost:5175/ewerman/',
  'lars-goran': 'http://localhost:5176/lars-goran/',
  'coop-matkassar': 'http://localhost:5177/coop-matkassar/',
  'coop-frukt': 'http://localhost:5178/coop-frukt/',
}

export function bookingToolHref(segment: string): string {
  if (import.meta.env.DEV && DEV_TOOL_ORIGINS[segment]) {
    return DEV_TOOL_ORIGINS[segment]
  }
  const base = import.meta.env.BASE_URL
  return `${base}${segment}/`
}
