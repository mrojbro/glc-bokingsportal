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

function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let offset = 0
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    offset = 3
  }
  const slice = bytes.slice(offset)

  const utf8 = new TextDecoder('utf-8').decode(slice)
  if (utf8.includes('\uFFFD') || /Ã[¤¥¶]|Â½/.test(utf8)) {
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

function rowsFromWorkbook(
  workbook: XLSX.WorkBook,
  fileLabel: string,
): ParseInputResult {
  const sheetName = workbook.SheetNames[0] ?? ''
  if (!sheetName) {
    return {
      rows: [],
      missingColumns: [],
      fileLabel,
      parseError: 'Ingen data hittades i filen.',
    }
  }

  const sheet = workbook.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  })

  if (json.length === 0) {
    return { rows: [], missingColumns: INPUT_COLUMNS.slice(), fileLabel }
  }

  const headers = Object.keys(json[0] ?? {})
  const missingColumns = findMissingInputColumns(headers)
  const headerMap = buildHeaderMap(headers)
  const rows = json.map((raw) => normalizeInputRow(raw, headerMap))

  return { rows, missingColumns, fileLabel }
}

export function parseInputText(
  text: string,
  fileLabel = 'Klistrad data',
): ParseInputResult {
  if (!text.trim()) {
    return { rows: [], missingColumns: [], fileLabel }
  }

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

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'array', raw: false })
    return rowsFromWorkbook(workbook, file.name)
  }

  const text = decodeCsvBuffer(buffer)
  return parseInputText(text, file.name)
}
