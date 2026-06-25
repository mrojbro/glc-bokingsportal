import type { Lastbarartyp } from './constants'

export interface LeverantorPreset {
  leverantor: string
  antalLastbarare: number
  lastbarartyp: Lastbarartyp
  antalPpl: number
}

/** Fördefinerade värden per leverantör (visas i dialogen). */
export const LEVERANTOR_PRESETS: LeverantorPreset[] = [
  {
    leverantor: 'Carlsberg Falkenberg',
    antalLastbarare: 864,
    lastbarartyp: 'EUR',
    antalPpl: 48,
  },
  {
    leverantor: 'Everfresh Helsingborg',
    antalLastbarare: 864,
    lastbarartyp: 'EUR',
    antalPpl: 48,
  },
  {
    leverantor: 'Everfresh Helsingborg',
    antalLastbarare: 540,
    lastbarartyp: 'EUR',
    antalPpl: 30,
  },
  {
    leverantor: 'Everfresh Helsingborg',
    antalLastbarare: 220,
    lastbarartyp: 'RLP',
    antalPpl: 18,
  },
  {
    leverantor: 'Coop Enköping',
    antalLastbarare: 220,
    lastbarartyp: 'RLP',
    antalPpl: 18,
  },
  {
    leverantor: 'Mars Stenkullen',
    antalLastbarare: 510,
    lastbarartyp: 'EUR',
    antalPpl: 30,
  },
  {
    leverantor: 'Estrella Angered',
    antalLastbarare: 510,
    lastbarartyp: 'EUR',
    antalPpl: 30,
  },
]

function normalizeLeverantorKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getPresetsForLeverantor(leverantor: string): LeverantorPreset[] {
  const key = normalizeLeverantorKey(leverantor)
  if (!key) return []

  return LEVERANTOR_PRESETS.filter(
    (preset) => normalizeLeverantorKey(preset.leverantor) === key,
  )
}

export function formatPresetLabel(preset: LeverantorPreset): string {
  return `${preset.antalLastbarare} · ${preset.lastbarartyp} · ${preset.antalPpl} PPL`
}
