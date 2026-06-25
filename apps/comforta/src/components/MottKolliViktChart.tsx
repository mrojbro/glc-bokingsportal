import { useMemo } from 'react'
import { formatSummaryNumber } from '../computeOutputSummary'
import { computeTopMottByKolliVikt } from '../computeTopMottByKolliVikt'
import type { OutputRow } from '../types'

const BAR_COLORS = ['#58a6ff', '#3fb950', '#d29922', '#a371f7', '#39c5cf']

interface MottKolliViktChartProps {
  rows: OutputRow[]
}

export function MottKolliViktChart({ rows }: MottKolliViktChartProps) {
  const data = useMemo(() => computeTopMottByKolliVikt(rows), [rows])
  const maxVikt = data[0]?.kolliVikt ?? 0

  if (rows.length === 0) return null

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Topp 5 — Kolli vikt per Mott. Namn
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Största mottagare efter summerad kolli vikt
        </p>
      </div>

      {data.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-4 text-sm text-[var(--color-text-muted)]">
          Ingen kolli vikt att visa ännu.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col justify-center gap-5 px-4 py-5">
          {data.map((entry, index) => {
            const barWidth =
              maxVikt > 0 ? Math.max(2, (entry.kolliVikt / maxVikt) * 100) : 0

            return (
              <li key={`${entry.name}-${index}`} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="min-w-0 truncate text-sm text-[var(--color-text)]"
                    title={entry.name}
                  >
                    {entry.name}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-[var(--color-accent)]">
                    {formatSummaryNumber(entry.kolliVikt)}
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-elevated)]"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
