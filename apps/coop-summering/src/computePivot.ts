import { COLUMN_FIELD, ROW_FIELD, VALUE_FIELD } from './constants'
import type { InputRow, PivotSummary } from './types'

function parseQuantity(value: string | undefined): number {
  if (!value) return 0
  const text = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!text) return 0
  const n = Number(text)
  return Number.isFinite(n) ? n : 0
}

function sortLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => a.localeCompare(b, 'sv', { sensitivity: 'base' }))
}

/** Pivot: rows = Transportation Group (Description), columns = Load Carrier, values = Quantity sum. */
export function computePivotSummary(rows: InputRow[]): PivotSummary {
  const values: Record<string, Record<string, number>> = {}
  const rowSet = new Set<string>()
  const colSet = new Set<string>()

  for (const row of rows) {
    const rowLabel = (row[ROW_FIELD] ?? '').trim() || '—'
    const colLabel = (row[COLUMN_FIELD] ?? '').trim() || '—'
    const qty = parseQuantity(row[VALUE_FIELD])

    rowSet.add(rowLabel)
    colSet.add(colLabel)

    if (!values[rowLabel]) values[rowLabel] = {}
    values[rowLabel][colLabel] = (values[rowLabel][colLabel] ?? 0) + qty
  }

  const rowLabels = sortLabels([...rowSet])
  const columnLabels = sortLabels([...colSet])

  const rowTotals: Record<string, number> = {}
  const columnTotals: Record<string, number> = {}
  let grandTotal = 0

  for (const rowLabel of rowLabels) {
    let rowTotal = 0
    for (const colLabel of columnLabels) {
      const cell = values[rowLabel]?.[colLabel] ?? 0
      rowTotal += cell
      columnTotals[colLabel] = (columnTotals[colLabel] ?? 0) + cell
    }
    rowTotals[rowLabel] = rowTotal
    grandTotal += rowTotal
  }

  return {
    rowLabels,
    columnLabels,
    values,
    rowTotals,
    columnTotals,
    grandTotal,
  }
}

export function formatQuantity(n: number): string {
  if (n === 0) return ''
  const rounded = Math.round(n * 1000) / 1000
  return Number.isInteger(rounded)
    ? rounded.toLocaleString('sv-SE')
    : rounded.toLocaleString('sv-SE', { maximumFractionDigits: 3 })
}
