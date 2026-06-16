import {
  TID_REGISTER_COLUMNS,
  type RegisterColumnDef,
} from './register/registerColumns'

/**
 * Tid-register table settings (section 1 — Redigera register).
 * Edit hidden here, then rebuild/redeploy.
 *
 * hidden: true  → column not shown in the register editor table
 * hidden: false → column shown and editable
 *
 * Download (.xlsx) always includes ALL columns, regardless of hidden.
 */
export interface TidRegisterColumnDisplayConfig {
  hidden: boolean
}

export type TidRegisterColumnKey = (typeof TID_REGISTER_COLUMNS)[number]['key']

export const TID_REGISTER_COLUMN_DISPLAY: Record<
  TidRegisterColumnKey,
  TidRegisterColumnDisplayConfig
> = {
  butiksnr: { hidden: false },
  butiksnamn: { hidden: false },
  sunday: { hidden: false },
  monday: { hidden: false },
  tuesday: { hidden: false },
  wednesday: { hidden: false },
  thursday: { hidden: false },
  friday: { hidden: false },
  saturday: { hidden: false },
}

/** Columns shown in the tid register editor (export order preserved). */
export function getVisibleTidRegisterColumns(): readonly RegisterColumnDef[] {
  return TID_REGISTER_COLUMNS.filter(
    (col) => !TID_REGISTER_COLUMN_DISPLAY[col.key as TidRegisterColumnKey].hidden,
  )
}
