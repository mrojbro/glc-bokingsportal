/** Parse semicolon, comma, or newline-separated emails. */
export function parseEmailListText(text: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const part of text.split(/[;\n,]+/)) {
    const address = part.trim()
    if (!address) continue
    const key = address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(address)
  }

  return result
}

/** Display / copy format for all recipients. */
export function formatEmailListText(addresses: readonly string[]): string {
  return activeEmailAddresses(addresses).join('; ')
}

/** Split addresses evenly across two display rows. */
export function formatEmailListTwoRows(addresses: readonly string[]): string {
  const active = activeEmailAddresses(addresses)
  if (active.length <= 1) return active.join('; ')

  const midpoint = Math.ceil(active.length / 2)
  const firstRow = active.slice(0, midpoint).join('; ')
  const secondRow = active.slice(midpoint).join('; ')
  return `${firstRow}\n${secondRow}`
}

export function activeEmailAddresses(addresses: readonly string[]): string[] {
  return addresses.map((address) => address.trim()).filter(Boolean)
}
