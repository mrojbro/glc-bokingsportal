import * as XLSX from 'xlsx'
import {
  normalizePostnr,
  type PostnrRegisterEntry,
} from './postnrRegister'

const POSTNR_HEADERS = ['postnr', 'postnummer', 'mott. postnr']
const INSTRUCTION_HEADERS = [
  'sorteringskod v1',
  'sorteringskod',
  'transportinstruktion',
  'chaufförsinstruktion',
]

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function headerKey(header: string): string {
  return header.replace(/\u00a0/g, ' ').trim().toLowerCase()
}

function findHeader(
  headers: string[],
  candidates: string[],
): string | undefined {
  const wanted = new Set(candidates)
  return headers.find((header) => wanted.has(headerKey(header)))
}

export function parseRegisterMatrix(matrix: unknown[][]): PostnrRegisterEntry[] {
  if (matrix.length === 0) return []

  let headerIndex = 0
  let bestScore = -1
  const scan = Math.min(matrix.length, 20)
  for (let i = 0; i < scan; i++) {
    const headers = (matrix[i] ?? []).map((cell) => headerKey(cellText(cell)))
    const score =
      (headers.some((header) => POSTNR_HEADERS.includes(header)) ? 2 : 0) +
      (headers.some((header) => INSTRUCTION_HEADERS.includes(header)) ? 2 : 0)
    if (score > bestScore) {
      bestScore = score
      headerIndex = i
    }
    if (score >= 4) break
  }

  const headerRow = (matrix[headerIndex] ?? []).map((cell) => cellText(cell))
  const postnrHeader = findHeader(headerRow, POSTNR_HEADERS)
  const instructionHeader = findHeader(headerRow, INSTRUCTION_HEADERS)
  if (!postnrHeader || !instructionHeader) return []

  const postnrIndex = headerRow.findIndex(
    (header) => headerKey(header) === headerKey(postnrHeader),
  )
  const instructionIndex = headerRow.findIndex(
    (header) => headerKey(header) === headerKey(instructionHeader),
  )

  const entries: PostnrRegisterEntry[] = []
  const seen = new Set<string>()

  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const line = matrix[r] ?? []
    const postnr = normalizePostnr(cellText(line[postnrIndex]))
    if (!postnr || seen.has(postnr)) continue
    seen.add(postnr)
    entries.push({
      postnr,
      transportinstruktion: cellText(line[instructionIndex]),
    })
  }

  return entries
}

export async function parseRegisterFile(file: File): Promise<PostnrRegisterEntry[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', raw: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? '']
  if (!sheet) return []

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  })

  return parseRegisterMatrix(matrix)
}
