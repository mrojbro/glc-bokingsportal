import * as XLSX from 'xlsx'
import { INPUT_COLUMNS, type InputColumn } from './constants'
import { normalizeHeaderName, resolveInputColumn } from './normalizeHeader'
import type { InputRow } from './types'
import { normalizeInputRow } from './transform'

export interface ParseInputResult {
  rows: InputRow[]
  missingColumns: string[]
  fileLabel: string
  parseError?: string
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function buildHeaderMap(headers: string[]): Map<string, InputColumn> {
  const map = new Map<string, InputColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) {
      map.set(normalizeHeaderName(header), column)
    }
  }
  return map
}

export function findMissingInputColumns(headers: string[]): string[] {
  const found = new Set<InputColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) found.add(column)
  }
  return INPUT_COLUMNS.filter((col) => !found.has(col))
}

function countHeaderMatches(headers: string[]): number {
  const found = new Set<InputColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) found.add(column)
  }
  return found.size
}

function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes)
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes)
  }

  let offset = 0
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    offset = 3
  }
  const slice = bytes.slice(offset)

  const utf8 = new TextDecoder('utf-8').decode(slice)
  if (utf8.includes('\uFFFD') || /Ã[¤¥¶]/.test(utf8)) {
    try {
      return new TextDecoder('windows-1252').decode(slice)
    } catch {
      return utf8
    }
  }
  return utf8
}

function detectDelimiter(firstLine: string): string {
  const tabs = (firstLine.match(/\t/g) ?? []).length
  const semicolons = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  if (tabs > semicolons && tabs > commas) return '\t'
  return semicolons > commas ? ';' : ','
}

function looksLikeMarkup(text: string): boolean {
  const start = text.trimStart().slice(0, 2000).toLowerCase()
  return (
    start.startsWith('<html') ||
    start.startsWith('<!doctype') ||
    start.startsWith('<?xml') ||
    start.includes('<table') ||
    start.includes('<workbook') ||
    start.includes('excel.sheet')
  )
}

function mergeHeaderRows(a: unknown[], b: unknown[]): string[] {
  const len = Math.max(a.length, b.length)
  const merged: string[] = []
  for (let i = 0; i < len; i++) {
    const top = cellText(a[i])
    const bottom = cellText(b[i])
    merged.push([top, bottom].filter(Boolean).join(' '))
  }
  return merged
}

function findHeader(matrix: unknown[][]): {
  headers: string[]
  dataStart: number
  score: number
} | null {
  let best: { headers: string[]; dataStart: number; score: number } | null = null

  for (let i = 0; i < matrix.length; i++) {
    const row = (matrix[i] ?? []).map(cellText)
    let headers = row
    let dataStart = i + 1
    let score = countHeaderMatches(row)

    const next = matrix[i + 1]
    if (next) {
      const merged = mergeHeaderRows(matrix[i] ?? [], next)
      const mergedScore = countHeaderMatches(merged)
      if (mergedScore > score) {
        headers = merged
        dataStart = i + 2
        score = mergedScore
      }
    }

    if (!best || score > best.score) {
      best = { headers, dataStart, score }
    }
    if (score >= INPUT_COLUMNS.length) break
  }

  if (!best || best.score < 2) return null
  return best
}

function isRepeatedHeaderRow(cells: unknown[], headers: string[]): boolean {
  let matches = 0
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    if (!header) continue
    if (normalizeHeaderName(cellText(cells[i])) === normalizeHeaderName(header)) {
      matches += 1
    }
  }
  return matches >= 3 || countHeaderMatches(cells.map(cellText)) >= 3
}

