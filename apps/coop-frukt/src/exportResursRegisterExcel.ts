import * as XLSX from 'xlsx'
import {
  fromEditableResursRegister,
  type EditableResursRegisterEntry,
} from './register/resursRegister'
import {
  REGISTER_BASE_COLUMNS,
  REGISTER_WEEKDAY_COLUMNS,
} from './register/registerColumns'
import type { ResursRegisterEntry } from './types/resursRegister'

const REGISTER_COLUMNS = [...REGISTER_BASE_COLUMNS, ...REGISTER_WEEKDAY_COLUMNS]

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

export function downloadResursRegisterExcel(
  entries: readonly EditableResursRegisterEntry[],
  fileName?: string,
): void {
  const rows = fromEditableResursRegister(entries)
  const headerRow = REGISTER_COLUMNS.map(({ label }) => label)
  const dataRows = rows.map((entry) =>
    REGISTER_COLUMNS.map(({ key }) => entry[key as keyof ResursRegisterEntry] ?? ''),
  )
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Register')
  const name = fileName ?? `coop-frukt-register-resurs-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
