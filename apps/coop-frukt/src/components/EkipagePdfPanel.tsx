interface EkipagePdfPanelProps {
  onDownload: () => void
  disabled?: boolean
  ekipageCount: number
}

export function EkipagePdfPanel({
  onDownload,
  disabled,
  ekipageCount,
}: EkipagePdfPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">
        PDF-rapport
      </h3>
      <p className="mt-2 flex-1 text-sm text-[var(--color-text-muted)]">
        Genererar en PDF i stående format med en sida per ekipage ({ekipageCount}{' '}
        {ekipageCount === 1 ? 'sida' : 'sidor'}). Varje sida innehåller tabell med
        Ekipage, Tur, Shipment, Consignee, Consignee City och Weight (kg), plus summa längst ned.
      </p>
      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="mt-4 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Ladda ner PDF
      </button>
    </div>
  )
}
