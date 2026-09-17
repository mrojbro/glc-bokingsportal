import * as XLSX from 'xlsx'
import type { PostnrRegisterEntry } from './postnrRegister'

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

export function downloadPostnrRegisterExcel(
  entries: readonly PostnrRegisterEntry[],
  fileName?: string,
): void {
  const headerRow = ['Postnr', 'Sorteringskod v1']
  const dataRows = entries.map((entry) => [
    entry.postnr,
    entry.transportinstruktion,
  ])
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Register')
  const name =
    fileName ?? `broderna-hanssons-postnr-register-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
