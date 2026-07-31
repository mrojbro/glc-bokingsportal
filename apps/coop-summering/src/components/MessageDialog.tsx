interface MessageDialogProps {
  open: boolean
  title?: string
  message: string
  onClose: () => void
}

export function MessageDialog({
  open,
  title,
  message,
  onClose,
}: MessageDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'message-dialog-title' : undefined}
      aria-describedby="message-dialog-body"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2
            id="message-dialog-title"
            className="text-lg font-semibold text-[var(--color-accent)]"
          >
            {title}
          </h2>
        ) : null}
        <p
          id="message-dialog-body"
          className={`whitespace-pre-line text-sm text-[var(--color-text)] ${title ? 'mt-2' : ''}`}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  )
}
