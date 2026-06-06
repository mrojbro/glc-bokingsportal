import type { OutputColumn, SheetColumn } from './constants'

export type InputRow = Partial<Record<SheetColumn, string | number>>

export type OutputRow = Record<OutputColumn, string>
