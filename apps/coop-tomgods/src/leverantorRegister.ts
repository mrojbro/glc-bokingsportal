/** Leverantör → mottagare. Edit this file to add or update entries. */
export interface LeverantorRegisterEntry {
  leverantor: string
  mottagarnamn: string
  mottagarnummer: string
  leveransplats: string
}

export const LEVERANTOR_REGISTER: LeverantorRegisterEntry[] = [
  {
    leverantor: 'Coop Eskilstuna',
    mottagarnamn: 'ESKILSTUNA DC DT/FT',
    mottagarnummer: '580001',
    leveransplats: '580001',
  },
  {
    leverantor: 'Coop Enköping',
    mottagarnamn: 'Coop Enköping',
    mottagarnummer: '50502',
    leveransplats: '50502',
  },
  {
    leverantor: 'Carlsberg Falkenberg',
    mottagarnamn: 'Carlsbergs Sverige AB',
    mottagarnummer: '1000024091',
    leveransplats: '1000024091',
  },
  {
    leverantor: 'Everfresh Helsingborg',
    mottagarnamn: 'Everfresh',
    mottagarnummer: '2003800828',
    leveransplats: '2003800828',
  },
  {
    leverantor: 'Mars Stenkullen',
    mottagarnamn: 'MARS SVERIGE AB/FRODE LAURSEN',
    mottagarnummer: '1002515112',
    leveransplats: '1002515112',
  },
  {
    leverantor: 'Estrella Angered',
    mottagarnamn: 'ESTRELLA/CO FRODE LAURSEN',
    mottagarnummer: '2003355062',
    leveransplats: '2003355062-1',
  },

]

function normalizeLeverantorKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function lookupLeverantor(
  leverantor: string,
): LeverantorRegisterEntry | undefined {
  const key = normalizeLeverantorKey(leverantor)
  if (!key) return undefined

  const exact = LEVERANTOR_REGISTER.find(
    (entry) => normalizeLeverantorKey(entry.leverantor) === key,
  )
  if (exact) return exact

  return LEVERANTOR_REGISTER.find((entry) => {
    const entryKey = normalizeLeverantorKey(entry.leverantor)
    return key.includes(entryKey) || entryKey.includes(key)
  })
}

/** All register entries for manual row picker (A–Ö). */
export function getLeverantorRegisterOptions(): LeverantorRegisterEntry[] {
  return [...LEVERANTOR_REGISTER].sort((a, b) =>
    a.leverantor.localeCompare(b.leverantor, 'sv', { sensitivity: 'base' }),
  )
}
