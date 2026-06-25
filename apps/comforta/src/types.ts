import type { OutputColumn } from './constants'

export interface InputRow {
  mottNamn: string
  quantity: number
}

export type OutputRow = Record<OutputColumn, string>
