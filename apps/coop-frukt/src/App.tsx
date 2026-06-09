import { useCallback, useMemo, useState } from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { ConsigneeRegisterEditor } from './components/ConsigneeRegisterEditor'
import { ResursRegisterEditor } from './components/ResursRegisterEditor'
import { TidRegisterEditor } from './components/TidRegisterEditor'
import { EmailRegisterEditor } from './components/EmailRegisterEditor'
import { MejladdresserRow } from './components/MejladdresserRow'
import { EmailReminderDialog } from './components/EmailReminderDialog'
import { EkipageConsigneeSummary } from './components/EkipageConsigneeSummary'
import { EkipagePdfPanel } from './components/EkipagePdfPanel'
import { EkipageSummary } from './components/EkipageSummary'
import { FileUpload } from './components/FileUpload'
import { OutputTable } from './components/OutputTable'
import { PasteInput } from './components/PasteInput'
import { downloadEkipagePdf } from './exportEkipagePdf'
import { downloadOutputExcel } from './exportOutputExcel'
import {
  parseInputFile,
  parseInputText,
  type ParseInputResult,
} from './parseInput'
import {
  fromEditableRegister,
  toEditableRegister,
  type EditableRegisterEntry,
} from './register/consigneeRegister'
import {
  buildResursRegisterLookup,
  fromEditableResursRegister,
  lookupLossinfo,
  toEditableResursRegister,
  type EditableResursRegisterEntry,
} from './register/resursRegister'
import {
  applyTidLookup,
  normalizeLeveranstid,
  buildTidRegisterLookup,
  fromEditableTidRegister,
  toEditableTidRegister,
  type EditableTidRegisterEntry,
} from './register/tidRegister'
import { CONSIGNEE_REGISTER } from './register/consigneeRegisterData'
import { RESURS_REGISTER } from './register/resursRegisterData'
import { TID_REGISTER } from './register/tidRegisterData'
import { EMAIL_REGISTER } from './register/emailRegisterData'
import { createBlankOutputRow, transformInputRows } from './transform'
import type { OutputColumn } from './constants'
import type { EkipageConsigneeCountRow, EkipagePdfRow, EkipageSummaryRow } from './types/register'
import type { InputRow, OutputRow } from './types'

