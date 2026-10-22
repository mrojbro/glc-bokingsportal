import type { InputColumn } from './constants'

export type InputRow = Record<InputColumn, string> & {
  sourceIndex: number
}
