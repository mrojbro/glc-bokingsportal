import { isInbaringAddress } from './inbaringRegister'
import type { OutputRow } from './types'

export function applyInbaringFields(
  row: OutputRow,
  options?: { meddelande?: string },
): void {
  const inbaring = isInbaringAddress(row['Mott. Adress'])
  row.Inbärning = inbaring ? 'true' : 'false'

  if (inbaring) {
    row.Chaufförsinstruktion = 'INBÄRNING!'
    return
  }

  if (row.Chaufförsinstruktion === 'INBÄRNING!') {
    row.Chaufförsinstruktion = options?.meddelande ?? ''
  }
}
