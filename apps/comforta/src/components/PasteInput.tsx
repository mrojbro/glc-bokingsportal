import type { ChangeEvent } from 'react'

interface PasteInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
}

export function PasteInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: PasteInputProps) {
  const hasText = value.trim().length > 0

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Klistra in data
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Kolumn 1 blir <strong className="font-medium text-[var(--color-text)]">Mott. Namn</strong>.
          Kolumn 2 måste innehålla ett tal (kolli antal). Rader utan namn eller utan
          tal i kolumn 2 ignoreras.
        </p>
      </div>

      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder="Klistra in kolumner från Excel här…"
        className="min-h-56 w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          Stöd för tab-separerad inklistring från Excel samt CSV-text.
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasText || isLoading}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bearbeta inklistrad data
        </button>
      </div>
    </div>
  )
}
