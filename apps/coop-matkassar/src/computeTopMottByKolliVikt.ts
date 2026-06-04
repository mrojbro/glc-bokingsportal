import type { OutputRow } from './types'

export interface MottKolliViktEntry {
  name: string
  kolliVikt: number
}

function parseNum(value: string): number {
  if (!value.trim()) return 0
  const n = parseFloat(value.trim().replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function computeTopMottByKolliVikt(
  rows: OutputRow[],
  limit = 5,
): MottKolliViktEntry[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    const name = row['Mott. Namn'].trim() || '—'
    totals.set(name, (totals.get(name) ?? 0) + parseNum(row['Kolli vikt']))
  }

  return [...totals.entries()]
    .map(([name, kolliVikt]) => ({ name, kolliVikt }))
    .filter((entry) => entry.kolliVikt > 0)
    .sort((a, b) => b.kolliVikt - a.kolliVikt)
    .slice(0, limit)
}