function extractDataRows(
  matrix: unknown[][],
  headers: string[],
  dataStart: number,
): InputRow[] {
  const headerMap = buildHeaderMap(headers)
  const rows: InputRow[] = []

  for (let r = dataStart; r < matrix.length; r++) {
    const line = matrix[r] ?? []
    if (line.every((cell) => !cellText(cell))) continue
    if (isRepeatedHeaderRow(line, headers)) continue

    const raw: Record<string, unknown> = {}
    headers.forEach((header, colIndex) => {
      if (!header) return
      raw[header] = line[colIndex] ?? ''
    })
    rows.push(normalizeInputRow(raw, headerMap))
  }

  return rows
}

function applyMerges(
  matrix: unknown[][],
  merges: XLSX.Range[] | undefined,
): unknown[][] {
  if (!merges || merges.length === 0) return matrix

  const out = matrix.map((row) => (Array.isArray(row) ? row.slice() : []))
  for (const range of merges) {
    const value = out[range.s.r]?.[range.s.c]
    for (let r = range.s.r; r <= range.e.r; r++) {
      while (out.length <= r) out.push([])
      for (let c = range.s.c; c <= range.e.c; c++) {
        if (!out[r]) out[r] = []
        if (r === range.s.r && c === range.s.c) continue
        if (!cellText(out[r][c])) out[r][c] = value
      }
    }
  }
  return out
}

function expandSheetRef(sheet: XLSX.WorkSheet): void {
  let maxR = 0
  let maxC = 0

  for (const key of Object.keys(sheet)) {
    if (key.startsWith('!')) continue
    const { r, c } = XLSX.utils.decode_cell(key)
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }

  if (sheet['!ref']) {
    const range = XLSX.utils.decode_range(sheet['!ref'])
    maxR = Math.max(maxR, range.e.r)
    maxC = Math.max(maxC, range.e.c)
  }

  const autoFilter = sheet['!autofilter'] as { ref?: string } | undefined
  if (autoFilter?.ref) {
    const range = XLSX.utils.decode_range(autoFilter.ref)
    maxR = Math.max(maxR, range.e.r)
    maxC = Math.max(maxC, range.e.c)
  }

  sheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxR, c: maxC },
  })
}

function matrixFromSheet(sheet: XLSX.WorkSheet): unknown[][] {
  expandSheetRef(sheet)
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: true,
  })
  return applyMerges(matrix, sheet['!merges'])
}

function expandedRowCells(tr: HTMLTableRowElement): string[] {
  const cells: string[] = []
  for (const cell of tr.cells) {
    const span = Math.max(1, cell.colSpan || 1)
    const text = cellText(cell.textContent)
    for (let i = 0; i < span; i++) cells.push(text)
  }
  return cells
}

function matrixFromHtmlTables(html: string): unknown[][] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const tables = [...doc.querySelectorAll('table')].filter(
    (table): table is HTMLTableElement => table instanceof HTMLTableElement,
  )
  const matrix: unknown[][] = []

  for (const table of tables) {
    for (const tr of table.rows) {
      matrix.push(expandedRowCells(tr))
    }
  }

  return matrix
}

function attrIndex(el: Element, name: string): number | null {
  const value =
    el.getAttribute(name) ??
    el.getAttribute(`ss:${name}`) ??
    el.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet', name)
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? n : null
}

function matrixFromSpreadsheetMl(xml: string): unknown[][] | null {
  const looksLike =
    xml.includes('urn:schemas-microsoft-com:office:spreadsheet') ||
    xml.includes('ss:Workbook') ||
    xml.includes('Excel.Sheet')
  if (!looksLike) return null

  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) return null

  const worksheets = [...doc.getElementsByTagName('*')].filter(
    (el) => el.localName === 'Worksheet',
  )
  if (worksheets.length === 0) return null

  const matrix: unknown[][] = []

  for (const worksheet of worksheets) {
    const rowEls = [...worksheet.getElementsByTagName('*')].filter(
      (el) => el.localName === 'Row',
    )
    let rowCursor = 1

    for (const rowEl of rowEls) {
      const rowIndex = attrIndex(rowEl, 'Index') ?? rowCursor
      while (matrix.length < rowIndex - 1) matrix.push([])

      const cells: string[] = []
      let colCursor = 1
      const cellEls = [...rowEl.children].filter((el) => el.localName === 'Cell')

      for (const cellEl of cellEls) {
        const colIndex = attrIndex(cellEl, 'Index') ?? colCursor
        const mergeAcross = attrIndex(cellEl, 'MergeAcross') ?? 0
        const dataEl = [...cellEl.getElementsByTagName('*')].find(
          (el) => el.localName === 'Data',
        )
        const text = cellText(dataEl?.textContent)
        while (cells.length < colIndex - 1) cells.push('')
        const span = mergeAcross + 1
        for (let i = 0; i < span; i++) cells.push(text)
        colCursor = colIndex + span
      }

      matrix.push(cells)
      rowCursor = rowIndex + 1
    }
  }

  return matrix.length > 0 ? matrix : null
}

