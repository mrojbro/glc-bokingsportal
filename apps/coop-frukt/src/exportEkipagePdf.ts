import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  formatSummaryWeight,
  sortEkipageNames,
} from './utils/ekipageSummary'
import type { EkipagePdfRow } from './types/register'

const PDF_TITLE = 'Coop - Lastning Nowaste Helsingborg'

function todayIsoDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

function drawPageHeader(doc: jsPDF, margin: number, dateLabel: string): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(dateLabel, margin, margin)

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
  const dateLabel = todayIsoDate()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 14

  ekipageNames.forEach((ekipageName, index) => {
    if (index > 0) doc.addPage()

    const pageRows = groups.get(ekipageName) ?? []
    const totalWeight = pageRows.reduce((sum, row) => sum + row.weightKg, 0)
    const startY = drawPageHeader(doc, margin, dateLabel)

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
        formatSummaryWeight(row.weightKg),
      ]),
      foot: [['', '', '', '', 'Summa', formatSummaryWeight(totalWeight)]],
      styles: {
        fontSize: 8,
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
        textColor: [17, 24, 39],
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
        if (data.column.index === 5) {
          data.cell.styles.halign = 'right'
        }
      },
      showHead: 'everyPage',
      didDrawPage: () => {
        drawPageFooter(doc, index + 1, totalPages, margin)
      },
    })
  })

  doc.save(pdfExportFilename())
}
