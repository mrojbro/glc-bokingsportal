import {
  getMainLeverantorRegisterOptions,
  getSeparatedLeverantorRegisterOptions,
  type LeverantorRegisterEntry,
} from '../leverantorRegister'

const buttonClassName =
  'flex h-full min-h-[4.5rem] items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]'

interface LeverantorButtonGridProps {
  onSelect: (leverantor: string) => void
}

function LeverantorButtons({
  entries,
  onSelect,
}: {
  entries: LeverantorRegisterEntry[]
  onSelect: (leverantor: string) => void
}) {
  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 md:grid-cols-4">
      {entries.map((entry) => (
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

export function LeverantorButtonGrid({ onSelect }: LeverantorButtonGridProps) {
  const mainOptions = getMainLeverantorRegisterOptions()
  const separatedOptions = getSeparatedLeverantorRegisterOptions()

  if (mainOptions.length === 0 && separatedOptions.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Inga leverantörer i registret. Lägg till i{' '}
        <code className="text-[var(--color-text)]">src/leverantorRegister.ts</code>.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <LeverantorButtons entries={mainOptions} onSelect={onSelect} />
      {separatedOptions.length > 0 && (
        <>
          <div
            className="border-t border-[var(--color-border)]"
            role="separator"
          />
          <LeverantorButtons entries={separatedOptions} onSelect={onSelect} />
        </>
      )}
    </div>
  )
}
