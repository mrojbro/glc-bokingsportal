import * as XLSX from 'xlsx'
import { detectHeaderRowIndex } from './detectHeaderRow'
import { countMatchedSheetColumns } from './normalizeHeader'

export function isProbablyHtml(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 512)))
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trimStart().toLowerCase()
  return text.startsWith('<') || text.includes('<html') || text.includes('<table')
}

export function readWorkbookFromBuffer(buffer: ArrayBuffer): XLSX.WorkBook {
  if (isProbablyHtml(buffer)) {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    return XLSX.read(text, { type: 'string', raw: false })
  }
  return XLSX.read(buffer, { type: 'array', raw: false })
}

function scoreSheetMatrix(matrix: unknown[][]): number {
  if (matrix.length === 0) return 0

  const headerRowIndex = detectHeaderRowIndex(matrix)
  const headerRow = matrix[headerRowIndex]
  if (!Array.isArray(headerRow)) return 0

  const headers = headerRow.map((cell) => String(cell ?? ''))
  const matchCount = countMatchedSheetColumns(headers)
  const dataRowCount = Math.max(0, matrix.length - headerRowIndex - 1)

  return matchCount * 1000 + dataRowCount
}

/** Pick the sheet that contains shipment headers and data (HTML .xls often uses Sheet2). */
export function pickBestSheetMatrix(
  workbook: XLSX.WorkBook,
): { matrix: unknown[][]; sheetName: string } {
  let bestMatrix: unknown[][] = []
  let bestSheetName = workbook.SheetNames[0] ?? ''
  let bestScore = -1

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    })

    const score = scoreSheetMatrix(matrix)
    if (score > bestScore) {
      bestScore = score
      bestMatrix = matrix
      bestSheetName = sheetName
    }
  }

  return { matrix: bestMatrix, sheetName: bestSheetName }
}

/** HTML .xls exports merge Shipment date + Consignee into the first cell. */
export function repairMergedDateConsigneeRow(row: unknown[]): unknown[] {
  const first = String(row[0] ?? '').trim()
  const merged = first.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4})(.+)$/)
  if (!merged) return row

  const [, date, consignee] = merged
  return [date, consignee.trim(), ...row.slice(1)]
}

export function repairDataRows(dataRows: unknown[][]): unknown[][] {
  return dataRows.map((row) =>
    Array.isArray(row) ? repairMergedDateConsigneeRow(row) : row,
  )
}
