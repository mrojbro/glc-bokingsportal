import * as XLSX from 'xlsx'
import { OUTPUT_COLUMNS } from './constants'
import { normalizeLeveranstid } from './register/tidRegister'
import type { OutputRow } from './types'

const LEVERANSTID_COLUMN = 'Latest Requested Time (Unloading Location)' as const
const LEVERANSTID_COL_INDEX = OUTPUT_COLUMNS.indexOf(LEVERANSTID_COLUMN)
/** Excel built-in time format (numFmtId 21) — shows as Time, not Custom. */
const LEVERANSTID_NUMFMT = 'h:mm:ss'

/** hh:mm:ss → Excel day fraction (0 = midnight, 0.5 = noon). */
function timeStringToExcelSerial(time: string): number {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim())
  if (!match) return 0

  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0

  if (hours > 23 || minutes > 59 || seconds > 59) return 0

  return (hours * 3600 + minutes * 60 + seconds) / 86_400
}

function applyLeveranstidTimeCells(
  sheet: XLSX.WorkSheet,
  dataRowCount: number,
): void {
  const col = XLSX.utils.encode_col(LEVERANSTID_COL_INDEX)

  for (let row = 1; row <= dataRowCount; row++) {
    const address = `${col}${row + 1}`
    const cell = sheet[address]
    if (!cell) continue

    const serial = timeStringToExcelSerial(
      normalizeLeveranstid(String(cell.v ?? '')),
    )
    cell.t = 'n'
    cell.v = serial
    cell.z = LEVERANSTID_NUMFMT
  }
}

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
  const headerRow = [...OUTPUT_COLUMNS]
  const dataRows = rows.map((row) =>
    OUTPUT_COLUMNS.map((col) => {
      const value = row[col] ?? ''
      return col === LEVERANSTID_COLUMN ? normalizeLeveranstid(value) : value
    }),
  )
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  applyLeveranstidTimeCells(sheet, dataRows.length)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Export')
  const name = fileName ?? `coop-frukt-export-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
