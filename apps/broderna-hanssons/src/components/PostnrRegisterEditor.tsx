import { useMemo, useRef, useState } from 'react'
import { downloadPostnrRegisterExcel } from '../exportRegisterExcel'
import { parseRegisterFile } from '../parseRegisterFile'
import {
  POSTNR_REGISTER,
  createEmptyPostnrRegisterEntry,
  newPostnrRegisterEntryId,
  toEditablePostnrRegister,
  type EditablePostnrRegisterEntry,
} from '../postnrRegister'

const MAX_VISIBLE_ROWS = 100

interface PostnrRegisterEditorProps {
  entries: EditablePostnrRegisterEntry[]
  onChange: (entries: EditablePostnrRegisterEntry[]) => void
  open: boolean
  onToggleOpen: () => void
}

function matchesSearch(entry: EditablePostnrRegisterEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    entry.postnr.toLowerCase().includes(q) ||
    entry.transportinstruktion.toLowerCase().includes(q)
  )
}

export function PostnrRegisterEditor({
  entries,
  onChange,
  open,
  onToggleOpen,
}: PostnrRegisterEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const visibleEntries = useMemo(() => {
    const filtered = entries.filter((entry) => matchesSearch(entry, search))
    return {
      total: filtered.length,
      rows: filtered.slice(0, MAX_VISIBLE_ROWS),
    }
  }, [entries, search])

  const updateRow = (
    id: string,
    key: 'postnr' | 'transportinstruktion',
    value: string,
  ) => {
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [key]: value } : entry,
      ),
    )
  }

  const removeRow = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id))
  }

  const addRow = () => {
    onChange([...entries, createEmptyPostnrRegisterEntry()])
  }

  const resetToBundled = () => {
    setUploadError(null)
    onChange(toEditablePostnrRegister(POSTNR_REGISTER))
  }

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    try {
      const parsed = await parseRegisterFile(file)
      if (parsed.length === 0) {
        setUploadError(
          'Kunde inte läsa registret. Första raden ska innehålla Postnr och Sorteringskod v1 (eller Transportinstruktion).',
        )
        return
      }
      onChange(
        parsed.map((entry) => ({
          ...entry,
          id: newPostnrRegisterEntryId(),
        })),
      )
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Kunde inte läsa registerfilen.',
      )
    }
  }

  return (
    <div
      className={
        open
          ? 'rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-dim)] p-4'
          : 'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Postnr-register ({entries.length} poster)
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Matchar Mott. Postnr mot registret och fyller Chaufförsinstruktion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadPostnrRegisterExcel(entries)}
            disabled={entries.length === 0}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ladda ner register
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58]"
          >
            Ladda upp register
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            className={
              open
                ? 'rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white'
                : 'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:border-[#484f58]'
            }
          >
            {open ? 'Dölj register' : 'Redigera register'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          void handleUpload(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {uploadError && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">{uploadError}</p>
      )}

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök postnr eller transportinstruktion…"
              className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={addRow}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:border-[#484f58]"
            >
              Lägg till rad
            </button>
            <button
              type="button"
              onClick={resetToBundled}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:border-[#484f58]"
            >
              Återställ original
            </button>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Visar {visibleEntries.rows.length} av {visibleEntries.total} filtrerade
            rader. Ändra JSON-filen{' '}
            <code className="text-[var(--color-text)]">src/data/postnrRegister.json</code>{' '}
            för en permanent uppdatering.
          </p>

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full table-fixed border-collapse text-left text-xs">
                <colgroup>
                  <col style={{ width: 140 }} />
                  <col />
                  <col style={{ width: 88 }} />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[var(--color-surface-elevated)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-2 py-2 font-medium text-[var(--color-text-muted)]">
                      Postnr
                    </th>
                    <th className="px-2 py-2 font-medium text-[var(--color-text-muted)]">
                      Transportinstruktion
                    </th>
                    <th className="px-2 py-2 font-medium text-[var(--color-text-muted)]">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.rows.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[var(--color-border-subtle)]"
                    >
                      <td className="p-0">
                        <input
                          type="text"
                          value={entry.postnr}
                          onChange={(e) =>
                            updateRow(entry.id, 'postnr', e.target.value)
                          }
                          className="w-full border-0 bg-transparent px-2 py-1.5 text-[var(--color-text)] outline-none focus:bg-[var(--color-accent-dim)]"
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="text"
                          value={entry.transportinstruktion}
                          onChange={(e) =>
                            updateRow(
                              entry.id,
                              'transportinstruktion',
                              e.target.value,
                            )
                          }
                          className="w-full border-0 bg-transparent px-2 py-1.5 text-[var(--color-text)] outline-none focus:bg-[var(--color-accent-dim)]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => removeRow(entry.id)}
                          className="rounded px-2 py-1 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
