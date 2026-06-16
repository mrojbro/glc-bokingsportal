import {
  REGISTER_BASE_COLUMNS,
  REGISTER_WEEKDAY_COLUMNS,
  type RegisterBaseColumnKey,
  type RegisterColumnDef,
  type RegisterWeekdayColumnKey,
} from './register/registerColumns'

/**
 * Resurs-register table settings (section 1 — Redigera register).
 * Edit hidden here, then rebuild/redeploy.
 *
 * hidden: true  → column not shown in the register editor table
 * hidden: false → column shown and editable
 *
 * Download (.xlsx) always includes ALL columns, regardless of hidden.
 */
export interface ResursRegisterColumnDisplayConfig {
  hidden: boolean
}

export type ResursRegisterColumnKey =
  | RegisterBaseColumnKey
  | RegisterWeekdayColumnKey

const RESURS_REGISTER_COLUMNS = [
  ...REGISTER_BASE_COLUMNS,
  ...REGISTER_WEEKDAY_COLUMNS,
] as const

export const RESURS_REGISTER_COLUMN_DISPLAY: Record<
  ResursRegisterColumnKey,
  ResursRegisterColumnDisplayConfig
> = {
  consignee: { hidden: false },
  butiksnr: { hidden: false },
  butiksnamn: { hidden: false },
  ekipage: { hidden: false },
  typ: { hidden: true },
  tur: { hidden: false },
  littera: { hidden: true },
  lastningsId: { hidden: true },
  lastningsnamn: { hidden: true },
  lastningsadress: { hidden: true },
  lastningspostnr: { hidden: true },
  lastningspostort: { hidden: true },
  sunday: { hidden: false },
  monday: { hidden: false },
  tuesday: { hidden: false },
  wednesday: { hidden: false },
  thursday: { hidden: false },
  friday: { hidden: false },
  saturday: { hidden: false },
}

/** Columns shown in the resurs register editor (export order preserved). */
export function getVisibleResursRegisterColumns(): readonly RegisterColumnDef[] {
  return RESURS_REGISTER_COLUMNS.filter(
    (col) => !RESURS_REGISTER_COLUMN_DISPLAY[col.key as ResursRegisterColumnKey].hidden,
  )
}
