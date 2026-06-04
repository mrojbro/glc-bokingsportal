/** Format phone for export: empty stays empty; digits → +46 national number. */
export function formatTelefonnr(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed || !/\d/.test(trimmed)) return ''

  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''

  let national = digits
  if (national.startsWith('46')) {
    national = national.slice(2)
  } else if (national.startsWith('0')) {
    national = national.slice(1)
  }

  return national ? `+46${national}` : ''
}
