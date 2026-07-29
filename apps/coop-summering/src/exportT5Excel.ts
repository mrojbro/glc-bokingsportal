import ExcelJS from 'exceljs'
import {
  BLACK_FONT,
  FRAKTSEDEL_DATE_MISMATCH_FILL,
  GODSSLAG_FILLS,
  RESURS_COLUMN_FILL,
  T5_COLUMNS,
  T5_HEADER_FILL,
  T5_HEADER_FONT,
  TS_ROW_FILL,
  type T5Row,
} from './t5Constants'

function exportTimestamp(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

function normalizeGodsslag(value: string): string {
  return value.trim().toLocaleLowerCase('sv')
}

function godsslagFill(value: string): string | undefined {
  const key = normalizeGodsslag(value)
  for (const [label, fill] of Object.entries(GODSSLAG_FILLS)) {
    if (normalizeGodsslag(label) === key) return fill
  }
  return undefined
}

function mottNamnHasTs(value: string): boolean {
  return value.toLocaleLowerCase('sv').includes('(ts)')
}

/**
 * Light-orange flags for Fraktsedelnummer:
 * - 10-digit number (e.g. 1234567890)
 * - or ######-YYYYMMDD where that date ≠ Transportdag (dashes stripped)
 */
function fraktsedelNeedsOrangeHighlight(
  fraktsedelnummer: string,
  transportdag: string,
): boolean {
  const text = fraktsedelnummer.trim()
  if (/^\d{10}$/.test(text)) return true

  const match = text.match(/^(\d{6})-(\d{8})/)
  if (!match) return false

  const fraktDate = match[2]
  const transportCompact = formatTransportdag(transportdag).replace(/-/g, '')
  if (!/^\d{8}$/.test(transportCompact)) return false

  return fraktDate !== transportCompact
}

function solidFill(rgb: string): ExcelJS.Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: `FF${rgb}` },
  }
}

const EXPORT_FONT_NAME = 'Segoe UI'
const EXPORT_FONT_SIZE = 9

function applyCellStyle(
  cell: ExcelJS.Cell,
  options: {
    fill?: string
    fontColor?: string
    bold?: boolean
    horizontal?: ExcelJS.Alignment['horizontal']
  },
): void {
  if (options.fill) {
    cell.fill = solidFill(options.fill)
  }
  cell.font = {
    name: EXPORT_FONT_NAME,
    size: EXPORT_FONT_SIZE,
    color: { argb: `FF${options.fontColor ?? BLACK_FONT}` },
    bold: options.bold ?? false,
  }
  cell.alignment = {
    vertical: 'middle',
    horizontal: options.horizontal ?? 'left',
  }
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
    left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
    bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
    right: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  }
}

/** Strip time from timestamps; keep date only (yyyy-mm-dd when possible). */
function formatTransportdag(value: string): string {
  const text = value.trim()
  if (!text) return ''

  // Excel serial date (e.g. 45868 or 45868.5)
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text)
    if (Number.isFinite(serial) && serial > 20000 && serial < 100000) {
      const utc = Math.round((serial - 25569) * 86400 * 1000)
      const date = new Date(utc)
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10)
      }
    }
  }

  // ISO / Excel-like: 2026-07-30T14:30:00 or 2026-07-30 14:30:00
  const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})(?:[ T].*)?$/)
  if (isoMatch) return isoMatch[1]

  // DD/MM/YYYY or DD.MM.YYYY with optional time
  const dmyMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:\s+.*)?$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    return `${year}-${month}-${day}`
  }

  // Fallback: take text before first space/T if it looks like a date prefix
  const beforeTime = text.split(/[ T]/)[0] ?? text
  return beforeTime
}

/** Real Excel number so SUM/filters work. Swedish Excel shows comma via locale. */
function formatVikt(value: string): number | '' {
  const text = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!text) return ''
  const n = Number(text)
  if (!Number.isFinite(n)) return ''
  return Math.round(n * 100) / 100
}

/** Integer Excel number (no decimals). */
function formatResurs(value: string): number | '' {
  const text = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!text) return ''
  const n = Number(text)
  if (!Number.isFinite(n)) return ''
  return Math.round(n)
}

function formatExportCell(
  column: (typeof T5_COLUMNS)[number],
  value: string,
): string | number {
  if (column === 'Transportdag') {
    return formatTransportdag(value)
  }
  if (column === 'Vikt') {
    return formatVikt(value)
  }
  if (column === 'Resurs') {
    return formatResurs(value)
  }
  return value.trim().toLocaleUpperCase('sv')
}

function cellDisplayLength(value: ExcelJS.CellValue, column?: string): number {
  if (value == null) return 0
  if (typeof value === 'number') {
    if (column === 'Resurs') return String(Math.round(value)).length
    return value.toLocaleString('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).length
  }
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? '').join('').length
    }
    return 0
  }
  return String(value).length
}

