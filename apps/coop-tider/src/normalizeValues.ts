import type { InputColumn } from './constants'

function trimCell(value: string): string {
  return value.replace(/\u00a0/g, ' ').trim()
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** yyyy-mm-dd when the cell looks like a date. */
export function normalizeDate(value: string): string {
  const text = trimCell(value)
  if (!text) return ''

  if (/^\d+(\.\d+)?$/.test(text.replace(',', '.'))) {
    const serial = Number(text.replace(',', '.'))
    if (Number.isFinite(serial) && serial > 20000 && serial < 100000) {
      const utc = Math.round((serial - 25569) * 86400 * 1000)
      const date = new Date(utc)
      if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
    }
  }

  const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]

  const dmyMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/)
  if (dmyMatch) {
    let first = Number(dmyMatch[1])
    let second = Number(dmyMatch[2])
    if (second > 12 && first <= 12) {
      ;[first, second] = [second, first]
    }
    const day = String(first).padStart(2, '0')
    const month = String(second).padStart(2, '0')
    let year = dmyMatch[3]
    if (year.length === 2) year = Number(year) >= 70 ? `19${year}` : `20${year}`
    return `${year}-${month}-${day}`
  }

  return text.toLocaleLowerCase('sv')
}

/** HH:mm for comparison (07:00:00 and 7:00 become 07:00). */
export function normalizeTime(value: string): string {
  const text = trimCell(value)
  if (!text) return ''

  const fraction = Number(text.replace(',', '.'))
  if (
    Number.isFinite(fraction) &&
    fraction >= 0 &&
    fraction < 1 &&
    !/[:.]/.test(text.replace(',', ''))
  ) {
    const totalMinutes = Math.round(fraction * 24 * 60)
    const hours = Math.floor(totalMinutes / 60) % 24
    const minutes = totalMinutes % 60
    return `${pad2(hours)}:${pad2(minutes)}`
  }

  const ampm = text.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(am|pm)\b/i)
  if (ampm) {
    let hours = Number(ampm[1]) % 12
    if (ampm[3].toLowerCase() === 'pm') hours += 12
    return `${pad2(hours)}:${ampm[2]}`
  }

  const match = text.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?/)
  if (match) return `${pad2(Number(match[1]))}:${match[2]}`

  return text.toLocaleLowerCase('sv')
}

export function normalizeCompareValue(column: InputColumn, value: string): string {
  const text = trimCell(value)
  if (!text) return ''

  if (column === 'Latest Requested Date (Unloading Location)') {
    return normalizeDate(text)
  }
  if (column === 'Latest Requested Time (Unloading Location)') {
    return normalizeTime(text)
  }
  if (column === 'Butiksnr') {
    return text.replace(/\s+/g, '')
  }
  return text.toLocaleLowerCase('sv').replace(/\s+/g, ' ')
}
