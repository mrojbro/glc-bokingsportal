import {

  LOAD_CARRIER_VALUE,

  QUANTITY_DIVISOR,

  REQUIRED_COLUMNS,

  OUTPUT_COLUMNS,

  TRANSPORTATION_GROUP_VALUE,

} from './constants'

import {
  applyRegisterToOutputRow,
  buildRegisterLookup,
  findRegisterEntry,
} from './register/consigneeRegister'
import {
  buildResursRegisterLookup,
  lookupLossinfo,
} from './register/resursRegister'
import { buildTidRegisterLookup, lookupTidWindow } from './register/tidRegister'
import { deliveryDateFromLastningsId } from './getDeliveryDate'
import { buildEkipageConsigneeSummary, buildEkipageSummary } from './utils/ekipageSummary'
import type {
  EkipageConsigneeCountRow,
  EkipagePdfRow,
  EkipageSummaryRow,
  RegisterEntry,
} from './types/register'
import type { ResursRegisterEntry } from './types/resursRegister'
import type { TidRegisterEntry } from './types/tidRegister'

import type { InputRow, OutputRow } from './types'



export interface TransformResult {
  rows: OutputRow[]
  unmatchedConsignees: string[]
  ekipageSummary: EkipageSummaryRow[]
  ekipageConsigneeSummary: EkipageConsigneeCountRow[]
  pdfRows: EkipagePdfRow[]
}



function emptyOutputRow(): OutputRow {

  return Object.fromEntries(

    OUTPUT_COLUMNS.map((col) => [col, '']),

  ) as OutputRow

}



function cellToString(value: string | number | undefined): string {

  if (value === undefined || value === null) return ''

  return String(value).trim()

}



function parseNumber(value: string | number | undefined): number {

  if (value === undefined || value === null || value === '') return 0

  if (typeof value === 'number') return Number.isFinite(value) ? value : 0



  let str = String(value).trim().replace(/\s/g, '')

  const dotParts = str.split('.')

  if (dotParts.length > 2) {

    str = `${dotParts[0]}.${dotParts[1]}`

  }

  str = str.replace(',', '.')



  const n = parseFloat(str)

  return Number.isFinite(n) ? n : 0

}



function formatWeight(value: number): string {

  if (value <= 0) return ''

  const rounded = Math.round(value * 1000) / 1000

  return Number.isInteger(rounded)

    ? String(rounded)

    : String(rounded).replace('.', ',')

}



/** Gross Weight ÷ 220, rounded up. */

export function quantityFromGrossWeight(grossWeight: number): number {

  if (grossWeight <= 0) return 0

  return Math.ceil(grossWeight / QUANTITY_DIVISOR)

}



function isEmptyInputRow(input: InputRow): boolean {

  return REQUIRED_COLUMNS.every((col) => !cellToString(input[col]))

}



function hasZeroWeight(input: InputRow): boolean {
  return parseNumber(input['Weight (kg)']) === 0
}

function isFoodoraRow(input: InputRow): boolean {
  return Object.values(input).some((value) =>
    cellToString(value).toLowerCase().includes('foodora'),
  )
}



