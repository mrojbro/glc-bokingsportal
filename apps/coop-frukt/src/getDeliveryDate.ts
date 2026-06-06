function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today's date in local timezone, formatted yyyy-mm-dd. */
export function getTodayDate(): string {
  return formatIsoDate(new Date())
}

/** Tomorrow's date in local timezone, formatted yyyy-mm-dd. */
export function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatIsoDate(d)
}

/** FHBG → today, otherwise tomorrow. */
export function deliveryDateFromLastningsId(lastningsId: string): string {
  return lastningsId.trim().toUpperCase() === 'FHBG'
    ? getTodayDate()
    : getTomorrowDate()
}
