import { useMemo } from 'react'
import {
  computeOutputSummaries,
  formatSummaryNumber,
  type GroupSummary,
} from '../computeOutputSummary'
import type { OutputRow } from '../types'

interface OutputSummaryProps {
  rows: OutputRow[]
}

interface SummaryBlockProps {
  title: string
  description?: string
  groupHeader: string
  countHeader?: string
  summary: GroupSummary
  showAntal?: boolean
  highlightFrysgods?: boolean
}

function SummaryBlock({
  title,
  description,
  groupHeader,
  countHeader = 'Rader',
  summary,
  showAntal = false,
  highlightFrysgods = false,
}: SummaryBlockProps) {
  return (
    <div className="flex min-w-0 max-h-[360px] min-h-[220px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="border-b border-[var(--color-border)] px-3 py-2.5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="w-[42%] px-2 py-2 font-medium text-[var(--color-text-muted)]">
                {groupHeader}
              </th>
              <th className="w-[18%] px-2 py-2 text-right font-medium text-[var(--color-text-muted)]">
                {countHeader}
              </th>
              {showAntal && (
                <th className="w-[20%] px-2 py-2 text-right font-medium text-[var(--color-text-muted)]">
                  Antal
                </th>
              )}
              <th className="w-[20%] px-2 py-2 text-right font-medium text-[var(--color-text-muted)]">
                Vikt
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.lines.map((line) => {
              const isFrys =
                highlightFrysgods &&
                line.label.trim().toLocaleLowerCase('sv') === 'frysgods'
              return (
                <tr
                  key={line.label}
                  className={
                    isFrys
                      ? 'border-b border-[var(--color-border-subtle)] bg-[#16324d]'
                      : 'border-b border-[var(--color-border-subtle)]'
                  }
                >
                  <td
                    className={
                      isFrys
                        ? 'max-w-0 truncate px-3 py-1.5 font-semibold text-[#7ec8ff]'
                        : 'max-w-0 truncate px-3 py-1.5 text-[var(--color-text)]'
                    }
                    title={line.label}
                  >
                    {line.label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-[var(--color-text)]">
                    {line.rowCount}
                  </td>
                  {showAntal && (
                    <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-[var(--color-text)]">
                      {formatSummaryNumber(line.antalSum)}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-[var(--color-text)]">
                    {formatSummaryNumber(line.viktSum)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--color-surface-elevated)] font-semibold">
              <td className="px-3 py-2 text-[var(--color-text)]">Totalt</td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-[var(--color-text)]">
                {summary.totals.rowCount}
              </td>
              {showAntal && (
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-[var(--color-accent)]">
                  {formatSummaryNumber(summary.totals.antalSum)}
                </td>
              )}
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-[var(--color-accent)]">
                {formatSummaryNumber(summary.totals.viktSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function OutputSummary({ rows }: OutputSummaryProps) {
  const summaries = useMemo(() => computeOutputSummaries(rows), [rows])

  if (rows.length === 0) return null

  return (
    <div className="grid grid-cols-4 items-stretch gap-3">
      <SummaryBlock
        title="Per terminal"
        groupHeader="Terminal"
        countHeader="Bokningar"
        summary={summaries.byInstruction}
      />
      <SummaryBlock
        title="Per godsslag"
        description="Rader, kolli antal och vikt per Pall / Halvpall / Kolli"
        groupHeader="Godsslag"
        summary={summaries.byGodsslag}
        showAntal
      />
      <SummaryBlock
        title="Per temperatur"
        description="Rader och vikt för Kylgods och Frysgods"
        groupHeader="Temp"
        summary={summaries.byTemp}
        highlightFrysgods
      />
      <SummaryBlock
        title="Per littera"
        description="Rader och vikt per distributionsområde"
        groupHeader="Littera"
        summary={summaries.byLittera}
      />
    </div>
  )
}
