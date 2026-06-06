/** Excel serial date (days since 1899-12-30). */
function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null
  const utc = Math.round((serial - 25569) * 86400 * 1000)
  const d = new Date(utc)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function expandTwoDigitYear(year: string): string {
  const n = Number.parseInt(year, 10)
  if (!Number.isFinite(n)) return year
  if (year.length === 4) return year
  return n >= 70 ? `19${String(n).padStart(2, '0')}` : `20${String(n).padStart(2, '0')}`
}

/** Parse US-style dates and return yyyy-mm-dd. */
export function parseUsDateToIso(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return ''

  if (typeof value === 'number') {
    if (value > 20000 && value < 600000) {
      const fromSerial = excelSerialToDate(value)
      if (fromSerial) return formatIsoDate(fromSerial)
    }
    return ''
  }

  const raw = String(value).trim()
  if (!raw) return ''

  const serial = Number.parseFloat(raw.replace(',', '.'))
  if (Number.isFinite(serial) && serial > 20000 && serial < 600000 && !raw.includes('/')) {
    const fromSerial = excelSerialToDate(serial)
    if (fromSerial) return formatIsoDate(fromSerial)
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return raw

  const usSlash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (usSlash) {
    const [, month, day, year] = usSlash
    const fullYear = expandTwoDigitYear(year)
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const usDash = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/)
  if (usDash) {
    const [, month, day, year] = usDash
    const fullYear = expandTwoDigitYear(year)
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return formatIsoDate(parsed)
  }

  return ''
}
