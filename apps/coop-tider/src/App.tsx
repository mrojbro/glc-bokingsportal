import { useCallback, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { FileUpload } from './components/FileUpload'
import { MismatchTable } from './components/MismatchTable'
import { PasteInput } from './components/PasteInput'
import { INPUT_COLUMNS } from './constants'
import {
  countStoreGroups,
  findMismatchGroups,
  type MismatchGroup,
} from './findMismatches'
import {
  parseInputFile,
  parseInputText,
  type ParseInputResult,
} from './parseInput'

export default function App() {
  const [groups, setGroups] = useState<MismatchGroup[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [hasResult, setHasResult] = useState(false)

  const processParsed = useCallback((parsed: ParseInputResult) => {
    if (parsed.parseError) {
      setError(parsed.parseError)
      setGroups([])
      setHasResult(false)
      return
    }

    if (parsed.missingColumns.length === INPUT_COLUMNS.length) {
      setError(
        `Saknade obligatoriska kolumner: ${INPUT_COLUMNS.join(', ')}. Kontrollera rubrikraden.`,
      )
      setGroups([])
      setHasResult(false)
      return
    }

    if (parsed.missingColumns.length > 0) {
      setError(
        `Saknade kolumner: ${parsed.missingColumns.join(', ')}. Kontrollera rubrikraden.`,
      )
      setGroups([])
      setHasResult(false)
      return
    }

    if (parsed.rows.length === 0) {
      setError('Indata innehåller inga datarader.')
      setGroups([])
      setHasResult(false)
      return
    }

    const mismatchGroups = findMismatchGroups(parsed.rows)
    const storeCount = countStoreGroups(parsed.rows)
    setSourceLabel(parsed.fileLabel)
    setGroups(mismatchGroups)
    setHasResult(true)
    setStatus(
      mismatchGroups.length === 0
        ? `${storeCount} butiker kontrollerade — inga avvikelser i tid.`
        : `${storeCount} butiker, ${mismatchGroups.length} med avvikelse i tid.`,
    )
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      setStatus(null)
      try {
        const parsed = await parseInputFile(file)
        processParsed(parsed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte läsa filen.')
        setGroups([])
        setHasResult(false)
      } finally {
        setIsLoading(false)
      }
    },
    [processParsed],
  )

  const handlePastedInputSubmit = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setStatus(null)
    try {
      const parsed = parseInputText(pastedInput, 'Klistrad data')
      processParsed(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte läsa inklistrad data.',
      )
      setGroups([])
      setHasResult(false)
    } finally {
      setIsLoading(false)
    }
  }, [pastedInput, processParsed])

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Coop Tider — Avvikelsekoll
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Kontrollerar att samma butik, datum och transportgrupp har samma
              tid. All bearbetning sker lokalt i webbläsaren.
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
              className="rounded-xl border border-[var(--color-danger)]/40 bg-[#2a1616] px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </div>
          )}
          {!error && status && (
            <div
              className={[
                'rounded-xl border px-4 py-3 text-sm',
                groups.length > 0
                  ? 'border-[var(--color-warning)]/40 bg-[#2a2410] text-[var(--color-warning)]'
                  : 'border-[var(--color-success)]/40 bg-[#162016] text-[var(--color-success)]',
              ].join(' ')}
            >
              {status}
            </div>
          )}
          {!error && !status && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Ladda upp en Excel-fil eller klistra in data för att kontrollera
              avvikelser.
            </p>
          )}
        </section>

        {hasResult && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              3. Avvikelser
            </h2>
            {groups.length === 0 ? (
              <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
                Inga avvikelser. Samma transportgrupp har samma tid per butik
                och datum.
              </p>
            ) : (
              <MismatchTable groups={groups} />
            )}
          </section>
        )}
      </main>
    </div>
  )
}
