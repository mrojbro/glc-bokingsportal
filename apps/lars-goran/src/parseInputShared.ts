import type { InputColumn } from './constants'
import { normalizeHeaderName, resolveInputColumn } from './normalizeHeader'
import type { InputRow } from './types'

export interface ParseInputResult {
  rows: InputRow[]
  missingColumns: string[]
  fileLabel: string
  parseError?: string
}

export const REQUIRED_COLUMNS: InputColumn[] = [
  'Consignee',
  'Consignee city',
  'Shipment reference',
  'Weight (kg)',
]

export function buildHeaderMap(headers: string[]): Map<string, InputColumn> {
  const map = new Map<string, InputColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) {
      map.set(normalizeHeaderName(header), column)
    }
  }
  return map
}

export function findMissingInputColumns(headers: string[]): string[] {
  const found = new Set<InputColumn>()
  for (const header of headers) {
    const column = resolveInputColumn(header)
    if (column) found.add(column)
  }
  return REQUIRED_COLUMNS.filter((col) => !found.has(col))
}

export function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function findHeaderRowIndex(matrix: unknown[][]): number {
  for (let i = 0; i < Math.min(matrix.length, 80); i++) {
    const row = matrix[i] ?? []
    const keys = row.map((cell) => normalizeHeaderName(cellText(cell)).toLowerCase())
    const hasShipmentDate = keys.some((k) => k.includes('shipment date'))
    const hasConsignee = keys.some(
      (k) => k === 'consignee' || (k.startsWith('consignee') && !k.includes('city')),
    )
    const hasWeight = keys.some((k) => k.includes('weight'))
    if (hasShipmentDate && hasConsignee && hasWeight) return i
  }
  return -1
}

export function isHtmlContent(text: string): boolean {
  const trimmed = text.trimStart().slice(0, 500).toLowerCase()
  return (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('<table') ||
    trimmed.includes('tablewaybilllist')
  )
}
