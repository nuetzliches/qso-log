export interface MapQsoSummary {
  id?: number
  callsign: string
  date: string
  mode: string
  band: string
  distanceKm?: number
  bearing?: number
}

export interface MapMarker {
  locator: string
  latLon: { lat: number; lon: number }
  qsos: MapQsoSummary[]
  distanceKm?: number
  bearing?: number
}

export interface MapFilters {
  dateFrom?: string
  dateTo?: string
  modes?: string[]
  bands?: string[]
}
