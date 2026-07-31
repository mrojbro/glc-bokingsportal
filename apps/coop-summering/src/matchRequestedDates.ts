import { ROW_FIELD } from './constants'
import type { InputRow } from './types'

export const REQUESTED_DATE_FIELD =
  'Latest Requested Date (Unloading Location)' as const

function normalizeDescription(description: string): string {
  return description
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

/** Normalize a pasted date cell to yyyy-mm-dd when possible. */
export function normalizeRequestedDate(value: string): string | null {
  const text = value.replace(/\u00a0/g, ' ').trim()
  if (!text) return null

  // Excel serial date (e.g. 45868 or 45868.5)
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text)
    if (Number.isFinite(serial) && serial > 20000 && serial < 100000) {
      const utc = Math.round((serial - 25569) * 86400 * 1000)
      const date = new Date(utc)
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10)
      }
    }
  }

  // ISO / Excel-like: 2026-07-30T14:30:00 or 2026-07-30 14:30:00
  const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})(?:[ T].*)?$/)
  if (isoMatch) return isoMatch[1]

  // DD/MM/YYYY or DD.MM.YYYY with optional time
  const dmyMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:\s+.*)?$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    return `${year}-${month}-${day}`
  }

  // Fallback: date prefix before space/T
  const beforeTime = text.split(/[ T]/)[0] ?? text
  if (/^\d{4}-\d{2}-\d{2}$/.test(beforeTime)) return beforeTime

  return text.toLocaleLowerCase('sv')
}

/**
 * Collect unique requested dates from rows.
 * For Nowaste, Fruits (Direkt) is excluded from the date check.
 */
export function collectRequestedDates(
  sourceId: string,
  rows: InputRow[],
): string[] {
  const dates = new Set<string>()

  for (const row of rows) {
    if (sourceId === 'nowaste-helsingborg') {
      const description = normalizeDescription(row[ROW_FIELD] ?? '')
      if (description === normalizeDescription('Fruits (Direkt)')) continue
    }

    const normalized = normalizeRequestedDate(row[REQUESTED_DATE_FIELD] ?? '')
    if (normalized) dates.add(normalized)
  }

  return [...dates].sort()
}

/**
 * When both pivot sources are pasted, their requested-date sets must match.
 * Returns an error message, or null if OK.
 */
export function matchRequestedDatesAcrossSources(datesBySource: {
  sourceId: string
  label: string
  dates: string[]
}[]): string | null {
  if (datesBySource.length < 2) return null

  for (const entry of datesBySource) {
    if (entry.dates.length === 0) {
      return (
        `${entry.label}: saknar datum i ”${REQUESTED_DATE_FIELD}”. ` +
        (entry.sourceId === 'nowaste-helsingborg'
          ? 'Fruits (Direkt) räknas inte i datumkollen. '
          : '') +
        `Datumet måste matcha den andra källan.`
      )
    }
  }

  const [first, ...rest] = datesBySource
  const firstKey = first.dates.join('|')

  for (const other of rest) {
    if (other.dates.join('|') !== firstKey) {
      return (
        `Datum matchar inte mellan källorna. ` +
        `${first.label}: ${first.dates.join(', ')}. ` +
        `${other.label}: ${other.dates.join(', ')}. ` +
        `Kontrollera ”${REQUESTED_DATE_FIELD}” (Fruits (Direkt) räknas inte i datumkollen).`
      )
    }
  }

  return null
}
