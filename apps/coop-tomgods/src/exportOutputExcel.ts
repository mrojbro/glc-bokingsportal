import * as XLSX from 'xlsx'
import { OUTPUT_COLUMNS, OUTPUT_HEADERS } from './constants'
import type { OutputRow } from './types'

/** Rows 1–6 in the FWO sheet (output headers start on row 7). */
const EXPORT_PREAMBLE_ROWS: (string | number)[][] = [
  ['Typ', 'TS'],
  ['Avsändare', '134666'],
  ['Leverantör', '134666'],
  ['Kommentar', ''],
  [],
  [],
]

/** Column A on the Metadata sheet (field keys for import mapping). */
const METADATA_COLUMN_A: (string | number)[] = [
  8,
  'DELIVERY_DATE',
  'STORE/WH',
  'STORE_NAME',
  'QUANTITY',
  'WEIGHT',
  'VOLUME',
  'PRODUCT_DESCRIPTION',
  'PICK-UP_LOCATION',
  'TRANSP_GRP',
  'PICK-UP_DATE',
  'TRANSP_GRP',
  'LOAD_CARRIER',
  'PPL',
  'BOOKING_TEXT',
  'DEST_LOCATION',
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

function buildFwoSheet(rows: OutputRow[]): XLSX.WorkSheet {
  const dataRows = rows.map((row) =>
    OUTPUT_COLUMNS.map((col) => row[col] ?? ''),
  )
  return XLSX.utils.aoa_to_sheet([
    ...EXPORT_PREAMBLE_ROWS,
    OUTPUT_HEADERS,
    ...dataRows,
  ])
}

function buildMetadataSheet(): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(
    METADATA_COLUMN_A.map((value) => [value]),
  )
}

export function downloadOutputExcel(rows: OutputRow[], fileName?: string): void {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, buildFwoSheet(rows), 'FWO')
  XLSX.utils.book_append_sheet(workbook, buildMetadataSheet(), 'Metadata')
  const name = fileName ?? `coop-tomgods-export-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
