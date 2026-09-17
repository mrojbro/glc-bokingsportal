import { useCallback, useMemo, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { FileUpload } from './components/FileUpload'
import { OutputTable } from './components/OutputTable'
import { PasteInput } from './components/PasteInput'
import { downloadOutputExcel } from './exportOutputExcel'
import {
  parseInputFile,
  parseInputText,
  type ParseInputResult,
} from './parseInput'
import {
  applyPostnrRewrite,
  applyRegisterLookups,
  lookupLitteraForRow,
  normalizePostnr,
} from './postnrRegister'
import { createBlankOutputRow, transformInputRows, applyGodsDerivedFields } from './transform'
import type { OutputColumn } from './constants'
import type { OutputRow } from './types'

export default function App() {
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [inputRowCount, setInputRowCount] = useState(0)

  const registerMatched = useMemo(
    () =>
      outputRows.map((row) => {
        const postnr = normalizePostnr(row['Mott. Postnr'])
        if (!postnr) return true
        return row.Chaufförsinstruktion.trim() !== '' && row.Littera.trim() !== ''
      }),
    [outputRows],
  )

  const unmatchedCount = registerMatched.filter((matched) => !matched).length

  const finishProcessing = useCallback((parsed: ParseInputResult) => {
    if (parsed.parseError) {
      setError(parsed.parseError)
      return
    }

    if (parsed.missingColumns.length > 0) {
      setWarning(
        `Följande indatakolumner saknas i indata: ${parsed.missingColumns.join(', ')}`,
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

    if (transformed.length === 0) {
      setStatus(
        `${parsed.rows.length} indatarad(er) lästes in, men inga rader kunde transformeras.`,
      )
    } else {
      setStatus(
        `Transformering klar: ${parsed.rows.length} indatarad(er) → ${transformed.length} utrad(er).`,
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
        finishProcessing(parsed)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Kunde inte läsa filen.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [finishProcessing],
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
      finishProcessing(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte läsa inklistrad data.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [finishProcessing, pastedInput])

  const handleCellChange = useCallback(
    (rowIndex: number, column: OutputColumn, value: string) => {
      setOutputRows((prev) =>
        prev.map((row, i) => {
          if (i !== rowIndex) return row
          const next = { ...row, [column]: value }
          if (column === 'Mott. Postnr' || column === 'Mott. Namn') {
            applyPostnrRewrite(next)
            applyRegisterLookups(next)
          } else if (column === 'Chaufförsinstruktion') {
            next.Littera = lookupLitteraForRow(next['Mott. Postnr'], value)
          } else if (column === 'Godsslag' || column === 'Kolli antal') {
            applyGodsDerivedFields(next)
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
              Bröderna Hanssons — Bokning
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
          {!error && unmatchedCount > 0 && (
            <div
              role="status"
              className="mb-3 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {unmatchedCount} rad(er) saknar träff i postnr-registret.
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

        {(hasOutput || inputRowCount > 0) && (
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                3. Förhandsgranskning ({outputRows.length} rader)
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
              registerMatched={registerMatched}
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
            4. Ladda ner
          </h2>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasOutput}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
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
