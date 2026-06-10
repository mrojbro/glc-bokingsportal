import { useCallback, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { FileUpload } from './components/FileUpload'
import { MottKolliViktChart } from './components/MottKolliViktChart'
import { OutputSummary } from './components/OutputSummary'
import { OutputTable } from './components/OutputTable'
import { PasteInput } from './components/PasteInput'
import { downloadOutputExcel } from './exportOutputExcel'
import {
  parseInputFile,
  parseInputText,
  type ParseInputResult,
} from './parseInput'
import { applyInbaringFields, applyTjanst } from './applyInbaringFields'
import { createBlankOutputRow, transformInputRows } from './transform'
import type { OutputColumn } from './constants'
import type { OutputRow } from './types'

const REQUIRED_INPUT_COLUMNS = [
  'Ordernr',
  'Kund',
  'Gata',
  'Postnr',
  'Ort',
] as const

export default function App() {
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [inputRowCount, setInputRowCount] = useState(0)

  const processParsedInput = useCallback((parsed: ParseInputResult) => {
    if (parsed.parseError) {
      setError(parsed.parseError)
      return
    }

    const requiredMissing = parsed.missingColumns.filter((col) =>
      (REQUIRED_INPUT_COLUMNS as readonly string[]).includes(col),
    )
    if (requiredMissing.length > 0) {
      setError(
        `Saknade obligatoriska kolumner: ${requiredMissing.join(', ')}. Kontrollera rubrikraden.`,
      )
      return
    }

    if (parsed.missingColumns.length > 0) {
      setWarning(
        `Följande kolumner saknas i indata: ${parsed.missingColumns.join(', ')}`,
      )
    }

    if (parsed.rows.length === 0) {
      setError('Indata innehåller inga datarader.')
      return
    }

    setSourceLabel(parsed.fileLabel)
    setInputRowCount(parsed.rows.length)
    const transformed = transformInputRows(parsed.rows)
    setOutputRows(transformed)

    const skipped = parsed.rows.length - transformed.length
    if (transformed.length === 0) {
      setStatus(
        `${parsed.rows.length} indatarad(er) lästes in, men inga giltiga leveransrader hittades.`,
      )
    } else {
      setStatus(
        `Transformering klar: ${parsed.rows.length} indatarad(er) → ${transformed.length} bokningsrad(er)` +
          (skipped > 0 ? ` (${skipped} tomma rader hoppades över).` : '.'),
      )
    }
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      setStatus(null)
      setWarning(null)
      setSourceLabel(file.name)
      setOutputRows([])
      setInputRowCount(0)

      try {
        const parsed = await parseInputFile(file)
        processParsedInput(parsed)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Kunde inte läsa filen.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [processParsedInput],
  )

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
      processParsedInput(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte läsa inklistrad data.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [pastedInput, processParsedInput])

  const handleCellChange = useCallback(
    (rowIndex: number, column: OutputColumn, value: string) => {
      setOutputRows((prev) =>
        prev.map((row, i) => {
          if (i !== rowIndex) return row
          const next = { ...row, [column]: value }
          if (column === 'Mott. Adress') {
            applyInbaringFields(next)
          } else if (column === 'Chaufförsinstruktion') {
            applyTjanst(next)
          }
          return next
        }),
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
              Coop Matkassar — Bokning
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Ruttexport → GLC-bokningsformat. All bearbetning sker lokalt.
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
    </div>
  )
}
