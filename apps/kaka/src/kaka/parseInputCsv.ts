import * as XLSX from 'xlsx'
import { INPUT_COLUMNS, type InputColumn } from './constants'
import { normalizeHeaderName, resolveInputColumn } from './normalizeHeader'
import type { InputRow } from './types'
import { normalizeInputRow } from './transform'

export interface ParseInputResult {
  rows: InputRow[]
  /** Known input columns not found in the file (informational only). */
  missingColumns: string[]
  fileLabel: string
  parseError?: string
}

/** Trpsätt is always the first column in source files. */
const FIRST_INPUT_COLUMN = 'Trpsätt' as const satisfies InputColumn

function buildHeaderMap(headers: string[]): Map<string, InputColumn> {
  const map = new Map<string, InputColumn>()
  headers.forEach((header, index) => {
    if (index === 0) {
      map.set(normalizeHeaderName(header), FIRST_INPUT_COLUMN)
      return
    }
    const column = resolveInputColumn(header)
    if (column) {
      map.set(normalizeHeaderName(header), column)
    }
  })
  return map
}

export function findMissingInputColumns(headers: string[]): string[] {
  const found = new Set<InputColumn>()
  if (headers.length > 0) {
    found.add(FIRST_INPUT_COLUMN)
  }
  for (const header of headers.slice(1)) {
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
  // Excel ANSI / Windows-1252 exports: ä (0xE4) becomes U+FFFD when read as UTF-8.
  if (
    utf8.includes('\uFFFD') ||
    /Ã[¤¥¶]|Â½/.test(utf8)
  ) {
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

  const sheetName = workbook.SheetNames[0] ?? ''
  if (!sheetName) {
    return {
      rows: [],
      missingColumns: [],
      fileLabel,
      parseError: 'Ingen data hittades i indata.',
    }
  }

  const sheet = workbook.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  })

  if (json.length === 0) {
    return { rows: [], missingColumns: [], fileLabel }
  }

  const headers = Object.keys(json[0] ?? {})
  const missingColumns = findMissingInputColumns(headers)
  const headerMap = buildHeaderMap(headers)
  const rows = json.map((raw) => normalizeInputRow(raw, headerMap))

  return { rows, missingColumns, fileLabel }
}

export async function parseInputCsv(file: File): Promise<ParseInputResult> {
  const buffer = await file.arrayBuffer()
  const text = decodeCsvBuffer(buffer)
  return parseInputText(text, file.name)
}
