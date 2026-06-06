import type { WeekdayKey } from '../types/resursRegister'
import { WEEKDAY_KEYS } from '../types/resursRegister'

/** Local weekday from yyyy-mm-dd (Sunday = 0). */
export function weekdayKeyFromIsoDate(isoDate: string): WeekdayKey | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return null

  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  const day = Number.parseInt(match[3], 10)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return WEEKDAY_KEYS[date.getDay()] ?? null
}
