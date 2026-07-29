import {
  COLUMN_FIELD,
  INPUT_COLUMNS,
  ROW_FIELD,
  VALUE_FIELD,
  type InputColumn,
} from './constants'
import type { InputRow } from './types'

export interface ParseInputResult {
  rows: InputRow[]
  parseError?: string
  skippedRowCount: number
}

function normalizeHeader(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const HEADER_ALIASES: Record<string, InputColumn> = Object.fromEntries(
  INPUT_COLUMNS.flatMap((col) => {
    const aliases = [col, col.replace(/[\[\]]/g, '')]
    return aliases.map((alias) => [normalizeHeader(alias), col] as const)
  }),
)

function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) ?? []).length
  const semicolons = (line.match(/;/g) ?? []).length
  const commas = (line.match(/,/g) ?? []).length
  if (tabs >= semicolons && tabs >= commas && tabs > 0) return '\t'
  return semicolons >= commas ? ';' : ','
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function splitTextLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
}

function textToMatrix(text: string): unknown[][] {
  const lines = splitTextLines(text).filter((line) => line.trim())
  if (lines.length === 0) return []
  const delimiter = detectDelimiter(lines[0] ?? '')
  return lines.map((line) => line.split(delimiter))
}

function matrixFromHtmlTable(text: string): unknown[][] | null {
  const trimmed = text.trimStart().slice(0, 500).toLowerCase()
  if (!trimmed.includes('<table')) return null

  const doc = new DOMParser().parseFromString(text, 'text/html')
  const table = doc.querySelector('table')
  if (!table) return null

  const matrix: unknown[][] = []
  for (const tr of table.querySelectorAll('tr')) {
    const cells = [...tr.querySelectorAll('th,td')].map(
      (cell) => cell.textContent?.trim() ?? '',
    )
    if (cells.length > 0) matrix.push(cells)
  }
  return matrix.length > 0 ? matrix : null
}

function findHeaderRowIndex(matrix: unknown[][]): number {
  for (let i = 0; i < Math.min(matrix.length, 40); i++) {
    const row = matrix[i] ?? []
    const mapped = row
      .map((cell) => HEADER_ALIASES[normalizeHeader(cellText(cell))])
      .filter(Boolean)
    const hasRow = mapped.includes(ROW_FIELD)
    const hasCol = mapped.includes(COLUMN_FIELD)
    const hasQty = mapped.includes(VALUE_FIELD)
    if (hasRow && hasCol && hasQty) return i
  }
  return -1
}

function isBlankLine(cells: unknown[]): boolean {
  return cells.every((cell) => !cellText(cell))
}

function parseQuantity(value: string): number {
  const text = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!text) return 0
  const n = Number(text)
  return Number.isFinite(n) ? n : 0
}

export function parseInputText(text: string): ParseInputResult {
  if (!text.trim()) {
    return { rows: [], skippedRowCount: 0 }
  }

  const matrix = matrixFromHtmlTable(text) ?? textToMatrix(text)
  if (matrix.length === 0) {
    return {
      rows: [],
      skippedRowCount: 0,
      parseError: 'Ingen data hittades i inklistringen.',
    }
  }

  const headerRowIndex = findHeaderRowIndex(matrix)
  if (headerRowIndex < 0) {
    return {
      rows: [],
      skippedRowCount: 0,
      parseError: `Kunde inte hitta rubrikraden. Behöver minst: ${ROW_FIELD}, ${COLUMN_FIELD}, ${VALUE_FIELD}.`,
    }
  }

  const headerRow = matrix[headerRowIndex] ?? []
  const columnIndexes = new Map<InputColumn, number>()
  headerRow.forEach((cell, index) => {
    const column = HEADER_ALIASES[normalizeHeader(cellText(cell))]
    if (column && !columnIndexes.has(column)) {
      columnIndexes.set(column, index)
    }
  })

  const rows: InputRow[] = []
  let skipped = 0

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const line = matrix[r] ?? []
    if (isBlankLine(line)) continue

    const row: InputRow = {}
    for (const [column, index] of columnIndexes) {
      row[column] = cellText(line[index])
    }

    const description = row[ROW_FIELD]?.trim() ?? ''
    const loadCarrier = row[COLUMN_FIELD]?.trim() ?? ''
    const quantity = parseQuantity(row[VALUE_FIELD] ?? '')

    if (!description && !loadCarrier && quantity === 0) {
      skipped += 1
      continue
    }

    rows.push(row)
  }

  if (rows.length === 0) {
    return {
      rows: [],
      skippedRowCount: skipped,
      parseError: 'Inga datarader hittades under rubrikraden.',
    }
  }

  return { rows, skippedRowCount: skipped }
}
