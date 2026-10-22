import type { Lastbarartyp } from './constants'

/** Leverantör → mottagare. Edit this file to add or update entries. */
export interface LeverantorRegisterEntry {
  leverantor: string
  mottagarnamn: string
  mottagarnummer: string
  leveransplats: string
  /** Overrides default ZDRY on both Varuslag columns when set. */
  varuslag?: string
  /** Shown below a separator, apart from the main button grid. */
  separated?: boolean
  /** Vikt by lastbärartyp (EUR 250 / RLP 200 / HLV 150); TSK disabled. */
  typedVikt?: boolean
}

export const LEVERANTOR_REGISTER: LeverantorRegisterEntry[] = [
  {
    leverantor: 'Coop Eskilstuna',
    mottagarnamn: 'ESKILSTUNA DC DT/FT',
    mottagarnummer: '580001',
    leveransplats: '580001',
  },
  {
    leverantor: 'Coop Eskilstuna KYLT',
    mottagarnamn: 'ESKILSTUNA DC DT/FT',
    mottagarnummer: '580001',
    leveransplats: '580001',
    varuslag: 'ZFSH',
    separated: true,
    typedVikt: true,
  },
  {
    leverantor: 'Coop Enköping',
    mottagarnamn: 'Coop Enköping',
    mottagarnummer: '50502',
    leveransplats: '50502',
  },
  {
    leverantor: 'Coop Enköping FRYST',
    mottagarnamn: 'Coop Enköping',
    mottagarnummer: '50502',
    leveransplats: '50502',
    varuslag: 'ZFZN',
    separated: true,
    typedVikt: true,
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
  {
    leverantor: 'Orkla Kungshamn',
    mottagarnamn: 'Orkla Foods Sverige AB',
    mottagarnummer: '1004445227',
    leveransplats: '1004445227-6639',
  },
  {
    leverantor: 'Liba Bröd',
    mottagarnamn: 'Liba Bröd',
    mottagarnummer: '2051737740',
    leveransplats: '2051737740',
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

export function usesTypedVikt(leverantor: string): boolean {
  return Boolean(lookupLeverantor(leverantor)?.typedVikt)
}

export function isLastbarartypDisabled(
  leverantor: string,
  typ: Lastbarartyp,
): boolean {
  return typ === 'TSK' && usesTypedVikt(leverantor)
}

function sortLeverantorOptions(
  entries: LeverantorRegisterEntry[],
): LeverantorRegisterEntry[] {
  return [...entries].sort((a, b) =>
    a.leverantor.localeCompare(b.leverantor, 'sv', { sensitivity: 'base' }),
  )
}

/** Main grid buttons (A–Ö), excluding separated variants. */
export function getMainLeverantorRegisterOptions(): LeverantorRegisterEntry[] {
  return sortLeverantorOptions(
    LEVERANTOR_REGISTER.filter((entry) => !entry.separated),
  )
}

/** Buttons shown below the separator (A–Ö). */
export function getSeparatedLeverantorRegisterOptions(): LeverantorRegisterEntry[] {
  return sortLeverantorOptions(
    LEVERANTOR_REGISTER.filter((entry) => entry.separated),
  )
}

/** All register entries for manual row picker (A–Ö). */
export function getLeverantorRegisterOptions(): LeverantorRegisterEntry[] {
  return sortLeverantorOptions(LEVERANTOR_REGISTER)
}
