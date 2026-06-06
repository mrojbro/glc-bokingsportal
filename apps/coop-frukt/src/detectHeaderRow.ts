import { REQUIRED_COLUMNS } from './constants'
import {
  countMatchedSheetColumns,
  resolveInputColumn,
} from './normalizeHeader'
import type { SheetColumn } from './constants'
import type { InputRow } from './types'
import { repairDataRows } from './readSheetMatrix'

const MAX_SCAN_ROWS = 30
const SAMPLE_ROWS = 12

export interface ColumnMapping {
  dataIndex: number
  column: SheetColumn
}

function cellIsEmpty(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

function isColumnEmptyInSample(
  dataRows: unknown[][],
  columnIndex: number,
): boolean {
  const sample = dataRows.slice(0, SAMPLE_ROWS)
  if (sample.length === 0) return true
  return sample.every((row) => cellIsEmpty(row[columnIndex]))
}

function coerceCellValue(value: unknown): string | number {
  if (typeof value === 'number') return value
  if (value == null) return ''
  return String(value)
}

/**
 * Build column mappings from header row + data.
 * Handles misaligned headers (e.g. "Shipment date" in col A, dates in col B).
 */
export function buildColumnMappings(
  headerRow: unknown[],
  dataRows: unknown[][],
): ColumnMapping[] {
  const mappings: ColumnMapping[] = []
  const usedDataIndices = new Set<number>()

  for (let headerIndex = 0; headerIndex < headerRow.length; headerIndex++) {
    const label = String(headerRow[headerIndex] ?? '').trim()
    if (!label) continue

    const column = resolveInputColumn(label)
    if (!column) continue

    let dataIndex = headerIndex
    const nextHeader = String(headerRow[headerIndex + 1] ?? '').trim()

    if (
      !nextHeader &&
      headerIndex + 1 < headerRow.length &&
      isColumnEmptyInSample(dataRows, headerIndex) &&
      !isColumnEmptyInSample(dataRows, headerIndex + 1)
    ) {
      dataIndex = headerIndex + 1
    }

    if (usedDataIndices.has(dataIndex)) continue
    usedDataIndices.add(dataIndex)
    mappings.push({ dataIndex, column })
  }

  return mappings
}

/** Find the row index that contains the shipment column headers (0-based). */
export function detectHeaderRowIndex(sheetRows: unknown[][]): number {
  const limit = Math.min(MAX_SCAN_ROWS, sheetRows.length)
  let bestIndex = 0
  let bestMatchCount = 0

  for (let i = 0; i < limit; i++) {
    const row = sheetRows[i]
    if (!Array.isArray(row)) continue

    const headers = row.map((cell) => String(cell ?? ''))
    if (headers.every((header) => !header.trim())) continue

    const matchCount = countMatchedSheetColumns(headers)
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount
      bestIndex = i
    }

    if (matchCount >= REQUIRED_COLUMNS.length) {
      return i
    }
  }

  return bestMatchCount >= 2 ? bestIndex : 0
}

export function rowsToInputRows(
  sheetRows: unknown[][],
  headerRowIndex: number,
): { rows: InputRow[]; matchedColumns: SheetColumn[] } {
  const headerRow = sheetRows[headerRowIndex]
  if (!Array.isArray(headerRow)) {
    return { rows: [], matchedColumns: [] }
  }

  const dataRows = repairDataRows(sheetRows.slice(headerRowIndex + 1))
  const mappings = buildColumnMappings(headerRow, dataRows)
  const matchedColumns = mappings.map((mapping) => mapping.column)

  const rows: InputRow[] = []
  for (const row of dataRows) {
    if (!Array.isArray(row)) continue
    if (row.every((cell) => cellIsEmpty(cell))) continue

    const inputRow: InputRow = {}
    for (const { dataIndex, column } of mappings) {
      const value = coerceCellValue(row[dataIndex])
      if (value !== '') {
        inputRow[column] = value
      }
    }

    rows.push(inputRow)
  }

  return { rows, matchedColumns }
}
