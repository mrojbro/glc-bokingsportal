import { useCallback, useMemo, useRef, useState } from 'react'
import {
  activeEmailAddresses,
  formatEmailListText,
  formatEmailListTwoRows,
} from '../register/emailRegister'

interface MejladdresserRowProps {
  addresses: readonly string[]
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function MejladdresserRow({ addresses }: MejladdresserRowProps) {
  const combined = useMemo(() => formatEmailListText(addresses), [addresses])
  const displayText = useMemo(
    () => formatEmailListTwoRows(addresses),
    [addresses],
  )
  const [copied, setCopied] = useState(false)
  const fieldRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = useCallback(async () => {
    if (!combined) return
    if (await copyText(combined)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }, [combined])

  const handleSelectAll = useCallback(() => {
    const field = fieldRef.current
    if (!field) return
    field.focus()
    field.select()
  }, [])

  if (activeEmailAddresses(addresses).length === 0) return null

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          Mejladresser:
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[#484f58]"
        >
          {copied ? 'Kopierad!' : 'Kopiera'}
        </button>
      </div>
      <textarea
        ref={fieldRef}
        readOnly
        rows={2}
        value={displayText}
        onFocus={handleSelectAll}
        onClick={handleSelectAll}
        className="mt-3 w-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 font-mono text-sm leading-relaxed text-[var(--color-accent)] outline-none focus:border-[var(--color-accent)]"
      />
    </div>
  )
}
