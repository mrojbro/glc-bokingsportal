import type { InputColumn, OutputColumn } from './constants'

export type InputRow = Partial<Record<InputColumn, string | number>>

export type OutputRow = Record<OutputColumn, string>
