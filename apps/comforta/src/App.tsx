import { useCallback, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { FileUpload } from './components/FileUpload'
import { MottKolliViktChart } from './components/MottKolliViktChart'
import { OutputSummary } from './components/OutputSummary'
import { OutputTable } from './components/OutputTable'
import { PasteInput } from './components/PasteInput'
import { SaturdayDeliveryDialog } from './components/SaturdayDeliveryDialog'
import { downloadOutputExcel } from './exportOutputExcel'
import { getTomorrowDate, isTomorrowSaturday } from './getTomorrowDate'
import {
  parseInputFile,
  parseInputText,
  type ParseInputResult,
} from './parseInput'
import { createBlankOutputRow, transformInputRows, applyMottNamnRules } from './transform'
import type { OutputColumn } from './constants'
import type { OutputRow } from './types'

export default function App() {
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [inputRowCount, setInputRowCount] = useState(0)
  const [skippedRowCount, setSkippedRowCount] = useState(0)
  const [unmatchedMottagare, setUnmatchedMottagare] = useState<string[]>([])
  const [registerMatchedByRow, setRegisterMatchedByRow] = useState<boolean[]>([])
  const [pendingParse, setPendingParse] = useState<ParseInputResult | null>(null)
  const [saturdayDialogOpen, setSaturdayDialogOpen] = useState(false)

  const finishProcessing = useCallback(
    (parsed: ParseInputResult, deliveryDate?: string) => {
      if (parsed.parseError) {
        setError(parsed.parseError)
        return
      }

      if (parsed.rows.length === 0) {
        setError('Indata innehåller inga giltiga rader.')
        return
      }

      setSourceLabel(parsed.fileLabel)
      setInputRowCount(parsed.rows.length)
      setSkippedRowCount(parsed.skippedRowCount)
      const {
        rows: transformed,
        unmatchedMottagare: unmatched,
        registerMatched,
      } = transformInputRows(parsed.rows, deliveryDate)
      setOutputRows(transformed)
      setUnmatchedMottagare(unmatched)
      setRegisterMatchedByRow(registerMatched)

      const matchedCount = transformed.length - unmatched.length
      setStatus(
        `Transformering klar: ${transformed.length} bokningsrad(er) skapades` +
          (matchedCount > 0 ? ` (${matchedCount} matchade kundregistret).` : '.') +
          (parsed.skippedRowCount > 0
            ? ` ${parsed.skippedRowCount} indatarader filtrerades bort.`
            : ''),
      )
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

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      setStatus(null)
      setSourceLabel(file.name)
      setOutputRows([])
      setInputRowCount(0)
      setSkippedRowCount(0)
      setUnmatchedMottagare([])
      setRegisterMatchedByRow([])

      try {
        const parsed = await parseInputFile(file)
        tryProcessParsedInput(parsed)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Kunde inte läsa filen.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [tryProcessParsedInput],
  )

  const handlePastedInputSubmit = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setStatus(null)
    setSourceLabel('Klistrad data')
    setOutputRows([])
    setInputRowCount(0)
    setSkippedRowCount(0)
    setUnmatchedMottagare([])
    setRegisterMatchedByRow([])

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
        prev.map((row, i) => {
          if (i !== rowIndex) return row
          const next = { ...row, [column]: value }
          if (column === 'Mott. Namn') applyMottNamnRules(next)
          return next
        }),
      )
    },
    [],
  )

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setOutputRows((prev) => prev.filter((_, i) => i !== rowIndex))
    setRegisterMatchedByRow((prev) => prev.filter((_, i) => i !== rowIndex))
  }, [])

  const handleAddRow = useCallback(() => {
    setOutputRows((prev) => [...prev, createBlankOutputRow()])
    setRegisterMatchedByRow((prev) => [...prev, false])
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
              Comforta — Bokning
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Klistra in rådata — kolumn 1 blir mottagarnamn, kolumn 2 kolli antal.
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
          {!error && status && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-sm text-[var(--color-text)]">
              {status}
            </div>
          )}
          {!error && unmatchedMottagare.length > 0 && (
            <div
              role="status"
              className="mt-3 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--color-warning)]"
            >
              {unmatchedMottagare.length} mottagare hittades inte i kundregistret:{' '}
              {unmatchedMottagare.join(', ')}. Kontrollera stavning eller uppdatera{' '}
              <code className="text-[var(--color-text)]">customerRegister.json</code>.
            </div>
          )}
          {!error && !status && !isLoading && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Ingen indata bearbetad ännu.
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Läser och transformerar…
            </p>
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

        {(hasOutput || inputRowCount > 0 || skippedRowCount > 0) && (
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
              registerMatched={registerMatchedByRow}
              onCellChange={handleCellChange}
              onDeleteRow={handleDeleteRow}
            />
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
