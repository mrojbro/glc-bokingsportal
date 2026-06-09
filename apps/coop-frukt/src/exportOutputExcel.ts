import * as XLSX from 'xlsx'
import { OUTPUT_COLUMNS } from './constants'
import { normalizeLeveranstid } from './register/tidRegister'
import type { OutputRow } from './types'

const LEVERANSTID_COLUMN = 'Latest Requested Time (Unloading Location)' as const

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
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Export')
  const name = fileName ?? `coop-frukt-export-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
