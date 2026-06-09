import { useEffect, useState } from 'react'
import { downloadMejlRegisterExcel } from '../exportMejlRegisterExcel'
import {
  activeEmailAddresses,
  formatEmailListText,
  parseEmailListText,
} from '../register/emailRegister'
import { EMAIL_REGISTER } from '../register/emailRegisterData'
import {
  RegisterActiveBadge,
  RegisterPanelHeading,
  registerCardClassName,
  registerEditButtonClassName,
} from './RegisterEditorChrome'

interface EmailRegisterEditorProps {
  part: 'card' | 'panel'
  addresses: string[]
  onChange: (addresses: string[]) => void
  open: boolean
  onToggleOpen: () => void
}

export function EmailRegisterEditor({
  part,
  addresses,
  onChange,
  open,
  onToggleOpen,
}: EmailRegisterEditorProps) {
  const [draft, setDraft] = useState(() => formatEmailListText(addresses))

  useEffect(() => {
    if (open) {
      setDraft(formatEmailListText(addresses))
    }
  }, [open, addresses])

  const count = activeEmailAddresses(addresses).length

  if (part === 'card') {
    return (
      <div className={registerCardClassName(open)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Mejladress-register ({count} adresser)
              </h3>
              {open && <RegisterActiveBadge />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadMejlRegisterExcel(addresses)}
              disabled={count === 0}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ladda ner register
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className={registerEditButtonClassName(open)}
            >
              {open ? 'Dölj register' : 'Redigera register'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface-card)] p-4">
      <div className="space-y-3">
        <RegisterPanelHeading title="Mejladress-register" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Samma mottagare för alla ekipage. Separera adresser med semikolon eller
          radbrytning.
        </p>
        <textarea
          value={draft}
          onChange={(event) => {
            const nextDraft = event.target.value
            setDraft(nextDraft)
            onChange(parseEmailListText(nextDraft))
          }}
          rows={6}
          placeholder="fornamn.efternamn@foretag.se; annan@foretag.se"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onChange(EMAIL_REGISTER)
              setDraft(formatEmailListText(EMAIL_REGISTER))
            }}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            Återställ till inbyggt
          </button>
        </div>
      </div>
    </div>
  )
}
