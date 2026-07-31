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
  { id: 'coop-frukt', label: 'Coop Frukt', segment: 'coop-frukt', status: 'coming-soon' },
  { id: 'coop-tomgods', label: 'Coop Tomgods', segment: 'coop-tomgods', status: 'ready' },
  {
    id: 'coop-distribution',
    label: 'Coop Distribution',
    segment: 'coop-distribution',
    status: 'coming-soon',
  },
  { id: 'comforta', label: 'Comforta', segment: 'comforta', status: 'ready' },
  { id: 'lars-goran', label: 'Lars-Göran', segment: 'lars-goran', status: 'ready' },
]

/** All booking tools linked from the portal (A–Ö by label). */
export const BOOKING_TOOLS: BookingTool[] = [...BOOKING_TOOLS_UNSORTED]
  .filter((tool) => tool.label.trim())
  .sort((a, b) => a.label.localeCompare(b.label, 'sv', { sensitivity: 'base' }))

/** Greyed-out summary tools below the booking grid (not yet available). */
export const SUMMERING_TOOLS: BookingTool[] = [
  {
    id: 'coop-summering',
    label: 'Coop Summering',
    segment: 'coop-summering',
    status: 'ready',
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

export interface ExternalPortalLink {
  id: string
  label: string
  href: string
}

/** Fun / easter-egg links below summering tools. */
export const FUN_PORTAL_LINKS: ExternalPortalLink[] = [
  {
    id: 'vaga-tryck-har',
    label: 'Våga tryck här',
    href: 'https://www.youtube.com/watch?v=Sagg08DrO5U',
  },
  {
    id: 'vagar-du-trycka-har',
    label: 'Vågar du trycka här?',
    href: 'https://www.youtube.com/watch?v=-cLpZKVH07w',
  },
  {
    id: 'garanterad-lottovinst',
    label: 'Garanterad lottovinst',
    href: 'https://www.youtube.com/watch?v=kxSOhBdwmc4',
  },
  {
    id: 'jesus-lever',
    label: 'Jesus lever',
    href: 'https://www.youtube.com/watch?v=aTJncWndUB8',
  },
  {
    id: 'ring-ring',
    label: 'Ring Ring',
    href: 'https://www.youtube.com/watch?v=M-QbTGRuwmw',
  },
  {
    id: 'pineapple',
    label: 'Pineapple',
    href: 'https://www.youtube.com/watch?v=Ct6BUPvE2sM',
  },
]

/** Direct dev-server URLs when using `npm run dev:vite` (avoids broken proxy on :5173). */
const DEV_TOOL_ORIGINS: Record<string, string> = {
  kaka: 'http://localhost:5174/kaka/',
  ewerman: 'http://localhost:5175/ewerman/',
  'lars-goran': 'http://localhost:5176/lars-goran/',
  'coop-matkassar': 'http://localhost:5177/coop-matkassar/',
  'coop-frukt': 'http://localhost:5178/coop-frukt/',
  'coop-tomgods': 'http://localhost:5179/coop-tomgods/',
  comforta: 'http://localhost:5180/comforta/',
  'coop-summering': 'http://localhost:5181/coop-summering/',
}

export function bookingToolHref(segment: string): string {
  if (import.meta.env.DEV && DEV_TOOL_ORIGINS[segment]) {
    return DEV_TOOL_ORIGINS[segment]
  }
  const base = import.meta.env.BASE_URL
  return `${base}${segment}/`
}
