/** All column names from the Transport shipments export (row 3). */
export const SHEET_COLUMNS = [
  'Shipment date',
  'Consignee',
  'Consignor name',
  'Consignor city',
  'Consignee city',
  'Carrier',
  'Shipment reference',
  'Weight (kg)',
  'Volume',
  'Loading meters',
  'Pallet space count',
  'Pallet count',
  'Half pallet count',
  'Roll cages',
  'Timetable',
  'Status',
  'Latest change time',
] as const

/** Columns required for the booking transform. */
export const REQUIRED_COLUMNS = [
  'Shipment date',
  'Consignee',
  'Shipment reference',
  'Weight (kg)',
] as const

/** @deprecated Use REQUIRED_COLUMNS */
export const INPUT_COLUMNS = REQUIRED_COLUMNS

/** Gross Weight ÷ this value → Quantity (rounded up). */
export const QUANTITY_DIVISOR = 220

/** Fixed value for Load Carrier on every output row. */
export const LOAD_CARRIER_VALUE = 'EUR'

/** Fixed value for Transportation Group (SAP) on every output row. */
export const TRANSPORTATION_GROUP_VALUE = 'ZFRT'

/** Exact export column names (used in downloaded Excel). */
export const OUTPUT_COLUMNS = [
  'Latest Requested Date (Unloading Location)',
  'Freight Unit',
  'Handling Unit',
  'Original Order',
  'Quantity',
  'Load Carrier',
  'Latest Requested Time (Unloading Location)',
  'Gross Weight',
  'Transportation Group',
  'Transportation Group (Description)',
  'Butiksnr',
  'Consigne address',
  'Resurs',
  'Littera',
  'Lossinfo',
  'Lastnings-ID',
  'Lastningsnamn',
  'Lastningsadress',
  'Lastningspostnr',
  'Lastningspostort',
] as const

export type SheetColumn = (typeof SHEET_COLUMNS)[number]
export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number]
export type InputColumn = SheetColumn
export type OutputColumn = (typeof OUTPUT_COLUMNS)[number]

/** Short labels for the preview table (export keeps exact OUTPUT_COLUMNS names). */
export const OUTPUT_COLUMN_LABELS: Record<OutputColumn, string> = {
  'Latest Requested Date (Unloading Location)': 'Leveransdatum',
  'Freight Unit': 'Freight Unit',
  'Handling Unit': 'Handling Unit',
  'Original Order': 'Original Order',
  Quantity: 'Quantity',
  'Load Carrier': 'Load Carrier',
  'Latest Requested Time (Unloading Location)': 'Leveranstid',
  'Gross Weight': 'Gross Weight',
  'Transportation Group': 'SAP',
  'Transportation Group (Description)': 'Temp',
  Butiksnr: 'Butiksnr',
  'Consigne address': 'Consigne address',
  Resurs: 'Resurs',
  Littera: 'Littera',
  Lossinfo: 'Lossinfo',
  'Lastnings-ID': 'Lastnings-ID',
  Lastningsnamn: 'Lastningsnamn',
  Lastningsadress: 'Lastningsadress',
  Lastningspostnr: 'Lastningspostnr',
  Lastningspostort: 'Lastningspostort',
}
