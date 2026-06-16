export function registerCardClassName(open: boolean): string {
  return open
    ? 'rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-dim)] p-4 transition-colors'
    : 'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 transition-colors'
}

export function registerEditButtonClassName(open: boolean): string {
  const base =
    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors'
  return open
    ? `${base} border-[var(--color-accent)] bg-[var(--color-accent)] text-[#0f1419] hover:opacity-90`
    : `${base} border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:border-[#484f58]`
}

export function RegisterActiveBadge() {
  return (
    <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold text-[#0f1419]">
      Redigeras
    </span>
  )
}

export function RegisterPanelHeading({ title }: { title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-3">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">
        Redigerar {title}
      </h3>
      <RegisterActiveBadge />
    </div>
  )
}

export const REGISTER_EDITOR_ACTION_HEADER_CLASS =
  'whitespace-nowrap border-l border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/80 px-2 py-2 font-medium text-[var(--color-text-muted)]'

export const REGISTER_EDITOR_ACTION_CELL_CLASS =
  'whitespace-nowrap border-l border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/35 px-2 py-1'

export const REGISTER_EDITOR_COPY_BUTTON_CLASS =
  'mr-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]/70 px-2 py-0.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]'

export const REGISTER_EDITOR_DELETE_BUTTON_CLASS =
  'rounded-md border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/10 px-2 py-0.5 text-[var(--color-danger)] transition-colors hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/20'
