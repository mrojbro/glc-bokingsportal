import { isInbaringAddress } from './inbaringRegister'
import type { OutputRow } from './types'

export const TJANST_INBARING = 'DISTTRP'
export const TJANST_UTAN_TILLAGG = 'DISTTRP UTAN TILLÄGG'

export function tjanstFromChaufforsinstruktion(
  chaufforsinstruktion: string,
): string {
  return chaufforsinstruktion.includes('INBÄRNING!')
    ? TJANST_INBARING
    : TJANST_UTAN_TILLAGG
}

export function applyTjanst(row: OutputRow): void {
  row.Tjänst = tjanstFromChaufforsinstruktion(row.Chaufförsinstruktion)
}

export function applyInbaringFields(
  row: OutputRow,
  options?: { meddelande?: string },
): void {
  const inbaring = isInbaringAddress(row['Mott. Adress'])
  row.Inbärning = inbaring ? 'true' : 'false'

  if (inbaring) {
    row.Chaufförsinstruktion = 'INBÄRNING!'
  } else if (row.Chaufförsinstruktion === 'INBÄRNING!') {
    row.Chaufförsinstruktion = options?.meddelande ?? ''
  }

  applyTjanst(row)
}
