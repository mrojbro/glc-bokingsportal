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
  { id: 'coop-matkassar', label: 'Coop Matkassar', segment: 'coop-matkassar', status: 'coming-soon' },
  {
    id: 'coop-distribution',
    label: 'Coop Distribution',
    segment: 'coop-distribution',
    status: 'coming-soon',
  },
  { id: 'coop-frukt', label: 'Coop Frukt', segment: 'coop-frukt', status: 'coming-soon' },
  { id: 'comforta', label: 'Comforta', segment: 'comforta', status: 'coming-soon' },
  { id: 'lars-goran', label: 'Lars-Göran', segment: 'lars-goran', status: 'ready' },
]

/** All booking tools linked from the portal (A–Ö by label). */
export const BOOKING_TOOLS: BookingTool[] = [...BOOKING_TOOLS_UNSORTED].sort((a, b) =>
  a.label.localeCompare(b.label, 'sv', { sensitivity: 'base' }),
)

/** Direct dev-server URLs when using `npm run dev:vite` (avoids broken proxy on :5173). */
const DEV_TOOL_ORIGINS: Record<string, string> = {
  kaka: 'http://localhost:5174/kaka/',
  ewerman: 'http://localhost:5175/ewerman/',
  'lars-goran': 'http://localhost:5176/lars-goran/',
}

export function bookingToolHref(segment: string): string {
  if (import.meta.env.DEV && DEV_TOOL_ORIGINS[segment]) {
    return DEV_TOOL_ORIGINS[segment]
  }
  const base = import.meta.env.BASE_URL
  return `${base}${segment}/`
}
