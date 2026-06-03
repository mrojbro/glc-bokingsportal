/**
 * Split Swedish postnr + postort from a single "Leveransadress 4" cell.
 * Handles "431 31 Mölndal" and "43438 Kungsbacka" (→ "434 38").
 */
export function splitPostnrOrt(raw: string): { postnr: string; postort: string } {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return { postnr: '', postort: '' }

  const parts = trimmed.split(' ')

  if (parts.length >= 3 && /^\d{3}$/.test(parts[0]!) && /^\d{2}$/.test(parts[1]!)) {
    return {
      postnr: `${parts[0]} ${parts[1]}`,
      postort: parts.slice(2).join(' '),
    }
  }

  if (parts.length >= 2 && /^\d{5}$/.test(parts[0]!)) {
    const digits = parts[0]!
    return {
      postnr: `${digits.slice(0, 3)} ${digits.slice(3)}`,
      postort: parts.slice(1).join(' '),
    }
  }

  const spaced = trimmed.match(/^(\d{3})\s+(\d{2})\s+(.+)$/)
  if (spaced) {
    return {
      postnr: `${spaced[1]} ${spaced[2]}`,
      postort: spaced[3]!.trim(),
    }
  }

  const compact = trimmed.match(/^(\d{5})\s+(.+)$/)
  if (compact) {
    const digits = compact[1]!
    return {
      postnr: `${digits.slice(0, 3)} ${digits.slice(3)}`,
      postort: compact[2]!.trim(),
    }
  }

  if (parts.length === 1 && /^\d{5}$/.test(parts[0]!)) {
    const digits = parts[0]!
    return {
      postnr: `${digits.slice(0, 3)} ${digits.slice(3)}`,
      postort: '',
    }
  }

  return { postnr: '', postort: trimmed }
}
