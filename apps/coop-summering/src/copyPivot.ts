import type { PivotSummary } from './types'
import { formatQuantity } from './computePivot'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** HTML table styled for pasting into Outlook as a real table. */
export function pivotToOutlookHtml(summary: PivotSummary): string {
  const th =
    'border:1px solid #bfbfbf;padding:6px 10px;background:#f2f2f2;text-align:left;font-weight:600;'
  const thRight =
    'border:1px solid #bfbfbf;padding:6px 10px;background:#f2f2f2;text-align:right;font-weight:600;'
  const td = 'border:1px solid #bfbfbf;padding:6px 10px;'
  const tdRight = 'border:1px solid #bfbfbf;padding:6px 10px;text-align:right;'
  const tdRightBold =
    'border:1px solid #bfbfbf;padding:6px 10px;text-align:right;font-weight:600;'
  const footer =
    'border:1px solid #bfbfbf;padding:6px 10px;background:#f2f2f2;font-weight:600;'
  const footerRight =
    'border:1px solid #bfbfbf;padding:6px 10px;background:#f2f2f2;text-align:right;font-weight:600;'

  const headerCells = [
    `<th style="${th}">Temp</th>`,
    ...summary.columnLabels.map(
      (label) => `<th style="${thRight}">${escapeHtml(label)}</th>`,
    ),
    `<th style="${thRight}">Totalt</th>`,
  ]

  const bodyRows = summary.rowLabels.map((rowLabel) => {
    const cells = summary.columnLabels.map((colLabel) => {
      const value = summary.values[rowLabel]?.[colLabel] ?? 0
      return `<td style="${tdRight}">${escapeHtml(formatQuantity(value))}</td>`
    })
    return (
      `<tr>` +
      `<td style="${td}">${escapeHtml(rowLabel)}</td>` +
      cells.join('') +
      `<td style="${tdRightBold}">${escapeHtml(formatQuantity(summary.rowTotals[rowLabel] ?? 0))}</td>` +
      `</tr>`
    )
  })

  const footerCells = [
    `<td style="${footer}">Totalt</td>`,
    ...summary.columnLabels.map(
      (colLabel) =>
        `<td style="${footerRight}">${escapeHtml(formatQuantity(summary.columnTotals[colLabel] ?? 0))}</td>`,
    ),
    `<td style="${footerRight}">${escapeHtml(formatQuantity(summary.grandTotal))}</td>`,
  ]

  return (
    `<table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#111111;">` +
    `<thead><tr>${headerCells.join('')}</tr></thead>` +
    `<tbody>${bodyRows.join('')}</tbody>` +
    `<tfoot><tr>${footerCells.join('')}</tr></tfoot>` +
    `</table>`
  )
}

/** Tab-separated plain text fallback for clipboard. */
export function pivotToPlainText(summary: PivotSummary): string {
  const header = [
    'Temp',
    ...summary.columnLabels,
    'Totalt',
  ]
  const lines = [header.join('\t')]

  for (const rowLabel of summary.rowLabels) {
    const cells = [
      rowLabel,
      ...summary.columnLabels.map((colLabel) =>
        formatQuantity(summary.values[rowLabel]?.[colLabel] ?? 0),
      ),
      formatQuantity(summary.rowTotals[rowLabel] ?? 0),
    ]
    lines.push(cells.join('\t'))
  }

  lines.push(
    [
      'Totalt',
      ...summary.columnLabels.map((colLabel) =>
        formatQuantity(summary.columnTotals[colLabel] ?? 0),
      ),
      formatQuantity(summary.grandTotal),
    ].join('\t'),
  )

  return lines.join('\r\n')
}

export async function copyPivotForOutlook(summary: PivotSummary): Promise<void> {
  const html = pivotToOutlookHtml(summary)
  const plain = pivotToPlainText(summary)

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      }),
    ])
    return
  }

  await navigator.clipboard.writeText(plain)
}
