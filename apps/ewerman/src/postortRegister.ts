/** Lookup: Mott. Postort → Startid, Sluttid, Chaufförsinstruktion */
export interface PostortRegisterEntry {
  postort: string
  startid: string
  sluttid: string
  chaufforsinstruktion: string
}

export interface PostortTimes {
  startid: string
  sluttid: string
  chaufforsinstruktion: string
}

export const DEFAULT_POSTORT_TIMES: PostortTimes = {
  startid: '06:00',
  sluttid: '10:00',
  chaufforsinstruktion: 'Leverans senast 10:00',
}

export const POSTORT_REGISTER: PostortRegisterEntry[] = [
  {
    postort: 'Gråbo',
    startid: '06:00',
    sluttid: '09:00',
    chaufforsinstruktion: 'Leverans senast 09:00',
  },
  {
    postort: 'Kungsbacka',
    startid: '06:00',
    sluttid: '11:00',
    chaufforsinstruktion: 'Leverans senast 11:00',
  },
  {
    postort: 'Strömstad',
    startid: '06:00',
    sluttid: '11:30',
    chaufforsinstruktion: 'Leverans senast 11:30',
  },
  {
    postort: 'Alingsås',
    startid: '06:00',
    sluttid: '12:00',
    chaufforsinstruktion: 'Leverans senast 12:00',
  },
]

function postortKey(postort: string): string {
  return postort.trim().toLocaleLowerCase('sv')
}

const POSTORT_REGISTER_MAP = new Map<string, PostortTimes>(
  POSTORT_REGISTER.map((entry) => [
    postortKey(entry.postort),
    {
      startid: entry.startid,
      sluttid: entry.sluttid,
      chaufforsinstruktion: entry.chaufforsinstruktion,
    },
  ]),
)

export function lookupPostortTimes(mottPostort: string): PostortTimes {
  if (!mottPostort.trim()) return DEFAULT_POSTORT_TIMES
  return POSTORT_REGISTER_MAP.get(postortKey(mottPostort)) ?? DEFAULT_POSTORT_TIMES
}

export function applyPostortTimes(row: {
  'Mott. Postort': string
  Startid: string
  Sluttid: string
  Chaufförsinstruktion: string
}): void {
  const times = lookupPostortTimes(row['Mott. Postort'])
  row.Startid = times.startid
  row.Sluttid = times.sluttid
  row.Chaufförsinstruktion = times.chaufforsinstruktion
}
