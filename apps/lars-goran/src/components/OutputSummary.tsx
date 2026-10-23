import { useMemo } from 'react'
import {
  computeOutputSummary,
  formatSummaryNumber,
} from '../computeOutputSummary'
import type { OutputRow } from '../types'

interface OutputSummaryProps {
  rows: OutputRow[]
  title?: string
  subtitle?: string
}

export function OutputSummary({
  rows,
  title = 'Sammanfattning per godsslag',
  subtitle = 'Summering av rader, kolli antal och kolli vikt',
}: OutputSummaryProps) {
  const summary = useMemo(() => computeOutputSummary(rows), [rows])

  return (
    <div className="flex h-full min-h-[240px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="border-b border-[var(--color-border)] px-4 py-2">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-2 font-medium text-[var(--color-text-muted)]">
                Godsslag Temp
              </th>
              <th className="px-4 py-2 font-medium text-[var(--color-text-muted)]">
                Godsslag
              </th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">
                Rader
              </th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">
                Kolli antal
              </th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">
                Kolli vikt
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.lines.map((line) => (
              <tr
                key={`${line.godsslagTemp}-${line.godsslag}`}
                className="border-b border-[var(--color-border-subtle)]"
              >
                <td className="px-4 py-2 text-[var(--color-text)]">
                  {line.godsslagTemp}
                </td>
                <td className="px-4 py-2 text-[var(--color-text)]">{line.godsslag}</td>
                <td className="px-4 py-2 text-right tabular-nums text-[var(--color-text)]">
                  {line.rowCount}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-[var(--color-text)]">
                  {formatSummaryNumber(line.kolliAntalSum)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-[var(--color-text)]">
                  {formatSummaryNumber(line.kolliViktSum)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--color-surface-elevated)] font-semibold">
              <td className="px-4 py-2 text-[var(--color-text)]" colSpan={2}>
                Totalt
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-[var(--color-text)]">
                {summary.totals.rowCount}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-[var(--color-accent)]">
                {formatSummaryNumber(summary.totals.kolliAntalSum)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-[var(--color-accent)]">
                {formatSummaryNumber(summary.totals.kolliViktSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
