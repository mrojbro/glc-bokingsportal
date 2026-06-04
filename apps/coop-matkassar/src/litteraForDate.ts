/** Littera from booking date weekday (local timezone, yyyy-mm-dd). */
export function litteraForDate(isoDate: string): string {
  const parts = isoDate.split('-').map((p) => Number.parseInt(p, 10))
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return ''

  const [year, month, day] = parts
  const weekday = new Date(year, month - 1, day).getDay()

  switch (weekday) {
    case 3:
      return 'Matkassar Företag Privat'
    case 4:
    case 5:
      return 'Matkassar Brukare'
    default:
      return ''
  }
}
