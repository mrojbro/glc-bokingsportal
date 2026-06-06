import { useMemo, useState } from 'react'
import { downloadTidRegisterExcel } from '../exportTidRegisterExcel'
import {
  TID_REGISTER_COLUMNS,
  REGISTER_TABLE_CLASS,
  registerColumnIsFixed,
  registerColumnStyle,
} from '../register/registerColumns'
import {
  createEmptyTidRegisterEntry,
  newTidRegisterEntryId,
  toEditableTidRegister,
  type EditableTidRegisterEntry,
} from '../register/tidRegister'
import { TID_REGISTER } from '../register/tidRegisterData'
import type { TidRegisterEntry } from '../types/tidRegister'
import {
  RegisterActiveBadge,
  RegisterPanelHeading,
  registerCardClassName,
  registerEditButtonClassName,
} from './RegisterEditorChrome'

const REGISTER_COLUMNS = TID_REGISTER_COLUMNS

type RegisterEntryFields = Omit<EditableTidRegisterEntry, 'id'>

interface TidRegisterEditorProps {
  part: 'card' | 'panel'
  entries: EditableTidRegisterEntry[]
  onChange: (entries: EditableTidRegisterEntry[]) => void
  open: boolean
  onToggleOpen: () => void
}

function matchesSearch(entry: EditableTidRegisterEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return REGISTER_COLUMNS.some(({ key }) =>
    String(entry[key as keyof TidRegisterEntry] ?? '')
      .toLowerCase()
      .includes(q),
  )
}

export function TidRegisterEditor({
  part,
  entries,
  onChange,
  open,
  onToggleOpen,
}: TidRegisterEditorProps) {
  const [search, setSearch] = useState('')

  const visibleEntries = useMemo(
    () => entries.filter((entry) => matchesSearch(entry, search)),
    [entries, search],
  )

  const updateRow = (id: string, key: keyof RegisterEntryFields, value: string) => {
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [key]: value } : entry,
      ),
    )
  }

  const removeRow = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id))
  }

  const duplicateRow = (entry: EditableTidRegisterEntry) => {
    onChange([
      ...entries,
      {
        ...entry,
        id: newTidRegisterEntryId(),
        butiksnamn: `${entry.butiksnamn} (kopia)`,
      },
    ])
  }

  if (part === 'card') {
    return (
      <div className={registerCardClassName(open)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Tid-register ({entries.length} poster)
              </h3>
              {open && <RegisterActiveBadge />}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              <code className="text-[var(--color-accent)]">
                apps/coop-frukt/src/data/register-tid.json
              </code>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadTidRegisterExcel(entries)}
              disabled={entries.length === 0}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ladda ner register
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className={registerEditButtonClassName(open)}
            >
              {open ? 'Dölj register' : 'Redigera register'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface-card)] p-4">
      <div className="space-y-3">
        <RegisterPanelHeading title="Tid-register" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök butiksnr, butiksnamn, tid…"
          className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
        />

        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div className="max-h-[420px] overflow-auto">
            <table className={REGISTER_TABLE_CLASS}>
              <thead className="sticky top-0 z-10 bg-[var(--color-surface-elevated)]">
                <tr className="border-b border-[var(--color-border)]">
                  {REGISTER_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      style={registerColumnStyle(column)}
                      className="whitespace-nowrap px-2 py-2 font-medium text-[var(--color-text-muted)]"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="sticky right-0 border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-2 font-medium text-[var(--color-text-muted)]">
                    Åtgärd
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={REGISTER_COLUMNS.length + 1}
                      className="px-3 py-6 text-center text-[var(--color-text-muted)]"
                    >
                      Inga rader matchar sökningen.
                    </td>
                  </tr>
                ) : (
                  visibleEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-elevated)]/40"
                    >
                      {REGISTER_COLUMNS.map((column) => (
                        <td
                          key={column.key}
                          style={registerColumnStyle(column)}
                          className="p-0"
                        >
                          <input
                            type="text"
                            value={entry[column.key as keyof RegisterEntryFields]}
                            onChange={(e) =>
                              updateRow(
                                entry.id,
                                column.key as keyof RegisterEntryFields,
                                e.target.value,
                              )
                            }
                            className={`w-full min-w-0 border-0 bg-transparent px-2 py-1.5 text-[var(--color-text)] outline-none focus:bg-[var(--color-accent-dim)] ${
                              registerColumnIsFixed(column) ? 'truncate' : ''
                            }`}
                          />
                        </td>
                      ))}
                      <td className="sticky right-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] px-2 py-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => duplicateRow(entry)}
                          className="mr-2 rounded px-1.5 py-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                        >
                          Kopiera
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(entry.id)}
                          className="rounded px-1.5 py-0.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange([...entries, createEmptyTidRegisterEntry()])}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58]"
          >
            Lägg till rad
          </button>
          <button
            type="button"
            onClick={() => onChange(toEditableTidRegister(TID_REGISTER))}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            Återställ till inbyggt
          </button>
        </div>
      </div>
    </div>
  )
}
