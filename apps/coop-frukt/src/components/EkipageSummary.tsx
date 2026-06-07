import { formatSummaryWeight } from '../utils/ekipageSummary'
import type { EkipageSummaryRow } from '../types/register'

/** Ekipage gross weight above this (kg) is highlighted in red. */
const EKIPAGE_WEIGHT_WARNING_KG = 24_500

const SUMMARY_ROW_CLASS =
  'grid grid-cols-[1fr_auto] items-baseline gap-x-3 text-sm'

function isOverWeightLimit(kg: number): boolean {
  return kg > EKIPAGE_WEIGHT_WARNING_KG
}

interface EkipageSummaryProps {
  rows: EkipageSummaryRow[]
}

export function EkipageSummary({ rows }: EkipageSummaryProps) {
  if (rows.length === 0) return null

  const total = rows.reduce((sum, row) => sum + row.grossWeight, 0)

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">
        Sammanfattning · Gross Weight per Ekipage
      </h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => {
          const overLimit = isOverWeightLimit(row.grossWeight)
          return (
            <li
              key={row.ekipage}
              className={
                SUMMARY_ROW_CLASS +
                ' rounded-lg px-2 py-1.5 ' +
                (overLimit
                  ? 'border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  : '')
              }
            >
              <span className={overLimit ? '' : 'text-[var(--color-text)]'}>
                {row.ekipage}
              </span>
              <span
                className={
                  'text-right font-medium tabular-nums ' +
                  (overLimit ? '' : 'text-[var(--color-accent)]')
                }
              >
                {formatSummaryWeight(row.grossWeight)} kg
              </span>
            </li>
          )
        })}
      </ul>
      <div
        className={
          SUMMARY_ROW_CLASS +
          ' mt-3 border-t border-[var(--color-border-subtle)] px-2 pt-3'
        }
      >
        <span className="font-medium text-[var(--color-text-muted)]">Totalt</span>
        <span className="text-right font-semibold tabular-nums text-[var(--color-text)]">
          {formatSummaryWeight(total)} kg
        </span>
      </div>
    </div>
  )
}
