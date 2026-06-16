import { useMemo, useState } from 'react'
import { downloadResursRegisterExcel } from '../exportResursRegisterExcel'
import { getVisibleResursRegisterColumns } from '../resursRegisterColumnConfig'
import {
  createEmptyResursRegisterEntry,
  newResursRegisterEntryId,
  toEditableResursRegister,
  type EditableResursRegisterEntry,
} from '../register/resursRegister'
import { RESURS_REGISTER } from '../register/resursRegisterData'
import {
  REGISTER_BASE_COLUMNS,
  REGISTER_WEEKDAY_COLUMNS,
  REGISTER_EDITOR_TABLE_CLASS,
  registerEditorActionColumnStyle,
  registerEditorColumnStyle,
} from '../register/registerColumns'
import {
  RegisterActiveBadge,
  RegisterPanelHeading,
  REGISTER_EDITOR_ACTION_CELL_CLASS,
  REGISTER_EDITOR_ACTION_HEADER_CLASS,
  REGISTER_EDITOR_COPY_BUTTON_CLASS,
  REGISTER_EDITOR_DELETE_BUTTON_CLASS,
  registerCardClassName,
  registerEditButtonClassName,
} from './RegisterEditorChrome'

const REGISTER_COLUMNS = [...REGISTER_BASE_COLUMNS, ...REGISTER_WEEKDAY_COLUMNS]

type RegisterEntryFields = Omit<EditableResursRegisterEntry, 'id'>

interface ResursRegisterEditorProps {
  part: 'card' | 'panel'
  entries: EditableResursRegisterEntry[]
  onChange: (entries: EditableResursRegisterEntry[]) => void
  open: boolean
  onToggleOpen: () => void
}

function matchesSearch(entry: EditableResursRegisterEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return REGISTER_COLUMNS.some(({ key }) =>
    String(entry[key as keyof RegisterEntryFields] ?? '')
      .toLowerCase()
      .includes(q),
  )
}

export function ResursRegisterEditor({
  part,
  entries,
  onChange,
  open,
  onToggleOpen,
}: ResursRegisterEditorProps) {
  const [search, setSearch] = useState('')
  const visibleColumns = getVisibleResursRegisterColumns()

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

  const duplicateRow = (entry: EditableResursRegisterEntry) => {
    onChange([
      ...entries,
      {
        ...entry,
        id: newResursRegisterEntryId(),
        consignee: `${entry.consignee} (kopia)`,
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
                Resurs-register ({entries.length} poster)
              </h3>
              {open && <RegisterActiveBadge />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadResursRegisterExcel(entries)}
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
        <RegisterPanelHeading title="Resurs-register" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök consignee, butiksnamn, resurs…"
          className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
        />

        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div className="max-h-[420px] overflow-x-hidden overflow-y-auto">
            <table className={REGISTER_EDITOR_TABLE_CLASS}>
              <colgroup>
                {visibleColumns.map((column) => (
                  <col
                    key={column.key}
                    style={registerEditorColumnStyle(column, visibleColumns)}
                  />
                ))}
                <col style={registerEditorActionColumnStyle()} />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[var(--color-surface-elevated)]">
                <tr className="border-b border-[var(--color-border)]">
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className="overflow-hidden whitespace-nowrap px-2 py-2 font-medium text-[var(--color-text-muted)]"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className={REGISTER_EDITOR_ACTION_HEADER_CLASS}>
                    Åtgärd
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 1}
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
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="overflow-hidden p-0">
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
                            className="w-full min-w-0 truncate border-0 bg-transparent px-2 py-1.5 text-[var(--color-text)] outline-none focus:bg-[var(--color-accent-dim)]"
                          />
                        </td>
                      ))}
                      <td className={REGISTER_EDITOR_ACTION_CELL_CLASS}>
                        <button
                          type="button"
                          onClick={() => duplicateRow(entry)}
                          className={REGISTER_EDITOR_COPY_BUTTON_CLASS}
                        >
                          Kopiera
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(entry.id)}
                          className={REGISTER_EDITOR_DELETE_BUTTON_CLASS}
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
          <p className="border-t border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
            Dolda kolumner styrs i{' '}
            <code className="text-[var(--color-text)]">
              src/resursRegisterColumnConfig.ts
            </code>
            . Nedladdning inkluderar alla kolumner.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onChange([...entries, createEmptyResursRegisterEntry()])
            }
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58]"
          >
            Lägg till rad
          </button>
          <button
            type="button"
            onClick={() => onChange(toEditableResursRegister(RESURS_REGISTER))}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            Återställ till inbyggt
          </button>
        </div>
      </div>
    </div>
  )
}
