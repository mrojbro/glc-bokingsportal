import type { CSSProperties } from 'react'

export type RegisterColumnDef = {
  readonly key: string
  readonly label: string
  /** Fixed width on table cells — use this for narrow columns. */
  readonly width?: string
  /** Minimum width for columns that may grow (e.g. Butiksnamn). */
  readonly minWidth?: string
}

/** Shared column order for the first 12 register fields (Consignee + Resurs). */
export const REGISTER_BASE_COLUMNS: readonly RegisterColumnDef[] = [
  { key: 'consignee', label: 'Consignee', minWidth: '9rem' },
  { key: 'butiksnr', label: 'Butiksnr', width: '3rem' },
  { key: 'butiksnamn', label: 'Butiksnamn', minWidth: '14rem' },
  { key: 'ekipage', label: 'Ekipage', width: '3rem' },
  { key: 'typ', label: 'Typ', width: '5rem' },
  { key: 'tur', label: 'Tur', width: '3rem' },
  { key: 'littera', label: 'Littera', minWidth: '10rem' },
  { key: 'lastningsId', label: 'Lastnings-ID', width: '4.5rem' },
  { key: 'lastningsnamn', label: 'Lastningsnamn', minWidth: '9rem' },
  { key: 'lastningsadress', label: 'Lastningsadress', minWidth: '10rem' },
  { key: 'lastningspostnr', label: 'Postnr', width: '4rem' },
  { key: 'lastningspostort', label: 'Postort', width: '5rem' },
]

export const REGISTER_WEEKDAY_COLUMNS: readonly RegisterColumnDef[] = [
  { key: 'sunday', label: 'Sunday', width: '3.5rem' },
  { key: 'monday', label: 'Monday', width: '3.5rem' },
  { key: 'tuesday', label: 'Tuesday', width: '3.5rem' },
  { key: 'wednesday', label: 'Wednesday', width: '3.5rem' },
  { key: 'thursday', label: 'Thursday', width: '3.5rem' },
  { key: 'friday', label: 'Friday', width: '3.5rem' },
  { key: 'saturday', label: 'Saturday', width: '3.5rem' },
]

/** Tid-register: Butiksnr, Butiksnamn + weekdays. */
export const TID_REGISTER_COLUMNS: readonly RegisterColumnDef[] = [
  { key: 'butiksnr', label: 'Butiksnr', width: '4rem' },
  { key: 'butiksnamn', label: 'Butiksnamn', minWidth: '14rem' },
  ...REGISTER_WEEKDAY_COLUMNS,
]

export function registerColumnStyle(
  column: Pick<RegisterColumnDef, 'width' | 'minWidth'>,
): CSSProperties {
  if (column.width) {
    return { width: column.width, minWidth: column.width }
  }
  if (column.minWidth) {
    return { minWidth: column.minWidth }
  }
  return {}
}

/** Share of table width reserved for the action column (Kopiera + Ta bort). */
export const REGISTER_EDITOR_ACTION_SHARE = 0.16

/** Editor table fills the panel; column widths are computed from visible columns. */
export const REGISTER_EDITOR_TABLE_CLASS =
  'w-full max-w-full table-fixed border-collapse text-left text-xs'

const REGISTER_EDITOR_COLUMN_WEIGHT: Partial<Record<string, number>> = {
  butiksnamn: 4,
  consignee: 3,
  littera: 3,
  lastningsnamn: 3,
  lastningsadress: 3,
}

function registerEditorColumnWeight(column: RegisterColumnDef): number {
  return (
    REGISTER_EDITOR_COLUMN_WEIGHT[column.key] ??
    (column.minWidth ? 2 : 1)
  )
}

/** Share panel width across visible data columns (wider for name/address fields). */
export function registerEditorColumnStyle(
  column: RegisterColumnDef,
  visibleColumns: readonly RegisterColumnDef[],
): CSSProperties {
  if (visibleColumns.length === 0) return {}

  const dataShare = 1 - REGISTER_EDITOR_ACTION_SHARE
  const totalWeight = visibleColumns.reduce(
    (sum, col) => sum + registerEditorColumnWeight(col),
    0,
  )
  const weight = registerEditorColumnWeight(column)
  const share = weight / totalWeight

  return {
    width: `${dataShare * share * 100}%`,
  }
}

export function registerEditorActionColumnStyle(): CSSProperties {
  return { width: `${REGISTER_EDITOR_ACTION_SHARE * 100}%` }
}

/** Table grows with columns; parent scrolls horizontally instead of squeezing. */
export const REGISTER_TABLE_CLASS =
  'w-max min-w-full border-collapse text-left text-xs'

export function registerColumnIsFixed(
  column: Pick<RegisterColumnDef, 'width'>,
): boolean {
  return column.width !== undefined
}

export type RegisterBaseColumnKey =
  (typeof REGISTER_BASE_COLUMNS)[number]['key']

export type RegisterWeekdayColumnKey =
  (typeof REGISTER_WEEKDAY_COLUMNS)[number]['key']
