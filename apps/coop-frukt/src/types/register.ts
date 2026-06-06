export interface RegisterEntry {
  consignee: string
  butiksnr: string
  butiksnamn: string
  ekipage: string
  tur: string
  littera: string
  lastningsId: string
  lastningsnamn: string
  lastningsadress: string
  lastningspostnr: string
  lastningspostort: string
  typ: string
}

export interface EkipageSummaryRow {
  ekipage: string
  grossWeight: number
}

export interface EkipageConsigneeCountRow {
  ekipage: string
  consigneeCount: number
}

export interface EkipagePdfRow {
  ekipage: string
  tur: string
  shipmentReference: string
  consignee: string
  consigneeCity: string
  weightKg: number
}
