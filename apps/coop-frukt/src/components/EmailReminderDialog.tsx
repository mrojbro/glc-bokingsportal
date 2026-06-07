interface EmailReminderDialogProps {
  open: boolean
  onConfirm: () => void
}

export function EmailReminderDialog({
  open,
  onConfirm,
}: EmailReminderDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-reminder-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-xl">
        <h2
          id="email-reminder-title"
          className="text-lg font-semibold text-[var(--color-text)]"
        >
          Glöm inte mejla listan
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Skicka mejladresserna till mottagarna innan du går vidare.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  )
}
