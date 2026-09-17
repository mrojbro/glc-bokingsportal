import type { OutputRow } from './types'

export interface SummaryLine {
  label: string
  rowCount: number
  viktSum: number
  antalSum: number
}

export interface GroupSummary {
  lines: SummaryLine[]
  totals: SummaryLine
}

export interface OutputSummaries {
  byInstruction: GroupSummary
  byGodsslag: GroupSummary
  byTemp: GroupSummary
  byLittera: GroupSummary
}

function parseNum(value: string): number {
  if (!value.trim()) return 0
  const n = parseFloat(value.trim().replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function formatSummaryNumber(n: number, decimals = 2): string {
  return n.toLocaleString('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function emptyTotals(): SummaryLine {
  return { label: 'Totalt', rowCount: 0, viktSum: 0, antalSum: 0 }
}

function groupBy(
  rows: readonly OutputRow[],
  getLabel: (row: OutputRow) => string,
): GroupSummary {
  const map = new Map<string, SummaryLine>()

  for (const row of rows) {
    const label = getLabel(row).trim() || '—'
    const line = map.get(label) ?? {
      label,
      rowCount: 0,
      viktSum: 0,
      antalSum: 0,
    }
    line.rowCount += 1
    line.viktSum += parseNum(row['Kolli vikt'])
    line.antalSum += parseNum(row['Kolli antal'])
    map.set(label, line)
  }

  const lines = [...map.values()].sort((a, b) =>
    a.label.localeCompare(b.label, 'sv', { sensitivity: 'base' }),
  )
  const totals = lines.reduce((acc, line) => {
    acc.rowCount += line.rowCount
    acc.viktSum += line.viktSum
    acc.antalSum += line.antalSum
    return acc
  }, emptyTotals())

  return { lines, totals }
}

export function computeOutputSummaries(rows: OutputRow[]): OutputSummaries {
  return {
    byInstruction: groupBy(rows, (row) => row.Chaufförsinstruktion),
    byGodsslag: groupBy(rows, (row) => row.Godsslag),
    byTemp: groupBy(rows, (row) => row['Godsslag Temp']),
    byLittera: groupBy(rows, (row) => row.Littera),
  }
}
