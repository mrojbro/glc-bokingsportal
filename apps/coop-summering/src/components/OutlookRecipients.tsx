import { useCallback, useMemo, useState } from 'react'
import {
  OUTLOOK_RECIPIENTS,
  allRecipientsClipboardText,
} from '../outlookRecipients'

interface OutlookRecipientsProps {
  done: boolean
  onDoneChange: (done: boolean) => void
}

export function OutlookRecipients({
  done,
  onDoneChange,
}: OutlookRecipientsProps) {
  const [copied, setCopied] = useState<Set<string>>(() => new Set())
  const [status, setStatus] = useState<string | null>(null)

  const allDone = useMemo(
    () => OUTLOOK_RECIPIENTS.every((email) => copied.has(email)),
    [copied],
  )

  const syncDone = useCallback(
    (next: Set<string>) => {
      const complete = OUTLOOK_RECIPIENTS.every((email) => next.has(email))
      if (complete !== done) onDoneChange(complete)
    },
    [done, onDoneChange],
  )

  const handleCopyOne = useCallback(
    async (email: string) => {
      try {
        await navigator.clipboard.writeText(email)
        setCopied((prev) => {
          const next = new Set(prev)
          next.add(email)
          syncDone(next)
          return next
        })
        setStatus(`Kopierat: ${email}`)
      } catch {
        setStatus('Kunde inte kopiera e-postadressen.')
      }
    },
    [syncDone],
  )

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(allRecipientsClipboardText())
      const next = new Set<string>(OUTLOOK_RECIPIENTS)
      setCopied(next)
      syncDone(next)
      setStatus(
        `Kopierat alla ${OUTLOOK_RECIPIENTS.length} adresser (med semikolon).`,
      )
    } catch {
      setStatus('Kunde inte kopiera e-postadresserna.')
    }
  }, [syncDone])

  const handleReset = useCallback(() => {
    const next = new Set<string>()
    setCopied(next)
    syncDone(next)
    setStatus(null)
  }, [syncDone])

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Mottagare
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Klicka en adress i taget (för äldre system), eller kopiera alla.
            Gröna = klara. Summeringen kan kopieras när alla är gröna (
            {copied.size}/{OUTLOOK_RECIPIENTS.length}).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
          >
            Kopiera alla
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-text-muted)]"
          >
            Återställ
          </button>
        </div>
      </div>

      {status && (
        <p className="border-b border-[var(--color-border-subtle)] px-4 py-2 text-xs text-[var(--color-accent)]">
          {status}
        </p>
      )}

      <div className="flex flex-wrap gap-2 p-4">
        {OUTLOOK_RECIPIENTS.map((email) => {
          const isDone = copied.has(email)
          return (
            <button
              key={email}
              type="button"
              onClick={() => handleCopyOne(email)}
              title={
                isDone
                  ? `${email} — kopierad (klicka igen för att kopiera igen)`
                  : `Kopiera ${email}`
              }
              className={
                isDone
                  ? 'rounded-md border border-[var(--color-success)] bg-[var(--color-success)]/20 px-2.5 py-1.5 text-left text-xs font-medium text-[var(--color-success)] transition-colors hover:bg-[var(--color-success)]/30'
                  : 'rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-left text-xs font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }
            >
              {email}
            </button>
          )
        })}
      </div>

      {allDone && (
        <p className="border-t border-[var(--color-border-subtle)] px-4 py-2 text-xs text-[var(--color-success)]">
          Alla mottagare klara — du kan kopiera summeringen till Outlook.
        </p>
      )}
    </div>
  )
}
