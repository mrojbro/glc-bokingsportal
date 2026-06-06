export const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number]

export interface ResursRegisterEntry {
  consignee: string
  butiksnr: string
  butiksnamn: string
  ekipage: string
  typ: string
  tur: string
  littera: string
  lastningsId: string
  lastningsnamn: string
  lastningsadress: string
  lastningspostnr: string
  lastningspostort: string
  sunday: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
}
