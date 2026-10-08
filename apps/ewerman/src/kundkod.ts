/** Same kundnamn always yields the same 5-digit code. */
export function normalizeKundnamn(name: string): string {
  return name.trim().toLocaleLowerCase('sv').replace(/\s+/g, ' ')
}

function fnv1a(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Deterministic 5-digit code from kundnamn (00000–99999). */
export function codeFromKundnamn(name: string): string {
  const key = normalizeKundnamn(name)
  if (!key) return ''
  return String(fnv1a(key) % 100000).padStart(5, '0')
}
