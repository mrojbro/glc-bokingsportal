export type BeautifyResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string }

/** Parse minified JSON and return a 2-space indented string. */
export function beautifyJson(raw: string): BeautifyResult {
  const trimmed = raw.replace(/^\uFEFF/, '').trim()
  if (!trimmed) {
    return { ok: false, error: 'Klistra in JSON först.' }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    return { ok: true, formatted: JSON.stringify(parsed, null, 2) }
  } catch (err) {
    const message =
      err instanceof SyntaxError ? err.message : 'Kunde inte tolka texten.'
    return { ok: false, error: `Ogiltig JSON: ${message}` }
  }
}
