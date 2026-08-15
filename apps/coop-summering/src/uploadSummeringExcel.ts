import ExcelJS from 'exceljs'
import {
  COLUMN_FIELD,
  INPUT_COLUMNS,
  ROW_FIELD,
  VALUE_FIELD,
  type InputColumn,
} from './constants'
import { parseInputText } from './parseInput'

function normalizeHeader(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const HEADER_ALIASES: Record<string, InputColumn> = Object.fromEntries(
  INPUT_COLUMNS.flatMap((col) => {
    const aliases = [col, col.replace(/[\[\]]/g, '')]
    return aliases.map((alias) => [normalizeHeader(alias), col] as const)
  }),
)

function cellToText(cell: ExcelJS.Cell): string {
  const value = cell.value
  if (value == null || value === '') return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'object') {
    if ('result' in value && value.result != null) {
      return String(value.result).trim()
    }
    if ('text' in value && value.text != null) {
      return String(value.text).trim()
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? '').join('').trim()
    }
  }
  return String(value).trim()
}

function findHeaderRowIndex(matrix: string[][]): number {
  for (let i = 0; i < Math.min(matrix.length, 40); i++) {
    const row = matrix[i] ?? []
    const mapped = row
      .map((cell) => HEADER_ALIASES[normalizeHeader(cell)])
      .filter(Boolean)
    if (
      mapped.includes(ROW_FIELD) &&
      mapped.includes(COLUMN_FIELD) &&
      mapped.includes(VALUE_FIELD)
    ) {
      return i
    }
  }
  return -1
}

function sheetToMatrix(sheet: ExcelJS.Worksheet): string[][] {
  const matrix: string[][] = []

  sheet.eachRow({ includeEmpty: true }, (row) => {
    const cells: string[] = []
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      while (cells.length < colNumber - 1) cells.push('')
      cells[colNumber - 1] = cellToText(cell)
    })
    if (cells.some((cell) => cell !== '')) {
      matrix.push(cells)
    }
  })

  return matrix
}

function matrixToTsv(matrix: string[][]): string {
  return matrix.map((row) => row.join('\t')).join('\n')
}

function pickBestSheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet | null {
  let best: ExcelJS.Worksheet | null = null
  let bestScore = -1

  for (const sheet of workbook.worksheets) {
    const matrix = sheetToMatrix(sheet)
    const headerIndex = findHeaderRowIndex(matrix)
    if (headerIndex < 0) continue
    const score = matrix.length - headerIndex
    if (score > bestScore) {
      best = sheet
      bestScore = score
    }
  }

  return best ?? workbook.worksheets[0] ?? null
}

export type SummeringPasteTarget =
  | 'coop-eskilstuna-enkoping'
  | 'nowaste-helsingborg'

function normalizeDescription(description: string): string {
  return description
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLocaleLowerCase('sv')
    .replace(/\s+/g, ' ')
}

const ESKILSTUNA_HINTS = ['dry', 'fresh/chilled', 'frozen']
const NOWASTE_HINTS = [
  'fruits (direkt)',
  'fruits (glc)',
  'fruits (flytten)',
]

/** Guess which paste box a file belongs to from Description values. */
export function detectPasteTarget(tsv: string): SummeringPasteTarget | null {
  const parsed = parseInputText(tsv)
  if (parsed.parseError || parsed.rows.length === 0) return null

  let eskilstuna = 0
  let nowaste = 0
  for (const row of parsed.rows) {
    const key = normalizeDescription(row[ROW_FIELD] ?? '')
    if (ESKILSTUNA_HINTS.includes(key)) eskilstuna += 1
    if (NOWASTE_HINTS.includes(key)) nowaste += 1
  }

  if (eskilstuna === 0 && nowaste === 0) return null
  return eskilstuna >= nowaste
    ? 'coop-eskilstuna-enkoping'
    : 'nowaste-helsingborg'
}

export async function readSummeringExcelFile(
  file: File,
): Promise<{ tsv: string; parseError?: string }> {
  try {
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const sheet = pickBestSheet(workbook)
    if (!sheet) {
      return { tsv: '', parseError: `${file.name}: ingen arbetsbok/blad hittades.` }
    }

    const matrix = sheetToMatrix(sheet)
    if (matrix.length === 0) {
      return { tsv: '', parseError: `${file.name}: filen är tom.` }
    }

    if (findHeaderRowIndex(matrix) < 0) {
      return {
        tsv: '',
        parseError: `${file.name}: kunde inte hitta rubrikraden (behöver Description, Load Carrier, Quantity).`,
      }
    }

    return { tsv: matrixToTsv(matrix) }
  } catch {
    return {
      tsv: '',
      parseError: `${file.name}: kunde inte läsas som Excel (.xlsx).`,
    }
  }
}

export interface UploadSummeringResult {
  pastes: Partial<Record<SummeringPasteTarget, string>>
  errors: string[]
  fileCount: number
  assignedCount: number
}

/**
 * Read one or more Excel files and map them into the two pivot paste sources.
 * Multiple files for the same source are concatenated (header kept once).
 */
export async function uploadSummeringExcelFiles(
  files: File[],
): Promise<UploadSummeringResult> {
  const buckets: Record<SummeringPasteTarget, string[]> = {
    'coop-eskilstuna-enkoping': [],
    'nowaste-helsingborg': [],
  }
  const errors: string[] = []
  let assignedCount = 0

  for (const file of files) {
    const { tsv, parseError } = await readSummeringExcelFile(file)
    if (parseError) {
      errors.push(parseError)
      continue
    }
    if (!tsv.trim()) {
      errors.push(`${file.name}: ingen data.`)
      continue
    }

    const target = detectPasteTarget(tsv)
    if (!target) {
      errors.push(
        `${file.name}: kunde inte avgöra källa (behöver Dry/Fresh/Chilled/Frozen eller Fruits …).`,
      )
      continue
    }

    buckets[target].push(tsv)
    assignedCount += 1
  }

  const pastes: Partial<Record<SummeringPasteTarget, string>> = {}
  for (const target of Object.keys(buckets) as SummeringPasteTarget[]) {
    const parts = buckets[target]
    if (parts.length === 0) continue
    if (parts.length === 1) {
      pastes[target] = parts[0]
      continue
    }
    // Keep header from first file; append data rows from the rest
    const [first, ...rest] = parts
    const firstLines = first.split('\n')
    const header = firstLines[0] ?? ''
    const body = [
      ...firstLines.slice(1),
      ...rest.flatMap((part) => part.split('\n').slice(1)),
    ].filter((line) => line.trim())
    pastes[target] = [header, ...body].join('\n')
  }

  return {
    pastes,
    errors,
    fileCount: files.length,
    assignedCount,
  }
}
