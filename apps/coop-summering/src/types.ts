import type { InputColumn } from './constants'

export type InputRow = Partial<Record<InputColumn, string>>

export interface PivotSummary {
  rowLabels: string[]
  columnLabels: string[]
  /** values[rowLabel][columnLabel] = summed quantity */
  values: Record<string, Record<string, number>>
  rowTotals: Record<string, number>
  columnTotals: Record<string, number>
  grandTotal: number
}
