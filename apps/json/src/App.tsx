import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from 'react'
import { HubHomeLink } from '../../../shared/hub-link/HubHomeLink.tsx'
import { beautifyJson } from './beautifyJson'
import { HighlightedJson } from './HighlightedJson'

export default function App() {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyBeautify = useCallback((raw: string) => {
    const result = beautifyJson(raw)
    if (result.ok) {
      setFormatted(result.formatted)
      setError(null)
      setCopyStatus(null)
      return
    }
    setFormatted(null)
    setError(result.error)
    setCopyStatus(null)
  }, [])

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData('text')
      e.preventDefault()
      setInput(text)
      setSourceLabel('Klistrad JSON')
      applyBeautify(text)
    },
    [applyBeautify],
  )

  const handleFileSelect = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      try {
        const text = await file.text()
        setInput(text)
        setSourceLabel(file.name)
        applyBeautify(text)
      } catch {
        setFormatted(null)
        setError('Kunde inte läsa filen.')
        setCopyStatus(null)
      }
    },
    [applyBeautify],
  )

  const handleCopy = useCallback(async () => {
    if (!formatted) return
    try {
      await navigator.clipboard.writeText(formatted)
      setCopyStatus('Kopierat.')
      return
    } catch {
      // Clipboard API can be blocked; fall back to a hidden textarea.
    }
    const ta = document.createElement('textarea')
    ta.value = formatted
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    setCopyStatus(ok ? 'Kopierat.' : 'Kunde inte kopiera.')
  }, [formatted])

  const handleDownload = useCallback(() => {
    if (!formatted) return
    const blob = new Blob([formatted], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'formatted.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [formatted])

  const hasInput = input.trim().length > 0

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              JSON — Formatera
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Klistra in en rad JSON eller öppna en fil. Formateringen sker
              lokalt i webbläsaren.
            </p>
          </div>
          <HubHomeLink />
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  Klistra in JSON
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  En rad eller hela filen. Formateras direkt när du klistrar in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
              >
                Öppna fil
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json,text/plain"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  void handleFileSelect(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </div>

            <textarea
              value={input}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onPaste={handlePaste}
              spellCheck={false}
              placeholder='{"exempel":"klistra in här"}'
              className="min-h-72 w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                {sourceLabel ?? 'Ingen källa ännu.'}
              </p>
              <button
                type="button"
                onClick={() => applyBeautify(input)}
                disabled={!hasInput}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Formatera
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Formaterad JSON
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  disabled={!formatted}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Kopiera
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!formatted}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Ladda ner
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[var(--color-danger)]/40 bg-[#2a1616] px-4 py-3 text-sm text-[var(--color-danger)]"
              >
                {error}
              </div>
            )}
            {!error && formatted && <HighlightedJson text={formatted} />}
            {!error && !formatted && (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
                Formaterad JSON visas här.
              </p>
            )}
            {copyStatus && (
              <p className="mt-3 text-sm text-[var(--color-success)]">{copyStatus}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
