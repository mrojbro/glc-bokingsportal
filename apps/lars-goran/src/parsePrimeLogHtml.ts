import type { InputRow } from './types'
import { normalizeInputRow } from './transform'
import {
  buildHeaderMap,
  cellText,
  findMissingInputColumns,
  type ParseInputResult,
} from './parseInputShared'

/** PrimeLog .xls exports are HTML; SheetJS mis-reads cells. Parse #tableWaybillList in the browser. */
export function parsePrimeLogHtml(
  html: string,
  fileLabel: string,
): ParseInputResult | null {
  if (!html.includes('tableWaybillList')) return null

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.getElementById('tableWaybillList')
  if (!table) return null

  const headerRow = table.querySelector('thead tr')
  if (!headerRow) return null

  const headerCells = headerRow.querySelectorAll('td, th')
  const headers = [...headerCells].map((cell) => cellText(cell.textContent))
  const missingColumns = findMissingInputColumns(headers)

  if (missingColumns.length > 0) {
    return {
      rows: [],
      missingColumns,
      fileLabel,
      parseError: `Saknade obligatoriska kolumner: ${missingColumns.join(', ')}. Kontrollera exporten från PrimeLog.`,
    }
  }

  const headerMap = buildHeaderMap(headers)
  const rows: InputRow[] = []

  for (const tr of table.querySelectorAll('tbody tr')) {
    const cells = [...tr.querySelectorAll('td')]
    if (cells.length === 0) continue

    const raw: Record<string, unknown> = {}
    headers.forEach((header, colIndex) => {
      if (!header) return
      raw[header] = cellText(cells[colIndex]?.textContent)
    })

    const row = normalizeInputRow(raw, headerMap)
    if (
      !cellText(row.Consignee) &&
      !cellText(row['Shipment reference']) &&
      !cellText(row['Weight (kg)'])
    ) {
      continue
    }
    rows.push(row)
  }

  return { rows, missingColumns: [], fileLabel }
}
