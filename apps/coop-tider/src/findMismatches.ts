import {
  DATE_COLUMN,
  INPUT_COLUMNS,
  TIME_COLUMN,
  TRANSPORT_GROUP_COLUMN,
  type InputColumn,
} from './constants'
import { normalizeCompareValue } from './normalizeValues'
import type { InputRow } from './types'

export interface TimeCount {
  time: string
  count: number
}

export interface MismatchGroup {
  key: string
  butiksnr: string
  address: string
  date: string
  transportationGroup: string
  rowCount: number
  times: TimeCount[]
}

function isEmptyRow(row: InputRow): boolean {
  return INPUT_COLUMNS.every((col) => !row[col].trim())
}

function firstValue(rows: InputRow[], column: InputColumn): string {
  return rows.find((row) => row[column].trim())?.[column].trim() ?? ''
}

function storeKey(row: InputRow): string {
  const butiksnr = normalizeCompareValue('Butiksnr', row.Butiksnr)
  if (butiksnr) return `nr:${butiksnr}`
  const address = normalizeCompareValue(
    'Consignee Address',
    row['Consignee Address'],
  )
  if (address) return `addr:${address}`
  return `row:${row.sourceIndex}`
}

/** Same store, date and transportation group must share one unloading time. */
function groupKey(row: InputRow): string {
  const date = normalizeCompareValue(DATE_COLUMN, row[DATE_COLUMN])
  const group = normalizeCompareValue(
    TRANSPORT_GROUP_COLUMN,
    row[TRANSPORT_GROUP_COLUMN],
  )
  return `${storeKey(row)}|${date}|${group}`
}

function summarizeTimes(rows: InputRow[]): TimeCount[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const time =
      normalizeCompareValue(TIME_COLUMN, row[TIME_COLUMN]) ||
      row[TIME_COLUMN].trim() ||
      '—'
    counts.set(time, (counts.get(time) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time, 'sv'))
}

export function countStoreGroups(rows: InputRow[]): number {
  const keys = new Set<string>()
  for (const row of rows) {
    if (isEmptyRow(row)) continue
    keys.add(storeKey(row))
  }
  return keys.size
}

export function findMismatchGroups(rows: InputRow[]): MismatchGroup[] {
  const buckets = new Map<string, InputRow[]>()

  for (const row of rows) {
    if (isEmptyRow(row)) continue
    const key = groupKey(row)
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }

  const groups: MismatchGroup[] = []
  for (const [key, groupRows] of buckets) {
    if (groupRows.length < 2) continue
    const times = summarizeTimes(groupRows)
    if (times.length < 2) continue

    const dateRaw = firstValue(groupRows, DATE_COLUMN)
    groups.push({
      key,
      butiksnr: firstValue(groupRows, 'Butiksnr'),
      address: firstValue(groupRows, 'Consignee Address'),
      date: normalizeCompareValue(DATE_COLUMN, dateRaw) || dateRaw,
      transportationGroup: firstValue(groupRows, TRANSPORT_GROUP_COLUMN),
      rowCount: groupRows.length,
      times,
    })
  }

  return groups.sort((a, b) => {
    const store = (a.butiksnr || a.address).localeCompare(
      b.butiksnr || b.address,
      'sv',
      { sensitivity: 'base' },
    )
    if (store !== 0) return store
    return a.transportationGroup.localeCompare(b.transportationGroup, 'sv', {
      sensitivity: 'base',
    })
  })
}
