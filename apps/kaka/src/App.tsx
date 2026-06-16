import { useCallback, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { FileUpload } from './kaka/components/FileUpload'
import { OutputSummary } from './kaka/components/OutputSummary'
import { MottKolliViktChart } from './kaka/components/MottKolliViktChart'
import { OutputTable } from './kaka/components/OutputTable'
import { PasteInput } from './kaka/components/PasteInput'
import { SaturdayDeliveryDialog } from './kaka/components/SaturdayDeliveryDialog'
import { downloadOutputExcel } from './kaka/exportOutputExcel'
import { getTomorrowDate, isTomorrowSaturday } from './kaka/getTomorrowDate'
import {
  parseInputCsv,
  parseInputText,
  type ParseInputResult,
} from './kaka/parseInputCsv'
import { createBlankOutputRow, transformInputRows } from './kaka/transform'
import type { OutputColumn } from './kaka/constants'
import type { OutputRow } from './kaka/types'

export default function App() {
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [inputRowCount, setInputRowCount] = useState(0)
  const [pendingParse, setPendingParse] = useState<ParseInputResult | null>(null)
  const [saturdayDialogOpen, setSaturdayDialogOpen] = useState(false)

  const finishProcessing = useCallback(
    (parsed: ParseInputResult, deliveryDate?: string) => {
      if (parsed.parseError) {
        setError(parsed.parseError)
        return
      }

      if (parsed.missingColumns.length > 0) {
        setWarning(
          `Följande indatakolumner saknas i indata (valfria): ${parsed.missingColumns.join(', ')}`,
        )
      }

      if (parsed.rows.length === 0) {
        setError('Indata innehåller inga datarader.')
        return
      }

      const date = deliveryDate ?? getTomorrowDate()
      setSourceLabel(parsed.fileLabel)
      setInputRowCount(parsed.rows.length)
      const transformed = transformInputRows(parsed.rows, deliveryDate)
      setOutputRows(transformed)

      if (transformed.length === 0) {
        setStatus(
          `${parsed.rows.length} indatarad(er) lästes in, men inga rader matchade Trpsätt-reglerna (GLC/Turbil/Gbg eller GLC/Timbil/Gbg). Lägg till rader manuellt eller använd annan indata.`,
        )
      } else {
        setStatus(
          `Transformering klar: ${parsed.rows.length} indatarad(er) → ${transformed.length} utrad(er). Datum satt till ${date}.`,
        )
      }
    },
    [],
  )

  const tryProcessParsedInput = useCallback(
    (parsed: ParseInputResult) => {
      if (parsed.parseError) {
        finishProcessing(parsed)
        return
      }

      if (parsed.rows.length === 0) {
        finishProcessing(parsed)
        return
      }

      if (isTomorrowSaturday()) {
        setPendingParse(parsed)
        setSaturdayDialogOpen(true)
        return
      }

      finishProcessing(parsed)
    },
    [finishProcessing],
  )

  const handleConfirmSaturdayDelivery = useCallback(() => {
    if (!pendingParse) return
    finishProcessing(pendingParse, getTomorrowDate())
    setPendingParse(null)
    setSaturdayDialogOpen(false)
  }, [finishProcessing, pendingParse])

  const handleConfirmCustomDeliveryDate = useCallback(
    (isoDate: string) => {
      if (!pendingParse) return
      finishProcessing(pendingParse, isoDate)
      setPendingParse(null)
      setSaturdayDialogOpen(false)
    },
    [finishProcessing, pendingParse],
  )

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setStatus(null)
    setWarning(null)
    setSourceLabel(file.name)
    setOutputRows([])
    setInputRowCount(0)

    try {
      const parsed = await parseInputCsv(file)
      tryProcessParsedInput(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte läsa CSV-filen.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [tryProcessParsedInput])

  const handlePastedInputSubmit = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setStatus(null)
    setWarning(null)
    setSourceLabel('Klistrad data')
    setOutputRows([])
    setInputRowCount(0)

    try {
      const parsed = parseInputText(pastedInput, 'Klistrad data')
      tryProcessParsedInput(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte läsa inklistrad data.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [pastedInput, tryProcessParsedInput])

  const handleCellChange = useCallback(
    (rowIndex: number, column: OutputColumn, value: string) => {
      setOutputRows((prev) =>
        prev.map((row, i) =>
          i === rowIndex ? { ...row, [column]: value } : row,
        ),
      )
    },
    [],
  )

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setOutputRows((prev) => prev.filter((_, i) => i !== rowIndex))
  }, [])

  const handleAddRow = useCallback(() => {
    setOutputRows((prev) => [...prev, createBlankOutputRow()])
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
              Kåkå — Bokning
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              All bearbetning sker lokalt i webbläsaren.
            </p>
          </div>
          <HubHomeLink />
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            1. Ladda upp eller klistra in
          </h2>
          <div className="grid gap-4 xl:grid-cols-2">
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              fileName={sourceLabel === 'Klistrad data' ? null : sourceLabel}
            />
            <PasteInput
              value={pastedInput}
              onChange={setPastedInput}
              onSubmit={handlePastedInputSubmit}
              isLoading={isLoading}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            2. Status
          </h2>
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </div>
          )}
          {!error && warning && (
            <div
              role="status"
              className="mb-3 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--color-warning)]"
            >
              {warning}
            </div>
          )}
          {!error && status && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-sm text-[var(--color-text)]">
              {status}
            </div>
          )}
          {!error && !status && !warning && !isLoading && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Ingen indata bearbetad ännu.
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-[var(--color-text-muted)]">Läser och transformerar…</p>
          )}
        </section>

        {hasOutput && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              3. Sammanfattning
            </h2>
            <div className="grid items-stretch gap-4 xl:grid-cols-2">
              <OutputSummary rows={outputRows} />
              <MottKolliViktChart rows={outputRows} />
            </div>
          </section>
        )}

        {(hasOutput || inputRowCount > 0) && (
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                4. Förhandsgranskning ({outputRows.length} rader)
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58] hover:bg-[var(--color-surface-elevated)]"
                >
                  Lägg till tom rad
                </button>
              </div>
            </div>
            <OutputTable
              rows={outputRows}
              onCellChange={handleCellChange}
              onDeleteRow={handleDeleteRow}
            />
            {outputRows.length === 0 && inputRowCount > 0 && (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                Tabellen är tom. Använd &quot;Lägg till tom rad&quot; för att skapa rader
                manuellt.
              </p>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            5. Ladda ner
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

      <SaturdayDeliveryDialog
        open={saturdayDialogOpen}
        onConfirmSaturday={handleConfirmSaturdayDelivery}
        onConfirmDate={handleConfirmCustomDeliveryDate}
      />
    </div>
  )
}
