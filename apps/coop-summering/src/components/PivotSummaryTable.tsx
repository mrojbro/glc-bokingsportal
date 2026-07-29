import { useMemo, useState } from 'react'
import { formatQuantity } from '../computePivot'
import { copyPivotForOutlook } from '../copyPivot'
import type { PivotSummary } from '../types'

interface PivotSummaryTableProps {
  summary: PivotSummary
}

export function PivotSummaryTable({ summary }: PivotSummaryTableProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const hasData = summary.rowLabels.length > 0 && summary.columnLabels.length > 0

  const handleCopy = async () => {
    try {
      await copyPivotForOutlook(summary)
      setCopyStatus('Kopierat — klistra in i Outlook (Ctrl+V).')
    } catch {
      setCopyStatus('Kunde inte kopiera. Markera tabellen och kopiera manuellt.')
    }
  }

  const emptyNote = useMemo(() => {
    if (hasData) return null
    return 'Ingen summering ännu.'
  }, [hasData])

  if (!hasData) {
    return (
      <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
        {emptyNote}
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Summering
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Rader: Transportation Group (Description) · Kolumner: Load Carrier ·
            Värde: Quantity
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
        >
          Kopiera till Outlook
        </button>
      </div>

      {copyStatus && (
        <p className="border-b border-[var(--color-border-subtle)] px-4 py-2 text-xs text-[var(--color-accent)]">
          {copyStatus}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="sticky left-0 z-10 bg-[var(--color-surface-elevated)] px-4 py-2.5 font-medium text-[var(--color-text-muted)]">
                Transportation Group (Description)
              </th>
              {summary.columnLabels.map((label) => (
                <th
                  key={label}
                  className="px-4 py-2.5 text-right font-medium text-[var(--color-text-muted)]"
                >
                  {label}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium text-[var(--color-text-muted)]">
                Totalt
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.rowLabels.map((rowLabel) => (
              <tr
                key={rowLabel}
                className="border-b border-[var(--color-border-subtle)]"
              >
                <td className="sticky left-0 z-10 bg-[var(--color-surface-card)] px-4 py-2 text-[var(--color-text)]">
                  {rowLabel}
                </td>
                {summary.columnLabels.map((colLabel) => (
                  <td
                    key={colLabel}
                    className="px-4 py-2 text-right tabular-nums text-[var(--color-text)]"
                  >
                    {formatQuantity(summary.values[rowLabel]?.[colLabel] ?? 0)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-semibold tabular-nums text-[var(--color-text)]">
                  {formatQuantity(summary.rowTotals[rowLabel] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--color-surface-elevated)] font-semibold">
              <td className="sticky left-0 z-10 bg-[var(--color-surface-elevated)] px-4 py-2.5 text-[var(--color-text)]">
                Totalt
              </td>
              {summary.columnLabels.map((colLabel) => (
                <td
                  key={colLabel}
                  className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent)]"
                >
                  {formatQuantity(summary.columnTotals[colLabel] ?? 0)}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent)]">
                {formatQuantity(summary.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
