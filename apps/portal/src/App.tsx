import { BOOKING_TOOLS, SUMMERING_TOOLS, bookingToolHref } from './bookings'

function BookingCard({
  label,
  href,
  status,
}: {
  label: string
  href: string
  status: 'ready' | 'coming-soon'
}) {
  const ready = status === 'ready'

  const className =
    'flex h-full items-center rounded-2xl border p-5 text-left transition ' +
    (ready
      ? 'cursor-pointer border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]'
      : 'pointer-events-none border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] opacity-50')

  const title = (
    <h2
      className={
        'text-lg font-semibold ' +
        (ready ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]')
      }
    >
      {label || '\u00A0'}
    </h2>
  )

  if (!ready) {
    return (
      <div className={className} aria-disabled="true">
        {title}
      </div>
    )
  }

  return (
    <a className={className} href={href}>
      {title}
    </a>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
            GLC — Bokingsportal
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
            All bearbetning sker lokalt i webbläsaren.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKING_TOOLS.map((tool) => (
            <BookingCard
              key={tool.id}
              label={tool.label}
              href={bookingToolHref(tool.segment)}
              status={tool.status}
            />
          ))}
        </div>

        <div
          className="my-8 border-t border-[var(--color-border)]"
          role="separator"
          aria-hidden="true"
        />

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMERING_TOOLS.map((tool) => (
            <BookingCard
              key={tool.id}
              label={tool.label}
              href={bookingToolHref(tool.segment)}
              status={tool.status}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
