import { useEffect, useMemo, useRef, useState } from 'react'

const WEEKDAY_LABELS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'] as const

interface EuDateFieldProps {
  value: string
  onChange: (isoDate: string) => void
  inputClassName: string
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function monthCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = Array.from({ length: mondayOffset }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month - 1, day))
  }
  return cells
}

function monthTitle(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  const label = date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function EuDateField({ value, onChange, inputClassName }: EuDateFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = parseIsoDate(value)
  const initialView = selected ?? new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(initialView.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialView.getMonth() + 1)

  useEffect(() => {
    if (!open) return
    const parsed = parseIsoDate(value)
    if (parsed) {
      setViewYear(parsed.getFullYear())
      setViewMonth(parsed.getMonth() + 1)
    }
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const cells = useMemo(
    () => monthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const shiftMonth = (delta: number) => {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1)
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth() + 1)
  }

  const selectDate = (date: Date) => {
    onChange(formatIsoDate(date))
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative mt-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value}
          onClick={() => setOpen((prev) => !prev)}
          className={`${inputClassName} mt-0 flex-1 cursor-pointer`}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Öppna kalender"
          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-[var(--color-accent)]/50 bg-[var(--color-accent-dim)] text-[var(--color-accent)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/25"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
            <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Välj datum"
          className="absolute left-0 top-full z-20 mt-2 w-full min-w-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm text-[var(--color-text)] hover:border-[var(--color-accent)]"
              aria-label="Föregående månad"
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {monthTitle(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm text-[var(--color-text)] hover:border-[var(--color-accent)]"
              aria-label="Nästa månad"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--color-text-muted)]">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} />
              }

              const iso = formatIsoDate(date)
              const isSelected = iso === value
              const isToday = iso === formatIsoDate(new Date())

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={[
                    'rounded-md py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-[var(--color-accent)] font-semibold text-[#0d1117]'
                      : isToday
                        ? 'border border-[var(--color-accent)]/60 text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface-card)]',
                  ].join(' ')}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
