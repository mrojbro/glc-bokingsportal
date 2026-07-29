import { ROW_FIELD, type SourceConfig } from './constants'
import type { InputRow } from './types'

function descriptionOf(row: InputRow): string {
  return (row[ROW_FIELD] ?? '').trim()
}

function normalizeDescription(description: string): string {
  return description
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

function isOneOf(description: string, allowed: readonly string[]): boolean {
  const key = normalizeDescription(description)
  return allowed.some((value) => normalizeDescription(value) === key)
}

/** Allowed Description values for Coop Eskilstuna-Enköping (all go to summary). */
const ESKILSTUNA_ALLOWED = ['Dry', 'Fresh/Chilled', 'Frozen'] as const

/**
 * Allowed Description values for Nowaste Helsingborg.
 * Fruits (Direkt) is accepted by the source filter but excluded from summary.
 */
const NOWASTE_ALLOWED = [
  'Fruits (Direkt)',
  'Fruits (GLC)',
  'Fruits (Flytten)',
] as const

const NOWASTE_EXCLUDED_FROM_SUMMARY = ['Fruits (Direkt)'] as const

/**
 * Source-specific rules for which rows enter the summary.
 * - Coop Eskilstuna-Enköping: only Dry, Fresh/Chilled, Frozen
 * - Nowaste Helsingborg: only Fruits (Direkt|GLC|Flytten); Direkt not summed
 */
export function filterRowsForSource(
  sourceId: SourceConfig['id'],
  rows: InputRow[],
): { kept: InputRow[]; filteredOut: number } {
  let kept: InputRow[]

  switch (sourceId) {
    case 'coop-eskilstuna-enkoping':
      kept = rows.filter((row) =>
        isOneOf(descriptionOf(row), ESKILSTUNA_ALLOWED),
      )
      break
    case 'nowaste-helsingborg':
      kept = rows.filter((row) => {
        const description = descriptionOf(row)
        if (!isOneOf(description, NOWASTE_ALLOWED)) return false
        if (isOneOf(description, NOWASTE_EXCLUDED_FROM_SUMMARY)) return false
        return true
      })
      break
    default:
      kept = rows
      break
  }

  return { kept, filteredOut: rows.length - kept.length }
}
