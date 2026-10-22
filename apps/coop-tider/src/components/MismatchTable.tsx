import type { MismatchGroup } from '../findMismatches'

interface MismatchTableProps {
  groups: MismatchGroup[]
}

export function MismatchTable({ groups }: MismatchTableProps) {
  if (groups.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
            <th className="px-3 py-2 font-medium text-[var(--color-text-muted)]">
              Butiksnr
            </th>
            <th className="px-3 py-2 font-medium text-[var(--color-text-muted)]">
              Consignee Address
            </th>
            <th className="px-3 py-2 font-medium text-[var(--color-text-muted)]">
              Datum
            </th>
            <th className="px-3 py-2 font-medium text-[var(--color-text-muted)]">
              Transportation Group
            </th>
            <th className="px-3 py-2 font-medium text-[var(--color-warning)]">
              Tider
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr
              key={group.key}
              className="border-b border-[var(--color-border-subtle)] last:border-b-0"
            >
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text)]">
                {group.butiksnr || '—'}
              </td>
              <td className="px-3 py-3 text-[var(--color-text)]">
                {group.address || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text)]">
                {group.date || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text)]">
                {group.transportationGroup || '—'}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {group.times.map((entry) => (
                    <span
                      key={entry.time}
                      className="rounded-md bg-[#3a2f0a] px-2 py-1 font-medium text-[var(--color-warning)]"
                    >
                      {entry.time}
                      <span className="ml-1 font-normal text-[var(--color-warning)]/70">
                        ×{entry.count}
                      </span>
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
