/** Parse hh:mm, hh:mm:ss, or Excel day-fraction to seconds since midnight. */
export function parseTimeOfDay(value: string | number): number | null {
  if (value === undefined || value === null || value === '') return null

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 0 && value < 1) {
      return Math.round(value * 86400) % 86400
    }
    return null
  }

  const raw = String(value).trim()
  if (!raw) return null

  const asNumber = Number(raw.replace(',', '.'))
  if (Number.isFinite(asNumber) && asNumber > 0 && asNumber < 1) {
    return Math.round(asNumber * 86400) % 86400
  }

  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw)
  if (!match) return null

  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null
  }

  return hours * 3600 + minutes * 60 + seconds
}

/** Format seconds since midnight as hh:mm:ss. */
export function formatTimeHms(totalSeconds: number): string {
  const wrapped = ((totalSeconds % 86400) + 86400) % 86400
  const hours = Math.floor(wrapped / 3600)
  const minutes = Math.floor((wrapped % 3600) / 60)
  const seconds = wrapped % 60
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

/** When register time is missing, export uses midnight for both fields. */
export const BLANK_TID_OUTPUT = '00:00:00'

/** Center time ± 60 minutes → Starttid / Sluttid (hh:mm:ss). */
export function tidWindowFromCenter(center: string): {
  starttid: string
  sluttid: string
} {
  const centerSeconds = parseTimeOfDay(center)
  if (centerSeconds === null) {
    return { starttid: BLANK_TID_OUTPUT, sluttid: BLANK_TID_OUTPUT }
  }

  return {
    starttid: formatTimeHms(centerSeconds - 3600),
    sluttid: formatTimeHms(centerSeconds + 3600),
  }
}
