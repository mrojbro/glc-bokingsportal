import { T5_COLUMNS, type T5Column, type T5Row } from './t5Constants'

export interface ParseT5Result {
  rows: T5Row[]
  parseError?: string
  skippedRowCount: number
}

function normalizeHeader(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
}

/** Normalized aliases → T5 column. Dots/spaces normalized away for matching. */
const HEADER_ALIASES: Record<string, T5Column> = {
  resurs: 'Resurs',
  transportdag: 'Transportdag',
  fraktsedelnummer: 'Fraktsedelnummer',
  fraktsedel: 'Fraktsedelnummer',
  fraktsedelnr: 'Fraktsedelnummer',
  'avs namn': 'Avs Namn',
  avsnamn: 'Avs Namn',
  'mott namn': 'Mott. Namn',
  mottnamn: 'Mott. Namn',
  'mott ort': 'Mott. Ort',
  mottort: 'Mott. Ort',
  'lev tid': 'Lev Tid',
  levtid: 'Lev Tid',
  'lev tid2': 'Lev Tid2',
  levtid2: 'Lev Tid2',
  godsslag: 'Godsslag',
  vikt: 'Vikt',
  kolli: 'Kolli',
}

function resolveT5Column(header: string): T5Column | undefined {
  const key = normalizeHeader(header)
  if (!key) return undefined
  if (HEADER_ALIASES[key]) return HEADER_ALIASES[key]

  // Prefer longer column names first (Lev Tid2 before Lev Tid).
  const byLength = [...T5_COLUMNS].sort((a, b) => b.length - a.length)
  for (const col of byLength) {
    const colKey = normalizeHeader(col)
    if (key === colKey) return col
  }
  for (const col of byLength) {
    const colKey = normalizeHeader(col)
    if (key.includes(colKey) || colKey.includes(key)) return col
  }
  return undefined
}

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

const REQUIRED_HINT_COLUMNS: T5Column[] = [
  'Resurs',
  'Mott. Namn',
  'Godsslag',
]

function findHeaderRowIndex(matrix: unknown[][]): number {
  let bestIndex = -1
  let bestScore = 0

  for (let i = 0; i < Math.min(matrix.length, 40); i++) {
    const row = matrix[i] ?? []
    const mapped = new Set(
      row.map((cell) => resolveT5Column(cellText(cell))).filter(Boolean),
    )
    const score = T5_COLUMNS.filter((col) => mapped.has(col)).length
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  // Accept if we found at least 3 T5 columns, or the three key ones.
  if (bestIndex < 0) return -1
  const row = matrix[bestIndex] ?? []
  const mapped = new Set(
    row.map((cell) => resolveT5Column(cellText(cell))).filter(Boolean),
  )
  const hasKeys = REQUIRED_HINT_COLUMNS.every((col) => mapped.has(col))
  if (hasKeys || bestScore >= 3) return bestIndex
  return -1
}

function isBlankLine(cells: unknown[]): boolean {
  return cells.every((cell) => !cellText(cell))
}

function emptyT5Row(): T5Row {
  return Object.fromEntries(T5_COLUMNS.map((col) => [col, ''])) as T5Row
}

export function parseT5InputText(text: string): ParseT5Result {
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
      parseError:
        'Kunde inte hitta rubrikraden. Behöver kolumnerna: Resurs, Transportdag, Fraktsedelnummer, Avs Namn, Mott. Namn, Mott. Ort, Lev Tid, Lev Tid2, Godsslag, Vikt, Kolli (ordning spelar ingen roll).',
    }
  }

  const headerRow = matrix[headerRowIndex] ?? []
  const columnIndexes = new Map<T5Column, number>()
  headerRow.forEach((cell, index) => {
    const column = resolveT5Column(cellText(cell))
    if (column && !columnIndexes.has(column)) {
      columnIndexes.set(column, index)
    }
  })

  const rows: T5Row[] = []
  let skipped = 0

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const line = matrix[r] ?? []
    if (isBlankLine(line)) continue

    const row = emptyT5Row()
    for (const [column, index] of columnIndexes) {
      row[column] = cellText(line[index])
    }

    const hasAny = T5_COLUMNS.some((col) => row[col].trim())
    if (!hasAny) {
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
