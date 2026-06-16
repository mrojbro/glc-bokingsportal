import {
  REGISTER_BASE_COLUMNS,
  type RegisterBaseColumnKey,
  type RegisterColumnDef,
} from './register/registerColumns'

/**
 * Consignee-register table settings (section 1 — Redigera register).
 * Edit hidden here, then rebuild/redeploy.
 *
 * hidden: true  → column not shown in the register editor table
 * hidden: false → column shown and editable
 *
 * Download (.xlsx) always includes ALL columns, regardless of hidden.
 */
export interface ConsigneeRegisterColumnDisplayConfig {
  hidden: boolean
}

export const CONSIGNEE_REGISTER_COLUMN_DISPLAY: Record<
  RegisterBaseColumnKey,
  ConsigneeRegisterColumnDisplayConfig
> = {
  consignee: { hidden: false },
  butiksnr: { hidden: false },
  butiksnamn: { hidden: false },
  ekipage: { hidden: false },
  typ: { hidden: false },
  tur: { hidden: false },
  littera: { hidden: true },
  lastningsId: { hidden: true },
  lastningsnamn: { hidden: true },
  lastningsadress: { hidden: true },
  lastningspostnr: { hidden: true },
  lastningspostort: { hidden: true },
}

/** Columns shown in the consignee register editor (export order preserved). */
export function getVisibleConsigneeRegisterColumns(): readonly RegisterColumnDef[] {
  return REGISTER_BASE_COLUMNS.filter(
    (col) => !CONSIGNEE_REGISTER_COLUMN_DISPLAY[col.key as RegisterBaseColumnKey].hidden,
  )
}
