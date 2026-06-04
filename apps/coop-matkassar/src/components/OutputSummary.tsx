import { useMemo } from 'react'
import {
  computeOutputSummary,
  formatSummaryNumber,
} from '../computeOutputSummary'
import type { OutputRow } from '../types'

interface OutputSummaryProps {
  rows: OutputRow[]
}

export function OutputSummary({ rows }: OutputSummaryProps) {
  const summary = useMemo(() => computeOutputSummary(rows), [rows])

  if (rows.length === 0) return null

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Sammanfattning per godsslag
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Summering av rader, kolli antal och kolli vikt
        </p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">
                Godsslag Temp
              </th>
              <th className="px-4 py-2.5 font-medium text-[var(--color-text-muted)]">
                Godsslag
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-[var(--color-text-muted)]">
                Rader
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-[var(--color-text-muted)]">
                Kolli antal
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-[var(--color-text-muted)]">
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
              <td className="px-4 py-2.5 text-[var(--color-text)]" colSpan={2}>
                Totalt
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text)]">
                {summary.totals.rowCount}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent)]">
                {formatSummaryNumber(summary.totals.kolliAntalSum)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent)]">
                {formatSummaryNumber(summary.totals.kolliViktSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