function transformInputRow(

  input: InputRow,

  registerLookup: ReadonlyMap<string, RegisterEntry>,

  resursLookup: ReadonlyMap<string, ResursRegisterEntry>,

  tidLookup: ReadonlyMap<string, TidRegisterEntry>,

): {
  row: OutputRow
  matchedRegister: boolean
  ekipage: string
  grossWeightKg: number
  pdfRow: EkipagePdfRow
} {

  const row = emptyOutputRow()

  const consignee = cellToString(input.Consignee)
  row['Consigne address'] = consignee



  const grossWeight = parseNumber(input['Weight (kg)'])

  row['Gross Weight'] = formatWeight(grossWeight)

  row['Load Carrier'] = LOAD_CARRIER_VALUE

  row['Transportation Group'] = TRANSPORTATION_GROUP_VALUE



  const shipmentReference = cellToString(input['Shipment reference'])

  row['Freight Unit'] = shipmentReference

  row['Original Order'] = shipmentReference



  const registerEntry = findRegisterEntry(registerLookup, consignee)

  if (registerEntry) {
    applyRegisterToOutputRow(row, registerEntry)
  }

  row['Latest Requested Date (Unloading Location)'] =
    deliveryDateFromLastningsId(row['Lastnings-ID'])

  row.Lossinfo = lookupLossinfo(
    resursLookup,
    row['Consigne address'],
    row['Latest Requested Date (Unloading Location)'],
  )

  const { starttid, sluttid } = lookupTidWindow(
    tidLookup,
    row['Consigne address'],
    row['Latest Requested Date (Unloading Location)'],
  )
  row.Starttid = starttid
  row.Sluttid = sluttid

  if (row['Lastnings-ID'].trim().toUpperCase() === 'FHBG') {
    row.Quantity = '1'
  } else {
    const quantity = quantityFromGrossWeight(grossWeight)
    if (quantity > 0) {
      row.Quantity = String(quantity)
    }
  }

  const consigneeCity = cellToString(input['Consignee city'])

  const pdfRow: EkipagePdfRow = {
    ekipage: registerEntry?.ekipage ?? '',
    tur: registerEntry?.tur ?? '',
    shipmentReference: cellToString(input['Shipment reference']),
    consignee: registerEntry?.consignee ?? consignee,
    consigneeCity,
    weightKg: grossWeight,
  }

  if (registerEntry) {
    return {
      row,
      matchedRegister: true,
      ekipage: registerEntry.ekipage,
      grossWeightKg: grossWeight,
      pdfRow,
    }
  }

  return {
    row,
    matchedRegister: false,
    ekipage: '',
    grossWeightKg: grossWeight,
    pdfRow: {
      ...pdfRow,
      ekipage: 'Okänd ekipage',
    },
  }
}

function sortOutputRows(rows: OutputRow[]): OutputRow[] {
  return [...rows].sort((a, b) => {
    const byLastningsnamn = a.Lastningsnamn.localeCompare(b.Lastningsnamn, 'sv', {
      sensitivity: 'base',
    })
    if (byLastningsnamn !== 0) return byLastningsnamn
    return a['Consigne address'].localeCompare(b['Consigne address'], 'sv', {
      sensitivity: 'base',
    })
  })
}

/** One output row per non-empty input row. */

export function transformInputRows(

  inputs: InputRow[],

  register: readonly RegisterEntry[],

  resursRegister: readonly ResursRegisterEntry[],

  tidRegister: readonly TidRegisterEntry[],

): TransformResult {

  const lookup = buildRegisterLookup(register)
  const resursLookup = buildResursRegisterLookup(resursRegister)
  const tidLookup = buildTidRegisterLookup(tidRegister)

  const results: OutputRow[] = []
  const summaryItems: { ekipage: string; grossWeightKg: number }[] = []
  const pdfRows: EkipagePdfRow[] = []
  const unmatchedConsignees: string[] = []

  const seenUnmatched = new Set<string>()



  for (const input of inputs) {

    if (isEmptyInputRow(input)) continue
    if (hasZeroWeight(input)) continue
    if (isFoodoraRow(input)) continue



    const { row, matchedRegister, ekipage, grossWeightKg, pdfRow } =
      transformInputRow(input, lookup, resursLookup, tidLookup)

    results.push(row)
    summaryItems.push({ ekipage, grossWeightKg })
    pdfRows.push(pdfRow)



    if (!matchedRegister) {

      const consignee = cellToString(input.Consignee)

      const key = consignee.toLowerCase()

      if (consignee && !seenUnmatched.has(key)) {

        seenUnmatched.add(key)

        unmatchedConsignees.push(consignee)

      }

    }

  }



  return {
    rows: sortOutputRows(results),
    unmatchedConsignees,
    ekipageSummary: buildEkipageSummary(summaryItems),
    ekipageConsigneeSummary: buildEkipageConsigneeSummary(
      pdfRows.map((row) => ({
        ekipage: row.ekipage,
        consignee: row.consignee,
      })),
    ),
    pdfRows,
  }

}



export function createBlankOutputRow(): OutputRow {

  const row = emptyOutputRow()

  row['Load Carrier'] = LOAD_CARRIER_VALUE

  row['Transportation Group'] = TRANSPORTATION_GROUP_VALUE

  return row

}


