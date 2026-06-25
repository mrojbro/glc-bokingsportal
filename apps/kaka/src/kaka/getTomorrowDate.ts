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

/** Tomorrow is Saturday (local timezone). */
export function isTomorrowSaturday(): boolean {
  return tomorrowDate().getDay() === 6
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

/** Tomorrow's date in local timezone, formatted yyyy-mm-dd. */
export function getTomorrowDate(): string {
  const { year, month, day } = tomorrowParts()
  return `${year}-${month}-${day}`
}

/** Today's date in local timezone, formatted yyyy-mm-dd. */
export function getTodayDate(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return formatIsoDate(d)
}
