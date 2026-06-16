import type { OutputColumn } from './constants'

export type OutputRow = Record<OutputColumn, string> & {
  /** Set when leverantör has no register match (UI only, not exported). */
  unmappedLeverantor?: boolean
}
