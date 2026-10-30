export type JsonTokenType =
  | 'space'
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'punct'

export interface JsonToken {
  type: JsonTokenType
  value: string
}

const SPACE = new Set([' ', '\n', '\r', '\t'])

function isWordEnd(text: string, index: number): boolean {
  const ch = text[index]
  if (ch === undefined) return true
  return !/[A-Za-z0-9_]/.test(ch)
}

/** Split formatted JSON into tokens for syntax coloring. */
export function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let i = 0
  const n = text.length

  while (i < n) {
    const ch = text[i]!

    if (SPACE.has(ch)) {
      const start = i
      i += 1
      while (i < n && SPACE.has(text[i]!)) i += 1
      tokens.push({ type: 'space', value: text.slice(start, i) })
      continue
    }

    if (ch === '"') {
      const start = i
      i += 1
      while (i < n) {
        if (text[i] === '\\') {
          i += 2
          continue
        }
        if (text[i] === '"') {
          i += 1
          break
        }
        i += 1
      }
      const value = text.slice(start, i)
      let look = i
      while (look < n && SPACE.has(text[look]!)) look += 1
      tokens.push({ type: text[look] === ':' ? 'key' : 'string', value })
      continue
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const start = i
      if (text[i] === '-') i += 1
      while (i < n && text[i]! >= '0' && text[i]! <= '9') i += 1
      if (text[i] === '.') {
        i += 1
        while (i < n && text[i]! >= '0' && text[i]! <= '9') i += 1
      }
      if (text[i] === 'e' || text[i] === 'E') {
        i += 1
        if (text[i] === '+' || text[i] === '-') i += 1
        while (i < n && text[i]! >= '0' && text[i]! <= '9') i += 1
      }
      tokens.push({ type: 'number', value: text.slice(start, i) })
      continue
    }

    if (text.startsWith('true', i) && isWordEnd(text, i + 4)) {
      tokens.push({ type: 'boolean', value: 'true' })
      i += 4
      continue
    }
    if (text.startsWith('false', i) && isWordEnd(text, i + 5)) {
      tokens.push({ type: 'boolean', value: 'false' })
      i += 5
      continue
    }
    if (text.startsWith('null', i) && isWordEnd(text, i + 4)) {
      tokens.push({ type: 'null', value: 'null' })
      i += 4
      continue
    }

    tokens.push({ type: 'punct', value: ch })
    i += 1
  }

  return tokens
}
