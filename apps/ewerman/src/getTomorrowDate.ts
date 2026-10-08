function tomorrowDate(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function tomorrowParts(): { year: number; month: string; day: string } {
  const d = tomorrowDate()
  return {
    year: d.getFullYear(),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0'),
  }
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function excelSerialToIso(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000
  const date = new Date(utc)
  return formatIsoDate(
    new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

function expandYear(year: string): string {
  if (year.length === 4) return year
  const n = Number(year)
  if (!Number.isFinite(n)) return year
  return n >= 70 ? `19${year.padStart(2, '0')}` : `20${year.padStart(2, '0')}`
}

function toIsoDate(year: string, month: string, day: string): string {
  return `${expandYear(year)}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/** Parse Excel/EU/US date cells to yyyy-mm-dd. */
export function parseFlexibleDate(value: string | number | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 20000) {
    return excelSerialToIso(value)
  }

  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]

  const serial = Number(raw.replace(',', '.'))
  if (
    Number.isFinite(serial) &&
    serial > 20000 &&
    serial < 80000 &&
    !/[./-]/.test(raw)
  ) {
    return excelSerialToIso(serial)
  }

  const parts = raw.match(/^(\d{1,2})([./-])(\d{1,2})\2(\d{2}|\d{4})(?:\b|$)/)
  if (parts) {
    const first = Number(parts[1])
    const second = Number(parts[3])
    const year = parts[4]
    const separator = parts[2]
    if (second > 12) return toIsoDate(year, parts[1], parts[3])
    if (first > 12) return toIsoDate(year, parts[3], parts[1])
    if (separator === '/') return toIsoDate(year, parts[1], parts[3])
    return toIsoDate(year, parts[3], parts[1])
  }

  return ''
}

export function addOneDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + 1)
  return formatIsoDate(date)
}

/** Datum = Lastdatum + 1 day. */
export function deliveryDateFromLastdatum(
  value: string | number | undefined,
): string {
  const iso = parseFlexibleDate(value)
  return iso ? addOneDay(iso) : ''
}

export function isSaturdayIso(isoDate: string): boolean {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return false
  return new Date(year, month - 1, day).getDay() === 6
}

/** Tomorrow is Saturday (local timezone). */
export function isTomorrowSaturday(): boolean {
  return tomorrowDate().getDay() === 6
}

/** yyyy-mm-dd → yyyymmdd (Fraktsedel suffix). */
export function formatDateCompact(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

/** Swedish label for dialogs, e.g. "lördag 7 juni 2026". */
export function formatDeliveryDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Default date when user rejects Saturday delivery (next Monday). */
export function defaultAlternateDeliveryDate(): string {
  const d = tomorrowDate()
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1)
  }
  return formatIsoDate(d)
}

/** Tomorrow's date in local timezone, formatted yyyy-mm-dd (Datum). */
export function getTomorrowDate(): string {
  const { year, month, day } = tomorrowParts()
  return `${year}-${month}-${day}`
}

/** Tomorrow's date as yyyymmdd (Fraktsedel suffix). */
export function getTomorrowDateCompact(): string {
  return formatDateCompact(getTomorrowDate())
}