/** Bold the leading 6 digits in Fraktsedelnummer when present (not for pure 10-digit values). */
function boldFraktsedelnummerPrefix(cell: ExcelJS.Cell): void {
  if (typeof cell.value !== 'string') return
  const text = cell.value
  if (/^\d{10}$/.test(text)) return

  const match = text.match(/^(\d{6})([\s\S]*)$/)
  if (!match) return

  const baseFont = {
    name: EXPORT_FONT_NAME,
    size: EXPORT_FONT_SIZE,
    color: { argb: `FF${BLACK_FONT}` },
  }
  const richText: ExcelJS.RichText[] = [
    { text: match[1], font: { ...baseFont, bold: true } },
  ]
  if (match[2]) {
    richText.push({ text: match[2], font: { ...baseFont, bold: false } })
  }
  cell.value = { richText }
}

function autoFitColumns(sheet: ExcelJS.Worksheet): void {
  sheet.columns.forEach((column, index) => {
    if (!column?.eachCell) return
    const colName = T5_COLUMNS[index]
    let maxLength = colName?.length ?? 8
    column.eachCell({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, cellDisplayLength(cell.value, colName))
    })
    // Segoe UI 9pt — slight padding; cap very wide name columns.
    column.width = Math.min(Math.max(maxLength + 2, 8), 60)
  })
}

function parseResursNumber(value: string): number {
  const text = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!text) return Number.POSITIVE_INFINITY
  const n = Number(text)
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
}

function sortT5Rows(rows: T5Row[]): T5Row[] {
  return [...rows].sort((a, b) => {
    const byResurs = parseResursNumber(a.Resurs ?? '') - parseResursNumber(b.Resurs ?? '')
    if (byResurs !== 0) return byResurs

    const byOrt = (a['Mott. Ort'] ?? '').localeCompare(b['Mott. Ort'] ?? '', 'sv', {
      sensitivity: 'base',
    })
    if (byOrt !== 0) return byOrt

    return (a['Mott. Namn'] ?? '').localeCompare(b['Mott. Namn'] ?? '', 'sv', {
      sensitivity: 'base',
    })
  })
}

export async function downloadT5Excel(
  rows: T5Row[],
  fileName?: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'GLC Bokingsportal'
  const sheet = workbook.addWorksheet('T5 Coop', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = T5_COLUMNS.map((col) => ({
    header: col,
    key: col,
    width: Math.max(12, col.length + 2),
  }))

  const headerRow = sheet.getRow(1)
  headerRow.height = 20
  headerRow.eachCell((cell) => {
    applyCellStyle(cell, {
      fill: T5_HEADER_FILL,
      fontColor: T5_HEADER_FONT,
      bold: true,
    })
  })

  for (const row of sortT5Rows(rows)) {
    const values = T5_COLUMNS.map((col) => formatExportCell(col, row[col] ?? ''))
    const excelRow = sheet.addRow(values)
    const isTs = mottNamnHasTs(row['Mott. Namn'] ?? '')
    const isFraktsedelOrange = fraktsedelNeedsOrangeHighlight(
      row.Fraktsedelnummer ?? '',
      row.Transportdag ?? '',
    )
    // (TS) yellow wins over fraktsedel orange (date mismatch / 10-digit).
    const rowFill = isTs
      ? TS_ROW_FILL
      : isFraktsedelOrange
        ? FRAKTSEDEL_DATE_MISMATCH_FILL
        : undefined
    const godsslagColor = godsslagFill(row.Godsslag ?? '')

    excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const column = T5_COLUMNS[colNumber - 1]
      if (!column) return

      if (column === 'Vikt') {
        if (typeof cell.value === 'number') {
          // Decimal placeholder is always "." in Excel format codes;
          // Swedish Excel displays it as "0,00".
          cell.numFmt = '0.00'
        }
        applyCellStyle(cell, {
          fill: rowFill,
          fontColor: BLACK_FONT,
          horizontal: 'right',
        })
        return
      }

      if (column === 'Godsslag') {
        applyCellStyle(cell, {
          fill: godsslagColor,
          fontColor: BLACK_FONT,
        })
        return
      }

      if (column === 'Resurs') {
        if (typeof cell.value === 'number') {
          cell.numFmt = '0'
        }
        applyCellStyle(cell, {
          fill: RESURS_COLUMN_FILL,
          fontColor: BLACK_FONT,
          horizontal: 'left',
        })
        return
      }

      if (column === 'Fraktsedelnummer') {
        applyCellStyle(cell, {
          fill: rowFill,
          fontColor: BLACK_FONT,
        })
        boldFraktsedelnummerPrefix(cell)
        return
      }

      if (rowFill) {
        applyCellStyle(cell, { fill: rowFill, fontColor: BLACK_FONT })
        return
      }

      applyCellStyle(cell, { fontColor: BLACK_FONT })
    })
  }

  autoFitColumns(sheet)

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(sheet.rowCount, 1), column: T5_COLUMNS.length },
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName ?? `Coop_${exportTimestamp()}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}
