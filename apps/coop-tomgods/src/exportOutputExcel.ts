import * as XLSX from 'xlsx'
import { OUTPUT_COLUMNS, OUTPUT_HEADERS, type OutputColumn } from './constants'
import type { OutputRow } from './types'

/** yyyy-mm-dd → MM/DD/YYYY for export (e.g. 2026-06-25 → 06/25/2026). */
function formatIsoDateToUs(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return isoDate
  const [, year, month, day] = match
  return `${month}/${day}/${year}`
}

const US_DATE_COLUMNS = new Set<OutputColumn>(['leveransdatum', 'hamtdatum'])

function formatFwoCellValue(column: OutputColumn, value: string): string {
  if (US_DATE_COLUMNS.has(column)) {
    return formatIsoDateToUs(value)
  }
  return value
}

/** Rows 1–6 in the FWO sheet (output headers start on row 7). */
const EXPORT_PREAMBLE_ROWS: (string | number)[][] = [
  ['Typ', 'TS'],
  ['Avsändare', '134666'],
  ['Leverantör', '134666'],
  ['Kommentar', ''],
  [],
  [],
]

/** Column A field keys; rows 1–2 also set C/D per import template. */
const METADATA_FIELD_KEYS: (string | number)[] = [
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
    OUTPUT_COLUMNS.map((col) => formatFwoCellValue(col, row[col] ?? '')),
  )
  return XLSX.utils.aoa_to_sheet([
    ...EXPORT_PREAMBLE_ROWS,
    OUTPUT_HEADERS,
    ...dataRows,
  ])
}

function buildMetadataSheet(): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    [8, '', 'Default Field', 'Value'],
    ['DELIVERY_DATE', '', 'MOVEMENT_TYPE', 'ZD'],
    ...METADATA_FIELD_KEYS.slice(1).map((key) => [key]),
  ]
  return XLSX.utils.aoa_to_sheet(rows)
}

function buildControlDataSheet(): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet([
    ['Fixed Values'],
    [],
    ['Store ID', 'Name', 'Movement Type', 'Load carrier', 'Transport'],
  ])
}

/** Swedish label → English label → import field key (Column mappning sheet). */
const COLUMN_MAPPNING_ROWS: [string, string, string][] = [
  ['Orderreferens', 'Order reference ID', 'ORDER_REFERENCE_ID'],
  ['Uppämtningsplats', 'Pick-up Location', 'PICK-UP_LOCATION'],
  ['Transportsätt', 'Movement type', 'MOVEMENT_TYPE'],
  ['Omlastningsterminal', 'CrossDock Warehouse', 'CROSSDOCK_WAREHOUSE'],
  ['Mottagarnummer (BP-ID)', 'Store/WH [consegnee]', 'STORE/WH'],
  ['Mottagarnamn', 'Store name', 'STORE_NAME'],
  ['Hämtdatum', 'Pick-up date', 'PICK-UP_DATE'],
  ['Artikelnummer', 'Product number', 'PRODUCT_NUMBER'],
  ['Artikelbeskrivning', 'Product Description', 'PRODUCT_DESCRIPTION'],
  ['Hämttid', 'Pick-up time', 'PICK-UP_TIME'],
  ['Leveransdatum', 'Delivery date', 'DELIVERY_DATE'],
  ['Varuslag', 'Trasp.grp', 'TRANSP_GRP'],
  ['Lastbärartyp', 'Load carrier', 'LOAD_CARRIER'],
  ['Antal lastbärare', 'Quantity', 'QUANTITY'],
  ['Vikt', 'Weight', 'WEIGHT'],
  ['Volym', 'Volume', 'VOLUME'],
  ['Antal PPL', 'PPL', 'PPL'],
  ['Längd', 'L', 'LENGTH'],
  ['Bredd', 'W', 'WIDTH'],
  ['Högt', 'H', 'HEIGHT'],
  ['Stapelbar', 'Stackability', 'STACKABILITY'],
  ['Farligt gods', 'DG cat.', 'DG_CAT'],
  ['Farligt godskategori', 'ADR', 'ADR'],
  ['Meddelandetext', 'Booking text [note]', 'BOOKING_TEXT'],
  ['Leveransplats', 'Destination Location', 'DEST_LOCATION'],
]

function buildColumnMappningSheet(): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(COLUMN_MAPPNING_ROWS)
}

export function downloadOutputExcel(rows: OutputRow[], fileName?: string): void {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, buildFwoSheet(rows), 'Order info')
  XLSX.utils.book_append_sheet(workbook, buildMetadataSheet(), 'Metadata')
  XLSX.utils.book_append_sheet(workbook, buildControlDataSheet(), 'Control data')
  XLSX.utils.book_append_sheet(workbook, buildColumnMappningSheet(), 'Column mapping')
  const name = fileName ?? `coop-tomgods-export-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
