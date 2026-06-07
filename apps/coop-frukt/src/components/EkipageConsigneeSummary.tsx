import type { EkipageConsigneeCountRow } from '../types/register'

interface EkipageConsigneeSummaryProps {
  rows: EkipageConsigneeCountRow[]
}

export function EkipageConsigneeSummary({ rows }: EkipageConsigneeSummaryProps) {
  if (rows.length === 0) return null

  const total = rows.reduce((sum, row) => sum + row.consigneeCount, 0)

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">
        Sammanfattning · Consignees per Ekipage
      </h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.ekipage}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 text-sm"
          >
            <span className="text-[var(--color-text)]">{row.ekipage}</span>
            <span className="text-right font-medium tabular-nums text-[var(--color-accent)]">
              {row.consigneeCount}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-[1fr_auto] items-baseline gap-x-3 border-t border-[var(--color-border-subtle)] px-0 pt-3 text-sm">
        <span className="font-medium text-[var(--color-text-muted)]">Totalt</span>
        <span className="text-right font-semibold tabular-nums text-[var(--color-text)]">
          {total}
        </span>
      </div>
    </div>
  )
}
