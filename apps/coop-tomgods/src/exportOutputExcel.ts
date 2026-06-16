import * as XLSX from 'xlsx'
import { OUTPUT_COLUMNS, OUTPUT_HEADERS } from './constants'
import type { OutputRow } from './types'

/** Rows 1–6 in the export file (output headers start on row 7). */
const EXPORT_PREAMBLE_ROWS: (string | number)[][] = [
  ['Typ', 'TS'],
  ['Avsändare', '134666'],
  ['Leverantör', '134666'],
  ['Kommentar', ''],
  [],
  [],
]

function exportTimestamp(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}_${hours}${minutes}${seconds}`
}

export function downloadOutputExcel(rows: OutputRow[], fileName?: string): void {
  const dataRows = rows.map((row) =>
    OUTPUT_COLUMNS.map((col) => row[col] ?? ''),
  )
  const sheet = XLSX.utils.aoa_to_sheet([
    ...EXPORT_PREAMBLE_ROWS,
    OUTPUT_HEADERS,
    ...dataRows,
  ])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Export')
  const name = fileName ?? `coop-tomgods-export-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
