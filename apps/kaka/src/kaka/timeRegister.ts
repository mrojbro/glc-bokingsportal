/** Lookup: Littera + Mott. Namn → Startid + Sluttid */
export interface TimeRegisterEntry {
  littera: string
  mottNamn: string
  startid: string
  sluttid: string
}

/** Imported from Namnlöst kalkylark (5).xlsx — 30 unique rows */
export const TIME_REGISTER: TimeRegisterEntry[] = [
  { littera: 'Charter', mottNamn: 'Ahlströms Konditori', startid: '06:00', sluttid: '09:00' },
  { littera: 'Charter', mottNamn: 'Alströmergymnasiet', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Bruket i Wiared AB', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'Coop Göteborg & Skaraborg Ab', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Gullkragen Ab, Kond.', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'Hemköp Nordstan', startid: '06:00', sluttid: '09:00' },
  { littera: 'Charter', mottNamn: 'Hollanders Glass', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Ica City Sparköp Knalleland Ab', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'ICA City Sparköp Knalleland AB/ Köket', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'Ica Kvantum Lerum', startid: '08:00', sluttid: '11:00' },
  { littera: 'Charter', mottNamn: 'Ica Kvantum Lerum Delikatessen', startid: '08:00', sluttid: '11:00' },
  { littera: 'Charter', mottNamn: 'Ica Maxi Alingsås', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Ica Maxi Borås', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'Ica Maxi Borås Delikatessen', startid: '13:00', sluttid: '16:00' },
  { littera: 'Charter', mottNamn: 'Lenartssons Bageri', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Lennartsson Bageri', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Ljungblads Konditori Ab', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Marieborgs Bageri', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Nolbygårds Ekobageri', startid: '11:00', sluttid: '13:00' },
  { littera: 'Charter', mottNamn: 'Studium Bageri', startid: '06:00', sluttid: '09:00' },
  { littera: 'Charter', mottNamn: 'Systrarna Fasth AB (Kaffedoppet)', startid: '08:00', sluttid: '11:00' },
  { littera: 'Charter', mottNamn: 'Trandareds Hembageri Ab', startid: '13:00', sluttid: '16:00' },
  { littera: 'Distribution', mottNamn: 'Brödfabriken i Jonsered AB', startid: '06:30', sluttid: '09:00' },
  { littera: 'Distribution', mottNamn: 'Einars Konditori Eftr. AB', startid: '06:00', sluttid: '11:00' },
  { littera: 'Distribution', mottNamn: 'Farmor Gretas Bageri', startid: '05:00', sluttid: '09:30' },
  { littera: 'Distribution', mottNamn: 'Hemköp Kinna', startid: '07:00', sluttid: '11:00' },
  { littera: 'Distribution', mottNamn: 'Hemköp Nordstan', startid: '07:00', sluttid: '09:00' },
  { littera: 'Distribution', mottNamn: 'Ica Kvantum Lerum', startid: '07:00', sluttid: '11:00' },
  { littera: 'Distribution', mottNamn: 'Ica Kvantum Lerum Delikatessen', startid: '07:00', sluttid: '11:00' },
  { littera: 'Distribution', mottNamn: 'Ica Maxi Ulricehamn', startid: '06:00', sluttid: '12:00' },
]

function registerKey(littera: string, mottNamn: string): string {
  return `${littera.trim().toLocaleLowerCase('sv')}\0${mottNamn.trim().toLocaleLowerCase('sv')}`
}

const TIME_REGISTER_MAP = new Map(
  TIME_REGISTER.map((entry) => [
    registerKey(entry.littera, entry.mottNamn),
    { startid: entry.startid, sluttid: entry.sluttid },
  ]),
)

export function lookupTimes(
  littera: string,
  mottNamn: string,
): { startid: string; sluttid: string } | undefined {
  if (!littera.trim() || !mottNamn.trim()) return undefined
  return TIME_REGISTER_MAP.get(registerKey(littera, mottNamn))
}
