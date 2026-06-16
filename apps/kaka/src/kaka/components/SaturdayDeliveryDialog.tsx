import { useEffect, useState } from 'react'
import {
  defaultAlternateDeliveryDate,
  formatDeliveryDateLabel,
  getTomorrowDate,
} from '../getTomorrowDate'

interface SaturdayDeliveryDialogProps {
  open: boolean
  onConfirmSaturday: () => void
  onConfirmDate: (isoDate: string) => void
}

export function SaturdayDeliveryDialog({
  open,
  onConfirmSaturday,
  onConfirmDate,
}: SaturdayDeliveryDialogProps) {
  const tomorrow = getTomorrowDate()
  const [pickDate, setPickDate] = useState(false)
  const [selectedDate, setSelectedDate] = useState(defaultAlternateDeliveryDate)

  useEffect(() => {
    if (open) {
      setPickDate(false)
      setSelectedDate(defaultAlternateDeliveryDate())
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saturday-delivery-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-xl">
        <h2
          id="saturday-delivery-title"
          className="text-lg font-semibold text-[var(--color-text)]"
        >
          Leverans på lördag?
        </h2>

        {!pickDate ? (
          <>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Morgondagen är{' '}
              <span className="font-medium text-[var(--color-text)]">
                {formatDeliveryDateLabel(tomorrow)}
              </span>
              . Ska bokningen gälla lördagen?
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onConfirmSaturday}
                className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
              >
                Ja, lördag
              </button>
              <button
                type="button"
                onClick={() => setPickDate(true)}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[#484f58]"
              >
                Nej, välj datum
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Välj leveransdatum för bokningen.
            </p>
            <label className="mt-4 block text-sm font-medium text-[var(--color-text)]">
              Datum
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setPickDate(false)}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[#484f58]"
              >
                Tillbaka
              </button>
              <button
                type="button"
                onClick={() => selectedDate && onConfirmDate(selectedDate)}
                disabled={!selectedDate}
                className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
