interface DialogAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface MessageDialogProps {
  open: boolean
  title?: string
  message: string
  onClose: () => void
  /** Custom actions; defaults to a single OK that calls onClose. */
  actions?: DialogAction[]
}

export function MessageDialog({
  open,
  title,
  message,
  onClose,
  actions,
}: MessageDialogProps) {
  if (!open) return null

  const resolvedActions: DialogAction[] =
    actions && actions.length > 0
      ? actions
      : [{ label: 'OK', onClick: onClose, variant: 'primary' }]

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
        <div
          className={`mt-5 flex flex-wrap gap-2 ${resolvedActions.length > 1 ? '' : ''}`}
        >
          {resolvedActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={
                action.variant === 'secondary'
                  ? 'flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]'
                  : 'flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90'
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
