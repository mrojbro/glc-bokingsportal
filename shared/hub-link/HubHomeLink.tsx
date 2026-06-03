import { getHubHomeHref } from './getHubHomeHref'

function HomeIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  )
}

type HubHomeLinkProps = {
  className?: string
}

export function HubHomeLink({ className = '' }: HubHomeLinkProps) {
  return (
    <a
      href={getHubHomeHref()}
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58] hover:bg-[var(--color-surface-elevated)] ${className}`.trim()}
      title="Tillbaka till portalen"
    >
      <HomeIcon />
      <span>Portal</span>
    </a>
  )
}
