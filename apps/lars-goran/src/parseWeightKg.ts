/**
 * PrimeLog exports weight with Excel format [hh].mm.ss (e.g. 65.03.00 = 65,03 kg).
 * The stored value is a day-fraction; displayed hours/minutes map to kg integer/decimal.
 */

/** Display like 65.03.00 → 65.03 kg */
function parseDisplayWeight(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '')
  const match = trimmed.match(/^(\d+)\.(\d{2})\.(\d{2})$/)
  if (!match) return null
  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours + minutes / 100
}

/** Excel serial (day fraction) with [hh].mm.ss → kg from hours + minutes parts. */
function parseSerialTimeWeight(serial: number): number {
  const totalHours = serial * 24
  const hours = Math.floor(totalHours)
  const minutes = Math.floor((totalHours - hours) * 60 + 1e-9)
  return hours + minutes / 100
}

export function parseWeightKg(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0

  if (typeof value === 'string') {
    const display = parseDisplayWeight(value)
    if (display !== null) return display
    const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')
    const n = Number.parseFloat(cleaned)
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Raw cell values from Lars-Göran export are small day-fractions (≈2.7), not kg.
    if (value > 0 && value < 10) {
      return parseSerialTimeWeight(value)
    }
    return value > 0 ? value : 0
  }

  return 0
}
