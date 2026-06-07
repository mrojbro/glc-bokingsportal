import * as XLSX from 'xlsx'
import { activeEmailAddresses } from './register/emailRegister'

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

export function downloadMejlRegisterExcel(
  addresses: readonly string[],
  fileName?: string,
): void {
  const rows = activeEmailAddresses(addresses).map((address) => [address])
  const sheet = XLSX.utils.aoa_to_sheet([['Mejladress'], ...rows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Register')
  const name = fileName ?? `coop-frukt-register-mejl-${exportTimestamp()}.xlsx`
  XLSX.writeFile(workbook, name, { bookType: 'xlsx' })
}
