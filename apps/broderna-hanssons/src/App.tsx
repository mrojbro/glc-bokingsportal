import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          GLC Bokingsportal
        </p>
        <h1 className="mt-2 text-2xl font-bold">Bröderna Hanssons</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Detta verktyg är under utveckling och kommer snart.
        </p>
        <div className="mt-6 flex justify-center">
          <HubHomeLink />
        </div>
      </div>
    </div>
  )
}
