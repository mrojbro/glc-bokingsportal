import * as XLSX from 'xlsx'
import {
  fromEditableTidRegister,
  type EditableTidRegisterEntry,
} from './register/tidRegister'
import { TID_REGISTER_COLUMNS } from './register/registerColumns'
import type { TidRegisterEntry } from './types/tidRegister'

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

export function downloadTidRegisterExcel(
  entries: readonly EditableTidRegisterEntry[],
  fileName?: string,
): void {
  const rows = fromEditableTidRegister(entries)
  const headerRow = TID_REGISTER_COLUMNS.map(({ label }) => label)
  const dataRows = rows.map((entry) =>
    TID_REGISTER_COLUMNS.map(({ key }) => entry[key as keyof TidRegisterEntry] ?? ''),
  )
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Register')
  const name = fileName ?? `coop-frukt-register-tid-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
