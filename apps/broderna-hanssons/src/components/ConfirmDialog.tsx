interface ConfirmDialogProps {
  open: boolean
  message: string
  onYes: () => void
  onNo: () => void
}

export function ConfirmDialog({
  open,
  message,
  onYes,
  onNo,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-describedby="confirm-dialog-body"
      onClick={onNo}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="confirm-dialog-body"
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {message}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onYes}
            className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ja
          </button>
          <button
            type="button"
            onClick={onNo}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[#484f58]"
          >
            Nej
          </button>
        </div>
      </div>
    </div>
  )
}
