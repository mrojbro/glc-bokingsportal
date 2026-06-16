import { useCallback, useMemo, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { AddRowDialog } from './components/AddRowDialog'
import { LeverantorButtonGrid } from './components/LeverantorButtonGrid'
import { OutputTable } from './components/OutputTable'
import { downloadOutputExcel } from './exportOutputExcel'
import { createManualOutputRow } from './transform'
import type { OutputColumn } from './constants'
import type { OutputRow } from './types'

function todayIsoDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function App() {
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false)
  const [selectedLeverantor, setSelectedLeverantor] = useState<string | null>(null)
  const defaultDate = useMemo(() => todayIsoDate(), [])

  const handleLeverantorSelect = useCallback((leverantor: string) => {
    setSelectedLeverantor(leverantor)
    setAddRowDialogOpen(true)
  }, [])

  const handleConfirmAddRow = useCallback(
    (values: {
      leverantor: string
      date: string
      antalLastbarare: string
      antalPpl: string
      lastbarartyp: string
    }) => {
      const row = createManualOutputRow(values)
      setOutputRows((prev) => [...prev, row])
      setAddRowDialogOpen(false)
      setSelectedLeverantor(null)
    },
    [],
  )

  const handleCancelAddRow = useCallback(() => {
    setAddRowDialogOpen(false)
    setSelectedLeverantor(null)
  }, [])

  const handleCellChange = useCallback(
    (rowIndex: number, column: OutputColumn, value: string) => {
      setOutputRows((prev) =>
        prev.map((row, i) => (i === rowIndex ? { ...row, [column]: value } : row)),
      )
    },
    [],
  )

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setOutputRows((prev) => prev.filter((_, i) => i !== rowIndex))
  }, [])

  const handleDownload = useCallback(() => {
    if (outputRows.length === 0) return
    downloadOutputExcel(outputRows)
  }, [outputRows])

  const hasOutput = outputRows.length > 0

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Coop Tomgods — Bokning
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Välj leverantör, fyll i datum och antal — bygg bokningsrader manuellt.
              All bearbetning sker lokalt.
            </p>
          </div>
          <HubHomeLink />
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            1. Välj leverantör
          </h2>
          <LeverantorButtonGrid onSelect={handleLeverantorSelect} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            2. Förhandsgranskning ({outputRows.length} rader)
          </h2>
          {hasOutput ? (
            <OutputTable
              rows={outputRows}
              onCellChange={handleCellChange}
              onDeleteRow={handleDeleteRow}
            />
          ) : (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
              Inga rader ännu. Klicka på en leverantör ovan för att lägga till.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            3. Ladda ner
          </h2>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasOutput}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ladda ner .xlsx
          </button>
          {!hasOutput && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Minst en utrad krävs för nedladdning.
            </p>
          )}
        </section>
      </main>

      <AddRowDialog
        open={addRowDialogOpen}
        leverantor={selectedLeverantor ?? ''}
        defaultDate={defaultDate}
        onConfirm={handleConfirmAddRow}
        onCancel={handleCancelAddRow}
      />
    </div>
  )
}
