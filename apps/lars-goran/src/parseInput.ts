import * as XLSX from 'xlsx'
import { parsePrimeLogHtml } from './parsePrimeLogHtml'
import {
  buildHeaderMap,
  cellText,
  findHeaderRowIndex,
  findMissingInputColumns,
  isHtmlContent,
  REQUIRED_COLUMNS,
  type ParseInputResult,
} from './parseInputShared'
import { normalizeInputRow } from './transform'

export type { ParseInputResult } from './parseInputShared'
export { findMissingInputColumns } from './parseInputShared'

function rowsFromMatrix(matrix: unknown[][], fileLabel: string): ParseInputResult {
  if (!matrix.length) {
    return {
      rows: [],
      missingColumns: REQUIRED_COLUMNS.slice(),
      fileLabel,
      parseError: 'Ingen data hittades i filen.',
    }
  }

  const headerRowIndex = findHeaderRowIndex(matrix)
  if (headerRowIndex < 0) {
    return {
      rows: [],
      missingColumns: REQUIRED_COLUMNS.slice(),
      fileLabel,
      parseError:
        'Kunde inte hitta rubrikraden (Shipment date, Consignee, Weight (kg)). Om filen är en PrimeLog .xls-export, spara/ladda upp den som den laddas ner.',
    }
  }

  const headerRow = matrix[headerRowIndex] ?? []
  const headers = headerRow.map((cell) => cellText(cell))
  const missingColumns = findMissingInputColumns(headers)

  if (missingColumns.length > 0) {
    return {
      rows: [],
      missingColumns,
      fileLabel,
      parseError: `Saknade obligatoriska kolumner: ${missingColumns.join(', ')}. Kontrollera att rubrikraden innehåller exportkolumnerna.`,
    }
  }

  const headerMap = buildHeaderMap(headers)
  const rows = []

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const line = matrix[r] ?? []
    const raw: Record<string, unknown> = {}
    headers.forEach((header, colIndex) => {
      if (!header) return
      raw[header] = line[colIndex] ?? ''
    })
    const row = normalizeInputRow(raw, headerMap)
    if (
      !cellText(row.Consignee) &&
      !cellText(row['Shipment reference']) &&
      !cellText(row['Weight (kg)'])
    ) {
      continue
    }
    rows.push(row)
  }

  return { rows, missingColumns: [], fileLabel }
}

function matrixFromWorkbook(workbook: XLSX.WorkBook): unknown[][] {
  let bestMatrix: unknown[][] = []
  let bestHeaderIndex = -1

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    })
    const headerRowIndex = findHeaderRowIndex(matrix)
    if (headerRowIndex < 0) continue

    const headers = (matrix[headerRowIndex] ?? []).map((cell) => cellText(cell))
    const missing = findMissingInputColumns(headers).length
    const dataRows = matrix.length - headerRowIndex - 1

    const score = dataRows * 10 - missing
    const bestScore =
      bestHeaderIndex >= 0
        ? (bestMatrix.length - bestHeaderIndex - 1) * 10 -
          findMissingInputColumns(
            (bestMatrix[bestHeaderIndex] ?? []).map((c) => cellText(c)),
          ).length
        : -1

    if (score > bestScore) {
      bestMatrix = matrix
      bestHeaderIndex = headerRowIndex
    }
  }

  return bestMatrix
}

function decodeBufferAsText(buffer: ArrayBuffer): string {
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

function parseHtmlOrWorkbookText(text: string, fileLabel: string): ParseInputResult {
  const htmlResult = parsePrimeLogHtml(text, fileLabel)
  if (htmlResult) return htmlResult

  if (isHtmlContent(text)) {
    return {
      rows: [],
      missingColumns: REQUIRED_COLUMNS.slice(),
      fileLabel,
      parseError:
        'Filen ser ut som HTML men tabellen tableWaybillList kunde inte läsas. Prova att exportera om från PrimeLog.',
    }
  }

  const firstLine = text.split(/\r?\n/)[0] ?? ''
  const delimiter = detectDelimiter(firstLine)
  const workbook = XLSX.read(text, {
    type: 'string',
    raw: false,
    FS: delimiter,
  })
  return rowsFromMatrix(matrixFromWorkbook(workbook), fileLabel)
}

export function parseInputText(
  text: string,
  fileLabel = 'Klistrad data',
): ParseInputResult {
  if (!text.trim()) {
    return { rows: [], missingColumns: [], fileLabel }
  }

  return parseHtmlOrWorkbookText(text, fileLabel)
}

export async function parseInputFile(file: File): Promise<ParseInputResult> {
  const buffer = await file.arrayBuffer()
  const ext = file.name.split('.').pop()?.toLowerCase()
  const text = decodeBufferAsText(buffer)

  if (isHtmlContent(text) || ext === 'htm' || ext === 'html') {
    return parseHtmlOrWorkbookText(text, file.name)
  }

  if (ext === 'xlsx' || ext === 'xls') {
    if (isHtmlContent(text)) {
      return parseHtmlOrWorkbookText(text, file.name)
    }
    const workbook = XLSX.read(buffer, { type: 'array', raw: false })
    return rowsFromMatrix(matrixFromWorkbook(workbook), file.name)
  }

  return parseInputText(text, file.name)
}
