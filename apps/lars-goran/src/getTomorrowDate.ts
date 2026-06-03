function tomorrowParts(): { year: number; month: string; day: string } {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return {
    year: d.getFullYear(),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0'),
  }
}

/** Tomorrow's date in local timezone, formatted yyyy-mm-dd (Datum). */
export function getTomorrowDate(): string {
  const { year, month, day } = tomorrowParts()
  return `${year}-${month}-${day}`
}

/** Tomorrow's date as yyyymmdd (Fraktsedel suffix). */
export function getTomorrowDateCompact(): string {
  const { year, month, day } = tomorrowParts()
  return `${year}${month}${day}`
}
