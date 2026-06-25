import * as XLSX from 'xlsx'
import { isIgnoredInputMottagare } from './customerRegister'
import type { InputRow } from './types'

export interface ParseInputResult {
  rows: InputRow[]
  fileLabel: string
  parseError?: string
  skippedRowCount: number
}

function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) ?? []).length
  const semicolons = (line.match(/;/g) ?? []).length
  const commas = (line.match(/,/g) ?? []).length
  if (tabs >= semicolons && tabs >= commas && tabs > 0) return '\t'
  return semicolons >= commas ? ';' : ','
}

/** True when the cell contains a parseable number. */
export function cellContainsNumber(value: unknown): boolean {
  return parseQuantity(value) !== null
}

export function parseQuantity(value: unknown): number | null {
  const text = String(value ?? '').trim()
  if (!text) return null
  const match = text.match(/-?\d+(?:[.,]\d+)?/)
  if (!match) return null
  const n = Number(match[0].replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function rowFromCells(cells: unknown[]): InputRow | null | 'ignored' {
  const mottNamn = String(cells[0] ?? '').trim()
  if (isIgnoredInputMottagare(mottNamn)) return 'ignored'
  const quantity = parseQuantity(cells[1])
  if (!mottNamn || quantity === null) return null
  return { mottNamn, quantity }
}

function isBlankLine(cells: unknown[]): boolean {
  return cells.every((cell) => !String(cell ?? '').trim())
}

function matrixToRows(matrix: unknown[][]): { rows: InputRow[]; skipped: number } {
  const rows: InputRow[] = []
  let skipped = 0

  for (const line of matrix) {
    if (!line || isBlankLine(line)) continue
    const row = rowFromCells(line)
    if (row === 'ignored') continue
    if (row) {
      rows.push(row)
    } else {
      skipped += 1
    }
  }

  return { rows, skipped }
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
    const cells = [...tr.querySelectorAll('th,td')].map((cell) =>
      cell.textContent?.trim() ?? '',
    )
    if (cells.length > 0) matrix.push(cells)
  }
  return matrix.length > 0 ? matrix : null
}

function rowsFromMatrix(matrix: unknown[][], fileLabel: string): ParseInputResult {
  if (!matrix.length) {
    return {
      rows: [],
      fileLabel,
      parseError: 'Ingen data hittades.',
      skippedRowCount: 0,
    }
  }

  const { rows, skipped } = matrixToRows(matrix)
  if (rows.length === 0) {
    return {
      rows: [],
      fileLabel,
      parseError:
        'Inga giltiga rader hittades. Kolumn 1 ska innehålla mottagarnamn och kolumn 2 ett tal.',
      skippedRowCount: skipped,
    }
  }

  return { rows, fileLabel, skippedRowCount: skipped }
}

export function parseInputText(
  text: string,
  fileLabel = 'Klistrad data',
): ParseInputResult {
  if (!text.trim()) {
    return { rows: [], fileLabel, skippedRowCount: 0 }
  }

  const htmlMatrix = matrixFromHtmlTable(text)
  if (htmlMatrix) return rowsFromMatrix(htmlMatrix, fileLabel)

  return rowsFromMatrix(textToMatrix(text), fileLabel)
}

export async function parseInputFile(file: File): Promise<ParseInputResult> {
  const buffer = await file.arrayBuffer()
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'array', raw: false })
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? '']
    if (!sheet) {
      return {
        rows: [],
        fileLabel: file.name,
        parseError: 'Excel-filen innehåller inget blad.',
        skippedRowCount: 0,
      }
    }
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    })
    return rowsFromMatrix(matrix, file.name)
  }

  const text = new TextDecoder('utf-8').decode(buffer)
  const htmlMatrix = matrixFromHtmlTable(text)
  if (htmlMatrix) return rowsFromMatrix(htmlMatrix, file.name)

  return parseInputText(text, file.name)
}
