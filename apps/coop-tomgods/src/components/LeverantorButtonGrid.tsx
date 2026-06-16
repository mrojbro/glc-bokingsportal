import { getLeverantorRegisterOptions } from '../leverantorRegister'

const buttonClassName =
  'flex h-full min-h-[4.5rem] items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]'

interface LeverantorButtonGridProps {
  onSelect: (leverantor: string) => void
}

export function LeverantorButtonGrid({ onSelect }: LeverantorButtonGridProps) {
  const options = getLeverantorRegisterOptions()

  if (options.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Inga leverantörer i registret. Lägg till i{' '}
        <code className="text-[var(--color-text)]">src/leverantorRegister.ts</code>.
      </p>
    )
  }

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {options.map((entry) => (
        <button
          key={entry.leverantor}
          type="button"
          onClick={() => onSelect(entry.leverantor)}
          className={buttonClassName}
        >
          <span className="text-base font-semibold leading-snug text-[var(--color-text)]">
            {entry.leverantor}
          </span>
        </button>
      ))}
    </div>
  )
}
