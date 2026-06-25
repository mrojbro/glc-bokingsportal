export interface CustomerRegisterEntry {
  mottagare: string
  adress: string
  postnr: string
  postort: string
  kundnr: string
  /** Random 5-digit id used in Fraktsedel (fakeKundnr-yyyymmdd). */
  fakeKundnr: string
}