function matricesFromWorkbook(workbook: XLSX.WorkBook): unknown[][][] {
  const matrices: unknown[][][] = []
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const matrix = matrixFromSheet(sheet)
    if (matrix.length > 0) matrices.push(matrix)
  }
  return matrices
}

function rowsFromMatrices(
  matrices: unknown[][][],
  fileLabel: string,
): ParseInputResult {
  if (matrices.length === 0) {
    return {
      rows: [],
      missingColumns: [],
      fileLabel,
      parseError: 'Ingen data hittades i filen.',
    }
  }

  const combined = matrices.flat()
  const found = findHeader(combined)
  if (!found) {
    return {
      rows: [],
      missingColumns: INPUT_COLUMNS.slice(),
      fileLabel,
      parseError:
        'Kunde inte hitta rubrikraden. Kontrollera att filen innehåller kolumnerna Datum, Sedelnummer, Märkning och Angöring … - Sista.',
    }
  }

  const rows = extractDataRows(combined, found.headers, found.dataStart)
  return {
    rows,
    missingColumns: findMissingInputColumns(found.headers),
    fileLabel,
  }
}

function rowsFromMarkup(text: string, fileLabel: string): ParseInputResult | null {
  if (!looksLikeMarkup(text)) return null

  const spreadsheet = matrixFromSpreadsheetMl(text)
  const htmlMatrix = spreadsheet ? [] : matrixFromHtmlTables(text)
  const matrix = spreadsheet ?? (htmlMatrix.length > 0 ? htmlMatrix : null)
  if (!matrix) return null

  const result = rowsFromMatrices([matrix], fileLabel)
  return result.rows.length > 0 ? result : null
}

function isZipOrOle(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 4) return false
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return true
  return (
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  )
}

function rowsFromWorkbook(
  workbook: XLSX.WorkBook,
  fileLabel: string,
): ParseInputResult {
  return rowsFromMatrices(matricesFromWorkbook(workbook), fileLabel)
}

export function parseInputText(
  text: string,
  fileLabel = 'Klistrad data',
): ParseInputResult {
  if (!text.trim()) {
    return { rows: [], missingColumns: [], fileLabel }
  }

  const markup = rowsFromMarkup(text, fileLabel)
  if (markup) return markup

  const firstLine = text.split(/\r?\n/)[0] ?? ''
  const delimiter = detectDelimiter(firstLine)

  const workbook = XLSX.read(text, {
    type: 'string',
    raw: false,
    FS: delimiter,
  })

  return rowsFromWorkbook(workbook, fileLabel)
}

export async function parseInputFile(file: File): Promise<ParseInputResult> {
  const buffer = await file.arrayBuffer()
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'htm' || ext === 'html' || (ext === 'xls' && !isZipOrOle(buffer))) {
    const markup = rowsFromMarkup(decodeCsvBuffer(buffer), file.name)
    if (markup) return markup
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'array', raw: false })
    return rowsFromWorkbook(workbook, file.name)
  }

  const text = decodeCsvBuffer(buffer)
  return parseInputText(text, file.name)
}
