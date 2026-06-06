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
