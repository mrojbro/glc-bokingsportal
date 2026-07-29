import type { ChangeEvent, ReactNode } from 'react'

interface PasteSourceProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  rowCount?: number | null
  rowCountLabel?: string
  ruleHint?: string
  action?: ReactNode
}

export function PasteSource({
  label,
  value,
  onChange,
  disabled = false,
  rowCount = null,
  rowCountLabel = 'rad(er) i summering',
  ruleHint,
  action,
}: PasteSourceProps) {
  if (disabled) {
    return (
      <div
        className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4 opacity-50"
        aria-disabled="true"
      >
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">
          {label}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Kommer snart
        </p>
        <div className="mt-3 min-h-40 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{label}</h3>
        {rowCount != null && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {rowCount} {rowCountLabel}
          </p>
        )}
      </div>
      {ruleHint && (
        <p className="mb-2 text-xs text-[var(--color-text-muted)]">{ruleHint}</p>
      )}
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder="Klistra in tabell från Excel här (inkl. rubrikrad)…"
        className="min-h-40 w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
      />
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
