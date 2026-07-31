import { getHubHomeHref } from './getHubHomeHref'
import './hub-home-link.css'

function HomeIcon() {
  return (
    <svg
      aria-hidden
      className="hub-home-link__icon"
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
      className={['hub-home-link', className].filter(Boolean).join(' ')}
      title="Tillbaka till portalen"
    >
      <HomeIcon />
      <span>Portal</span>
    </a>
  )
}
