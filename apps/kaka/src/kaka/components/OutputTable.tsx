import { getOutputColumnWidth, getVisibleOutputColumns } from '../outputColumnConfig'
import type { OutputColumn } from '../constants'
import type { OutputRow } from '../types'

const ROW_NUM_WIDTH = 48
const ACTION_COL_WIDTH = 88

interface OutputTableProps {
  rows: OutputRow[]
  onCellChange: (rowIndex: number, column: OutputColumn, value: string) => void
  onDeleteRow: (rowIndex: number) => void
}

export function OutputTable({ rows, onCellChange, onDeleteRow }: OutputTableProps) {
  const visibleColumns = getVisibleOutputColumns()

  if (rows.length === 0) return null

  const tableWidth =
    ROW_NUM_WIDTH +
    ACTION_COL_WIDTH +
    visibleColumns.reduce((sum, col) => sum + getOutputColumnWidth(col), 0)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="overflow-x-auto">
        <table
          className="table-fixed border-collapse text-left text-xs"
          style={{ width: tableWidth, minWidth: '100%' }}
        >
          <colgroup>
            <col style={{ width: ROW_NUM_WIDTH }} />
            {visibleColumns.map((col) => (
              <col key={col} style={{ width: getOutputColumnWidth(col) }} />
            ))}
            <col style={{ width: ACTION_COL_WIDTH }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="sticky left-0 z-20 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-2 font-medium text-[var(--color-text-muted)]">
                #
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col}
                  className="overflow-hidden border-r border-[var(--color-border-subtle)] px-2 py-2 font-medium text-[var(--color-text-muted)]"
                  title={col}
                >
                  <span className="block truncate">{col}</span>
                </th>
              ))}
              <th className="sticky right-0 z-20 border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-2 font-medium text-[var(--color-text-muted)]">
                Åtgärd
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-elevated)]/50"
              >
                <td className="sticky left-0 z-10 border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] px-2 py-1 text-[var(--color-text-muted)]">
                  {rowIndex + 1}
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col}
                    className="overflow-hidden border-r border-[var(--color-border-subtle)] p-0"
                  >
                    <input
                      type="text"
                      value={row[col]}
                      onChange={(e) => onCellChange(rowIndex, col, e.target.value)}
                      className="w-full min-w-0 border-0 bg-transparent px-2 py-1.5 text-[var(--color-text)] outline-none focus:bg-[var(--color-accent-dim)] focus:ring-1 focus:ring-[var(--color-accent)]/50"
                    />
                  </td>
                ))}
                <td className="sticky right-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onDeleteRow(rowIndex)}
                    className="rounded px-2 py-1 text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/15"
                  >
                    Ta bort
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
        Kolumnbredd och dolda kolumner styrs i{' '}
        <code className="text-[var(--color-text)]">src/kaka/outputColumnConfig.ts</code>.
        Nedladdning inkluderar alla kolumner.
      </p>
    </div>
  )
}
