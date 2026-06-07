import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  formatSummaryWeight,
  sortEkipageNames,
} from './utils/ekipageSummary'
import type { EkipagePdfRow } from './types/register'

const PDF_TITLE = 'Coop - Lastning Nowaste Helsingborg'
const WEIGHT_COLUMN_INDEX = 5

/** Normalize locale thousand separators so PDF padding uses consistent widths. */
function normalizePdfSpaces(text: string): string {
  return text.replace(/[\u00A0\u202F\u2009]/g, ' ')
}

/** Fixed-width weight strings so decimal commas align in the PDF table. */
function buildPdfWeightFormatter(weights: readonly number[]) {
  const formatted = weights.map((kg) =>
    normalizePdfSpaces(formatSummaryWeight(kg)),
  )
  const maxLen = Math.max(...formatted.map((s) => s.length), 0)

  return (kg: number) =>
    normalizePdfSpaces(formatSummaryWeight(kg)).padStart(maxLen, ' ')
}

function pdfGeneratedDateTime(): { date: string; time: string } {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  }
}

function pdfExportFilename(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `nowaste-helsingborg-${year}-${month}-${day}_${hours}${minutes}${seconds}.pdf`
}

function groupRowsByEkipage(
  rows: readonly EkipagePdfRow[],
): Map<string, EkipagePdfRow[]> {
  const groups = new Map<string, EkipagePdfRow[]>()

  for (const row of rows) {
    const key = row.ekipage.trim() || 'Okänd ekipage'
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  for (const [, list] of groups) {
    list.sort((a, b) => {
      const byTur = a.tur.localeCompare(b.tur, 'sv', { sensitivity: 'base' })
      if (byTur !== 0) return byTur
      return a.consignee.localeCompare(b.consignee, 'sv', { sensitivity: 'base' })
    })
  }

  return groups
}

function drawPageHeader(
  doc: jsPDF,
  margin: number,
  dateLabel: string,
  timeLabel: string,
): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(dateLabel, margin, margin)
  const dateWidth = doc.getTextWidth(dateLabel)
  doc.text(timeLabel, margin + dateWidth + 3, margin)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(PDF_TITLE, margin, margin + 7)

  doc.setDrawColor(180)
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.line(margin, margin + 11, pageWidth - margin, margin + 11)

  return margin + 18
}

function drawPageFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  margin: number,
): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `Sida ${pageNumber} av ${totalPages}`,
    pageWidth / 2,
    pageHeight - margin / 2,
    { align: 'center' },
  )
}

/** One portrait page per ekipage with shipment table and weight summary. */
export function downloadEkipagePdf(rows: readonly EkipagePdfRow[]): void {
  if (rows.length === 0) return

  const groups = groupRowsByEkipage(rows)
  const ekipageNames = sortEkipageNames([...groups.keys()])
  const totalPages = ekipageNames.length
  const { date: dateLabel, time: timeLabel } = pdfGeneratedDateTime()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 14

  ekipageNames.forEach((ekipageName, index) => {
    if (index > 0) doc.addPage()

    const pageRows = groups.get(ekipageName) ?? []
    const totalWeight = pageRows.reduce((sum, row) => sum + row.weightKg, 0)
    const formatPdfWeight = buildPdfWeightFormatter([
      ...pageRows.map((row) => row.weightKg),
      totalWeight,
    ])
    const startY = drawPageHeader(doc, margin, dateLabel, timeLabel)

    autoTable(doc, {
      startY,
      margin: { left: margin, right: margin, bottom: margin + 6 },
      head: [
        [
          'Ekipage',
          'Tur',
          'Shipment',
          'Consignee',
          'Consignee City',
          'Weight (kg)',
        ],
      ],
      body: pageRows.map((row) => [
        row.ekipage,
        row.tur,
        row.shipmentReference,
        row.consignee,
        row.consigneeCity,
        formatPdfWeight(row.weightKg),
      ]),
      foot: [['', '', '', '', 'Summa', formatPdfWeight(totalWeight)]],
      styles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        cellPadding: { top: 0.8, right: 1.5, bottom: 0.8, left: 1.5 },
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: 255,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [229, 231, 235],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 24 },
        2: { cellWidth: 26 },
        5: { halign: 'right' },
      },
      didParseCell(data) {
        if (data.column.index !== WEIGHT_COLUMN_INDEX) return

        data.cell.styles.halign = 'right'

        if (data.section === 'head') {
          data.cell.styles.font = 'helvetica'
          data.cell.styles.textColor = 255
          return
        }

        data.cell.styles.font = 'courier'
        data.cell.styles.textColor = [0, 0, 0]
      },
      showHead: 'everyPage',
      didDrawPage: () => {
        drawPageFooter(doc, index + 1, totalPages, margin)
      },
    })
  })

  doc.save(pdfExportFilename())
}
