import { useCallback, useMemo, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { MessageDialog } from './components/MessageDialog'
import { OutlookRecipients } from './components/OutlookRecipients'
import { PasteSource } from './components/PasteSource'
import { PivotSummaryTable } from './components/PivotSummaryTable'
import { computePivotSummary } from './computePivot'
import { SOURCES, SOURCE_RULE_HINTS } from './constants'
import { downloadT5Excel } from './exportT5Excel'
import { filterRowsForSource } from './filterRows'
import {
  collectRequestedDates,
  matchRequestedDatesAcrossSources,
} from './matchRequestedDates'
import { parseInputText } from './parseInput'
import { parseT5InputText } from './parseT5Input'
import type { InputRow, PivotSummary } from './types'
import type { T5Row } from './t5Constants'

const T5_SOURCE_ID = 't5-coop'

export default function App() {
  const [pastes, setPastes] = useState<Record<string, string>>(() =>
    Object.fromEntries(SOURCES.map((source) => [source.id, ''])),
  )
  const [rowCounts, setRowCounts] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(SOURCES.map((source) => [source.id, null])),
  )
  const [summary, setSummary] = useState<PivotSummary | null>(null)
  const [t5Rows, setT5Rows] = useState<T5Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [t5Status, setT5Status] = useState<string | null>(null)
  const [t5Error, setT5Error] = useState<string | null>(null)
  const [t5Downloading, setT5Downloading] = useState(false)
  const [recipientsDone, setRecipientsDone] = useState(false)
  const [popupMessage, setPopupMessage] = useState<string | null>(null)

  const pivotSources = useMemo(
    () =>
      SOURCES.filter(
        (source) => source.status === 'ready' && source.kind === 'pivot',
      ),
    [],
  )

  const handlePasteChange = useCallback((sourceId: string, value: string) => {
    setPastes((prev) => ({ ...prev, [sourceId]: value }))
    if (sourceId === T5_SOURCE_ID) {
      setT5Rows([])
      setRowCounts((prev) => ({ ...prev, [T5_SOURCE_ID]: null }))
      setT5Status(null)
      setT5Error(null)
    }
  }, [])

  const handleBuildSummary = useCallback(() => {
    setError(null)
    setStatus(null)

    const allRows: InputRow[] = []
    const nextCounts: Record<string, number | null> = Object.fromEntries(
      SOURCES.map((source) => [source.id, rowCounts[source.id] ?? null]),
    )
    for (const source of pivotSources) {
      nextCounts[source.id] = null
    }
    const errors: string[] = []
    let filteredOutTotal = 0
    let parsedTotal = 0
    const datesBySource: {
      sourceId: string
      label: string
      dates: string[]
    }[] = []

    for (const source of pivotSources) {
      const text = pastes[source.id] ?? ''
      if (!text.trim()) {
        nextCounts[source.id] = null
        continue
      }

      const parsed = parseInputText(text)
      if (parsed.parseError) {
        errors.push(`${source.label}: ${parsed.parseError}`)
        nextCounts[source.id] = null
        continue
      }

      parsedTotal += parsed.rows.length
      const { kept, filteredOut } = filterRowsForSource(source.id, parsed.rows)
      filteredOutTotal += filteredOut
      nextCounts[source.id] = kept.length
      allRows.push(...kept)

      // Date check uses all parsed rows for #2 so Direkt can be excluded explicitly;
      // #1 uses all parsed rows (same date column).
      datesBySource.push({
        sourceId: source.id,
        label: source.label,
        dates: collectRequestedDates(source.id, parsed.rows),
      })
    }

    setRowCounts(nextCounts)

    if (errors.length > 0) {
      setError(errors.join(' '))
      setSummary(null)
      setRecipientsDone(false)
      return
    }

    const dateMismatch = matchRequestedDatesAcrossSources(datesBySource)
    if (dateMismatch) {
      setError(dateMismatch)
      setSummary(null)
      setRecipientsDone(false)
      return
    }

    if (allRows.length === 0) {
      const onlyT5 =
        (pastes[T5_SOURCE_ID] ?? '').trim().length > 0 &&
        pivotSources.every((source) => !(pastes[source.id] ?? '').trim())
      setError(
        onlyT5
          ? 'T5 Coop använder knappen ”Ladda ner T5 Excel” under T5-rutan — inte Skapa summering.'
          : parsedTotal > 0
            ? 'Inga rader matchade filtren. Kontrollera Transportation Group (Description).'
            : 'Klistra in data i minst en summeringskälla och skapa summering.',
      )
      setSummary(null)
      setRecipientsDone(false)
      return
    }

    const pivot = computePivotSummary(allRows)
    setSummary(pivot)
    setRecipientsDone(false)
    const sourceCount = pivotSources.filter((s) => (nextCounts[s.id] ?? 0) > 0).length
    setStatus(
      `Summering klar: ${allRows.length} rad(er) från ${sourceCount} källa(or)` +
        (filteredOutTotal > 0
          ? ` (${filteredOutTotal} rader filtrerades bort).`
          : '.'),
    )
  }, [pastes, pivotSources, rowCounts])

  const handleDownloadT5 = useCallback(async () => {
    setT5Error(null)
    setT5Status(null)

    const hasSummary =
      summary != null &&
      summary.rowLabels.length > 0 &&
      summary.columnLabels.length > 0
    if (!hasSummary) {
      setPopupMessage(
        'Ajabaja, skapa summering först.\n(Röjbro tillåter inte fritt tänkande)',
      )
      return
    }

    const text = pastes[T5_SOURCE_ID] ?? ''
    if (!text.trim()) {
      setT5Error('Klistra in T5-data innan du laddar ner Excel.')
      return
    }

    const parsed = parseT5InputText(text)
    if (parsed.parseError) {
      setT5Error(parsed.parseError)
      setT5Rows([])
      setRowCounts((prev) => ({ ...prev, [T5_SOURCE_ID]: null }))
      return
    }

    setT5Rows(parsed.rows)
    setRowCounts((prev) => ({ ...prev, [T5_SOURCE_ID]: parsed.rows.length }))
    setT5Downloading(true)
    try {
      await downloadT5Excel(parsed.rows)
      setT5Status(`Excel nedladdad: ${parsed.rows.length} rad(er).`)
    } catch (err) {
      setT5Error(
        err instanceof Error ? err.message : 'Kunde inte skapa Excel-filen.',
      )
    } finally {
      setT5Downloading(false)
    }
  }, [pastes, summary])

  const canBuild = pivotSources.some((source) => (pastes[source.id] ?? '').trim())
  const canDownloadT5 = (pastes[T5_SOURCE_ID] ?? '').trim().length > 0

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <MessageDialog
        open={popupMessage != null}
        message={popupMessage ?? ''}
        onClose={() => setPopupMessage(null)}
      />
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Coop Summering
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Klistra in data från flera källor. Summering till Outlook eller T5
              Excel-export. All bearbetning sker lokalt i webbläsaren.
            </p>
          </div>
          <HubHomeLink />
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            1. Klistra in källor
          </h2>
          <div className="grid gap-4 xl:grid-cols-3">
            {SOURCES.map((source) => (
              <PasteSource
                key={source.id}
                label={source.label}
                value={pastes[source.id] ?? ''}
                onChange={(value) => handlePasteChange(source.id, value)}
                disabled={source.status !== 'ready'}
                rowCount={rowCounts[source.id]}
                rowCountLabel={
                  source.kind === 'excel' ? 'rad(er) klara' : 'rad(er) i summering'
                }
                ruleHint={SOURCE_RULE_HINTS[source.id]}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBuildSummary}
              disabled={!canBuild}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Skapa summering
            </button>
            <button
              type="button"
              onClick={handleDownloadT5}
              disabled={!canDownloadT5 || t5Downloading}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t5Downloading ? 'Skapar Excel…' : 'Ladda ner T5 Excel'}
            </button>
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
          {t5Error && (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              T5 Coop: {t5Error}
            </div>
          )}
          {!error && status && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-sm text-[var(--color-text)]">
              {status}
            </div>
          )}
          {!t5Error && t5Status && (
            <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-sm text-[var(--color-text)]">
              {t5Status}
            </div>
          )}
          {!error && !status && !t5Error && !t5Status && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Ingen summering eller T5-export skapad ännu.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            3. Mottagare &amp; summering
          </h2>
          <div className="space-y-4">
            {summary &&
              summary.rowLabels.length > 0 &&
              summary.columnLabels.length > 0 && (
                <OutlookRecipients
                  done={recipientsDone}
                  onDoneChange={setRecipientsDone}
                />
              )}
            <PivotSummaryTable
              summary={
                summary ?? {
                  rowLabels: [],
                  columnLabels: [],
                  values: {},
                  rowTotals: {},
                  columnTotals: {},
                  grandTotal: 0,
                }
              }
              canCopyToOutlook={recipientsDone}
            />
          </div>
          {t5Rows.length > 0 && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Senaste T5-export: {t5Rows.length} rad(er) med låst rubrikrad och
              färgkodning.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
