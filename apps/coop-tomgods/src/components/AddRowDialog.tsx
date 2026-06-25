import { useEffect, useMemo, useState } from 'react'
import { LASTBARARTYP_OPTIONS } from '../constants'
import {
  formatPresetLabel,
  getPresetsForLeverantor,
  type LeverantorPreset,
} from '../leverantorPresets'

export interface AddRowFormValues {
  leverantor: string
  date: string
  antalLastbarare: string
  antalPpl: string
  lastbarartyp: string
}

interface AddRowDialogProps {
  open: boolean
  leverantor: string
  defaultDate: string
  onConfirm: (values: AddRowFormValues) => void
  onCancel: () => void
}

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]'

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function swedishWeekdayFromIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('sv-SE', { weekday: 'long' })
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

export function AddRowDialog({
  open,
  leverantor,
  defaultDate,
  onConfirm,
  onCancel,
}: AddRowDialogProps) {
  const [date, setDate] = useState(defaultDate)
  const [antalLastbarare, setAntalLastbarare] = useState('')
  const [antalPpl, setAntalPpl] = useState('')
  const [lastbarartyp, setLastbarartyp] = useState<string>(LASTBARARTYP_OPTIONS[0])
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null)

  const presets = useMemo(
    () => (open ? getPresetsForLeverantor(leverantor) : []),
    [open, leverantor],
  )

  const applyPreset = (preset: LeverantorPreset, index: number) => {
    setAntalLastbarare(String(preset.antalLastbarare))
    setAntalPpl(String(preset.antalPpl))
    setLastbarartyp(preset.lastbarartyp)
    setSelectedPresetIndex(index)
  }

  useEffect(() => {
    if (open) {
      setDate(defaultDate)
      setAntalLastbarare('')
      setAntalPpl('')
      setLastbarartyp(LASTBARARTYP_OPTIONS[0])
      setSelectedPresetIndex(null)
    }
  }, [open, defaultDate])

  if (!open || !leverantor) return null

  const antal = Number.parseFloat(antalLastbarare.replace(',', '.'))
  const validAntal = Number.isFinite(antal) && antal > 0
  const validPpl = antalPpl.trim().length > 0
  const validDate = isValidIsoDate(date)
  const canSubmit = Boolean(validDate && validAntal && validPpl && lastbarartyp)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-row-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-xl">
        <h2
          id="add-row-title"
          className="text-lg font-semibold text-[var(--color-text)]"
        >
          {leverantor}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Fyll i datum, antal och lastbärartyp.
        </p>

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Datum
              <input
                type="date"
                lang="sv-SE"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClassName}
              />
            </label>
            <div className="block text-sm font-medium text-[var(--color-text)]">
              Veckodag
              <div
                className="mt-1.5 flex min-h-[42px] items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)]"
                aria-live="polite"
              >
                {validDate ? swedishWeekdayFromIsoDate(date) : '—'}
              </div>
            </div>
          </div>

          {presets.length > 0 && (
            <fieldset>
              <legend className="text-sm font-medium text-[var(--color-text)]">
                Fördefinerat
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={`${preset.leverantor}-${preset.antalLastbarare}-${preset.lastbarartyp}-${preset.antalPpl}`}
                    type="button"
                    onClick={() => applyPreset(preset, index)}
                    className={[
                      'rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors',
                      selectedPresetIndex === index
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text)] hover:border-[#484f58]',
                    ].join(' ')}
                  >
                    {formatPresetLabel(preset)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Antal lastbärare
              <input
                type="number"
                min={1}
                step={1}
                value={antalLastbarare}
                onChange={(e) => {
                  setAntalLastbarare(e.target.value)
                  setSelectedPresetIndex(null)
                }}
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Antal PPL
              <input
                type="number"
                min={0}
                step={1}
                value={antalPpl}
                onChange={(e) => {
                  setAntalPpl(e.target.value)
                  setSelectedPresetIndex(null)
                }}
                className={inputClassName}
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-[var(--color-text)]">
              Lastbärartyp
            </legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {LASTBARARTYP_OPTIONS.map((typ) => (
                <button
                  key={typ}
                  type="button"
                  onClick={() => {
                    setLastbarartyp(typ)
                    setSelectedPresetIndex(null)
                  }}
                  className={[
                    'rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                    lastbarartyp === typ
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text)] hover:border-[#484f58]',
                  ].join(' ')}
                >
                  {typ}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[#484f58]"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={() =>
              canSubmit &&
              onConfirm({
                leverantor,
                date,
                antalLastbarare: String(antal),
                antalPpl: antalPpl.trim(),
                lastbarartyp,
              })
            }
            disabled={!canSubmit}
            className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Lägg till
          </button>
        </div>
      </div>
    </div>
  )
}
