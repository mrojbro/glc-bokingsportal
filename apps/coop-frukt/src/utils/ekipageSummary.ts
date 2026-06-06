import type { EkipageConsigneeCountRow, EkipageSummaryRow } from '../types/register'

export function ekipageSortKey(ekipage: string): number {
  const match = ekipage.match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : 9999
}

export function sortEkipageNames(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const byNumber = ekipageSortKey(a) - ekipageSortKey(b)
    if (byNumber !== 0) return byNumber
    return a.localeCompare(b, 'sv', { sensitivity: 'base' })
  })
}

/** Sum gross weight (kg) per ekipage from transformed rows. */
export function buildEkipageSummary(
  items: readonly { ekipage: string; grossWeightKg: number }[],
): EkipageSummaryRow[] {
  const totals = new Map<string, number>()

  for (const { ekipage, grossWeightKg } of items) {
    if (grossWeightKg <= 0) continue
    const key = ekipage.trim() || 'Okänd ekipage'
    totals.set(key, (totals.get(key) ?? 0) + grossWeightKg)
  }

  return [...totals.entries()]
    .map(([ekipage, grossWeight]) => ({ ekipage, grossWeight }))
    .sort((a, b) => {
      const byNumber = ekipageSortKey(a.ekipage) - ekipageSortKey(b.ekipage)
      if (byNumber !== 0) return byNumber
      return a.ekipage.localeCompare(b.ekipage, 'sv', { sensitivity: 'base' })
    })
}

export function formatSummaryWeight(kg: number): string {
  return kg.toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/** Count consignee rows per ekipage. */
export function buildEkipageConsigneeSummary(
  items: readonly { ekipage: string; consignee: string }[],
): EkipageConsigneeCountRow[] {
  const counts = new Map<string, number>()

  for (const { ekipage, consignee } of items) {
    if (!consignee.trim()) continue
    const key = ekipage.trim() || 'Okänd ekipage'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return sortEkipageNames([...counts.keys()]).map((ekipage) => ({
    ekipage,
    consigneeCount: counts.get(ekipage) ?? 0,
  }))
}
