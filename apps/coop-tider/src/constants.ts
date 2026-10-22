export const INPUT_COLUMNS = [
  'Latest Requested Date (Unloading Location)',
  'Latest Requested Time (Unloading Location)',
  'Transportation Group',
  'Butiksnr',
  'Consignee Address',
] as const

export type InputColumn = (typeof INPUT_COLUMNS)[number]

export const DATE_COLUMN: InputColumn =
  'Latest Requested Date (Unloading Location)'
export const TIME_COLUMN: InputColumn =
  'Latest Requested Time (Unloading Location)'
export const TRANSPORT_GROUP_COLUMN: InputColumn = 'Transportation Group'

export const COLUMN_SHORT_LABELS: Record<InputColumn, string> = {
  'Latest Requested Date (Unloading Location)': 'Datum',
  'Latest Requested Time (Unloading Location)': 'Tid',
  'Transportation Group': 'Transportation Group',
  Butiksnr: 'Butiksnr',
  'Consignee Address': 'Consignee Address',
}
