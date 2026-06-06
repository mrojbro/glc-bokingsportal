import * as XLSX from 'xlsx'
import { REQUIRED_COLUMNS } from './constants'
import { detectHeaderRowIndex, rowsToInputRows } from './detectHeaderRow'
import { findMissingRequiredColumns } from './normalizeHeader'
import {
  pickBestSheetMatrix,
  readWorkbookFromBuffer,
} from './readSheetMatrix'
import type { InputRow } from './types'

export interface ParseInputResult {
  rows: InputRow[]
  missingColumns: string[]
  fileLabel: string
  parseError?: string
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
  if (workbook.SheetNames.length === 0) {
    return {
      rows: [],
      missingColumns: [],
      fileLabel,
      parseError: 'Ingen data hittades i filen.',
    }
  }

  const { matrix } = pickBestSheetMatrix(workbook)

  if (matrix.length === 0) {
    return { rows: [], missingColumns: [...REQUIRED_COLUMNS], fileLabel }
  }

  const headerRowIndex = detectHeaderRowIndex(matrix)
  const { rows, matchedColumns } = rowsToInputRows(matrix, headerRowIndex)

  if (rows.length === 0) {
    return { rows: [], missingColumns: [...REQUIRED_COLUMNS], fileLabel }
  }

  const missingColumns = findMissingRequiredColumns(matchedColumns)

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
    try {
      const workbook = readWorkbookFromBuffer(buffer)
      return rowsFromWorkbook(workbook, file.name)
    } catch (err) {
      return {
        rows: [],
        missingColumns: [],
        fileLabel: file.name,
        parseError:
          err instanceof Error
            ? `Kunde inte läsa Excel-filen: ${err.message}`
            : 'Kunde inte läsa Excel-filen.',
      }
    }
  }

  const text = decodeCsvBuffer(buffer)
  return parseInputText(text, file.name)
}

export function findMissingInputColumns(headers: string[]): string[] {
  return findMissingRequiredColumns(headers)
}