export default function App() {
  const initialRegister = useMemo(
    () => toEditableRegister(CONSIGNEE_REGISTER),
    [],
  )

  const initialResursRegister = useMemo(
    () => toEditableResursRegister(RESURS_REGISTER),
    [],
  )

  const initialTidRegister = useMemo(
    () => toEditableTidRegister(TID_REGISTER),
    [],
  )

  const [register, setRegister] =
    useState<EditableRegisterEntry[]>(initialRegister)
  const [resursRegister, setResursRegister] =
    useState<EditableResursRegisterEntry[]>(initialResursRegister)
  const [tidRegister, setTidRegister] =
    useState<EditableTidRegisterEntry[]>(initialTidRegister)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [resursRegisterOpen, setResursRegisterOpen] = useState(false)
  const [tidRegisterOpen, setTidRegisterOpen] = useState(false)
  const [emailAddresses, setEmailAddresses] = useState<string[]>(EMAIL_REGISTER)
  const [emailRegisterOpen, setEmailRegisterOpen] = useState(false)
  const [outputRows, setOutputRows] = useState<OutputRow[]>([])
  const [ekipageSummary, setEkipageSummary] = useState<EkipageSummaryRow[]>([])
  const [ekipageConsigneeSummary, setEkipageConsigneeSummary] = useState<
    EkipageConsigneeCountRow[]
  >([])
  const [pdfRows, setPdfRows] = useState<EkipagePdfRow[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [pastedInput, setPastedInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [inputRowCount, setInputRowCount] = useState(0)
  const [parsedRows, setParsedRows] = useState<InputRow[]>([])
  const [pdfDownloaded, setPdfDownloaded] = useState(false)
  const [showEmailReminder, setShowEmailReminder] = useState(false)

  const runTransform = useCallback(
    (rows: InputRow[], fileLabel: string, rowCount: number) => {
      const {
        rows: transformed,
        unmatchedConsignees,
        ekipageSummary: summary,
        ekipageConsigneeSummary: consigneeSummary,
        pdfRows: reportRows,
      } = transformInputRows(
        rows,
        fromEditableRegister(register),
        fromEditableResursRegister(resursRegister),
        fromEditableTidRegister(tidRegister),
      )
      setOutputRows(transformed)
      setEkipageSummary(summary)
      setEkipageConsigneeSummary(consigneeSummary)
      setPdfRows(reportRows)
      setPdfDownloaded(false)

      if (unmatchedConsignees.length > 0) {
        const preview = unmatchedConsignees.slice(0, 5).join(', ')
        const suffix =
          unmatchedConsignees.length > 5
            ? ` (+${unmatchedConsignees.length - 5} till)`
            : ''
        setWarning(
          `${unmatchedConsignees.length} consignee(s) hittades inte i registret: ${preview}${suffix}`,
        )
      }

      if (transformed.length === 0) {
        setStatus(
          `${rowCount} indatarad(er) från ${fileLabel}, men inga rader kunde transformeras.`,
        )
      } else {
        setStatus(
          `Transformering klar: ${rowCount} indatarad(er) → ${transformed.length} utrad(er).`,
        )
      }
    },
    [register, resursRegister, tidRegister],
  )

  const processParsedInput = useCallback(
    (parsed: ParseInputResult) => {
      if (parsed.parseError) {
        setError(parsed.parseError)
        return
      }

      const requiredMissing = parsed.missingColumns.filter(
        (col) =>
          col === 'Shipment date' ||
          col === 'Consignee' ||
          col === 'Shipment reference' ||
          col === 'Weight (kg)',
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
      setParsedRows(parsed.rows)
      runTransform(parsed.rows, parsed.fileLabel, parsed.rows.length)
    },
    [runTransform],
  )

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      setStatus(null)
      setWarning(null)
      setSourceLabel(file.name)
      setOutputRows([])
      setEkipageSummary([])
      setEkipageConsigneeSummary([])
      setPdfRows([])
      setPdfDownloaded(false)
      setInputRowCount(0)
      setParsedRows([])

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
    setEkipageSummary([])
    setEkipageConsigneeSummary([])
    setPdfRows([])
    setPdfDownloaded(false)
    setInputRowCount(0)
    setParsedRows([])

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

  const handleRegisterChange = useCallback(
    (next: EditableRegisterEntry[]) => {
      setRegister(next)
      if (parsedRows.length > 0) {
        setWarning(null)
        runTransform(parsedRows, sourceLabel ?? 'indata', parsedRows.length)
      }
    },
    [parsedRows, runTransform, sourceLabel],
  )

  const handleResursRegisterChange = useCallback(
    (next: EditableResursRegisterEntry[]) => {
      setResursRegister(next)
      if (parsedRows.length > 0) {
        setWarning(null)
        runTransform(parsedRows, sourceLabel ?? 'indata', parsedRows.length)
      }
    },
    [parsedRows, runTransform, sourceLabel],
  )

  const handleEmailRegisterChange = useCallback((next: string[]) => {
    setEmailAddresses(next)
  }, [])

  const handleTidRegisterChange = useCallback(
    (next: EditableTidRegisterEntry[]) => {
      setTidRegister(next)
      if (parsedRows.length > 0) {
        setWarning(null)
        runTransform(parsedRows, sourceLabel ?? 'indata', parsedRows.length)
      }
    },
    [parsedRows, runTransform, sourceLabel],
  )

  const handleCellChange = useCallback(
    (rowIndex: number, column: OutputColumn, value: string) => {
      setOutputRows((prev) =>
        prev.map((row, i) => {
          if (i !== rowIndex) return row
          const next = { ...row, [column]: value }
          if (column === 'Latest Requested Time (Unloading Location)') {
            next[column] = normalizeLeveranstid(value)
          }
          if (
            column === 'Consigne address' ||
            column === 'Latest Requested Date (Unloading Location)' ||
            column === 'Butiksnr'
          ) {
            const deliveryDate = next['Latest Requested Date (Unloading Location)']
            const resursLookup = buildResursRegisterLookup(
              fromEditableResursRegister(resursRegister),
            )
            next.Lossinfo = lookupLossinfo(
              resursLookup,
              next['Consigne address'],
              deliveryDate,
            )
            applyTidLookup(
              buildTidRegisterLookup(fromEditableTidRegister(tidRegister)),
              next,
            )
          }
          return next
        }),
      )
    },
    [resursRegister, tidRegister],
  )

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setOutputRows((prev) => prev.filter((_, i) => i !== rowIndex))
  }, [])

  const handleAddRow = useCallback(() => {
    setOutputRows((prev) => [...prev, createBlankOutputRow()])
  }, [])

  const handleDownloadPdf = useCallback(() => {
    if (pdfRows.length === 0) return
    downloadEkipagePdf(pdfRows)
    setPdfDownloaded(true)
  }, [pdfRows])

  const handleDownload = useCallback(() => {
    if (outputRows.length === 0 || !pdfDownloaded) return
    setShowEmailReminder(true)
  }, [outputRows.length, pdfDownloaded])

  const handleConfirmDownload = useCallback(() => {
    setShowEmailReminder(false)
    if (outputRows.length === 0) return
    downloadOutputExcel(outputRows)
  }, [outputRows])

  const hasOutput = outputRows.length > 0
  const xlsxWaitingForPdf = hasOutput && !pdfDownloaded

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Coop Frukt — Bokning
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
            1. Register
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ConsigneeRegisterEditor
                part="card"
                entries={register}
                onChange={handleRegisterChange}
                open={registerOpen}
                onToggleOpen={() => {
                  setRegisterOpen((open) => {
                    const next = !open
                    if (next) {
                      setResursRegisterOpen(false)
                      setTidRegisterOpen(false)
                      setEmailRegisterOpen(false)
                    }
                    return next
                  })
                }}
              />
              <ResursRegisterEditor
                part="card"
                entries={resursRegister}
                onChange={handleResursRegisterChange}
                open={resursRegisterOpen}
                onToggleOpen={() => {
                  setResursRegisterOpen((open) => {
                    const next = !open
                    if (next) {
                      setRegisterOpen(false)
                      setTidRegisterOpen(false)
                      setEmailRegisterOpen(false)
                    }
                    return next
                  })
                }}
              />
              <TidRegisterEditor
                part="card"
                entries={tidRegister}
                onChange={handleTidRegisterChange}
                open={tidRegisterOpen}
                onToggleOpen={() => {
                  setTidRegisterOpen((open) => {
                    const next = !open
                    if (next) {
                      setRegisterOpen(false)
                      setResursRegisterOpen(false)
                      setEmailRegisterOpen(false)
                    }
                    return next
                  })
                }}
              />
              <EmailRegisterEditor
                part="card"
                addresses={emailAddresses}
                onChange={handleEmailRegisterChange}
                open={emailRegisterOpen}
                onToggleOpen={() => {
                  setEmailRegisterOpen((open) => {
                    const next = !open
                    if (next) {
                      setRegisterOpen(false)
                      setResursRegisterOpen(false)
                      setTidRegisterOpen(false)
                    }
                    return next
                  })
                }}
              />
            </div>
            {registerOpen && (
              <ConsigneeRegisterEditor
                part="panel"
                entries={register}
                onChange={handleRegisterChange}
                open={registerOpen}
                onToggleOpen={() => setRegisterOpen(false)}
              />
            )}
            {resursRegisterOpen && (
              <ResursRegisterEditor
                part="panel"
                entries={resursRegister}
                onChange={handleResursRegisterChange}
                open={resursRegisterOpen}
                onToggleOpen={() => setResursRegisterOpen(false)}
              />
            )}
            {tidRegisterOpen && (
              <TidRegisterEditor
                part="panel"
                entries={tidRegister}
                onChange={handleTidRegisterChange}
                open={tidRegisterOpen}
                onToggleOpen={() => setTidRegisterOpen(false)}
              />
            )}
            {emailRegisterOpen && (
              <EmailRegisterEditor
                part="panel"
                addresses={emailAddresses}
                onChange={handleEmailRegisterChange}
                open={emailRegisterOpen}
                onToggleOpen={() => setEmailRegisterOpen(false)}
              />
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            2. Ladda upp eller klistra in
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
            3. Status
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

        {ekipageSummary.length > 0 && (
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <EkipageSummary rows={ekipageSummary} />
              <EkipageConsigneeSummary rows={ekipageConsigneeSummary} />
              <EkipagePdfPanel
                ekipageCount={ekipageSummary.length}
                onDownload={handleDownloadPdf}
                disabled={pdfRows.length === 0}
              />
            </div>
            <MejladdresserRow addresses={emailAddresses} />
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
                Inga rader kunde transformeras. Kontrollera indatakolumnerna.
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
            disabled={!hasOutput || !pdfDownloaded}
            className={
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed ' +
              (xlsxWaitingForPdf
                ? 'animate-pulse border-2 border-[var(--color-warning)] bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
                : 'bg-[var(--color-accent)] text-[#0d1117] disabled:opacity-40')
            }
          >
            Ladda ner .xlsx
          </button>
          {!hasOutput && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Minst en utrad krävs för nedladdning.
            </p>
          )}
          {xlsxWaitingForPdf && (
            <p className="mt-2 text-xs text-[var(--color-warning)]">
              Ladda ner PDF först (ovan) innan du kan ladda ner .xlsx.
            </p>
          )}
        </section>
      </main>

      <EmailReminderDialog
        open={showEmailReminder}
        onConfirm={handleConfirmDownload}
      />
    </div>
  )
}
