import { ref, watch, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'
import { useReducedMotion } from './useReducedMotion'
import type { MapMarker } from '../types/map'
import { bearingToCompass } from '../utils/locator'

// Tile layer URLs
const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const TILE_CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

export function useLeafletMap() {
  const settings = useSettingsStore()
  const reducedMotion = useReducedMotion()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let map: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lightLayer: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let darkLayer: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let clusterGroup: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ownMarker: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let polylines: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let L: any = null

  const isLoaded = ref(false)
  const showLines = ref(false)
  let currentMarkers: MapMarker[] = []
  let currentOwnLatLon: { lat: number; lon: number } | null = null

  function resolveIsDark(): boolean {
    if (settings.theme === 'dark') return true
    if (settings.theme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function switchTileLayer(dark: boolean) {
    if (!map || !lightLayer || !darkLayer) return
    if (dark) {
      if (map.hasLayer(lightLayer)) map.removeLayer(lightLayer)
      if (!map.hasLayer(darkLayer)) darkLayer.addTo(map)
    } else {
      if (map.hasLayer(darkLayer)) map.removeLayer(darkLayer)
      if (!map.hasLayer(lightLayer)) lightLayer.addTo(map)
    }
  }

  async function init(containerEl: HTMLElement) {
    const leafletModule = await import('leaflet')
    L = leafletModule.default
    await import('leaflet.markercluster')

    map = L.map(containerEl, {
      zoomControl: true,
      fadeAnimation: !reducedMotion.value,
      zoomAnimation: !reducedMotion.value,
      markerZoomAnimation: !reducedMotion.value,
    })

    lightLayer = L.tileLayer(TILE_OSM, { attribution: TILE_OSM_ATTR, maxZoom: 19 })
    darkLayer = L.tileLayer(TILE_CARTO_DARK, { attribution: TILE_CARTO_ATTR, maxZoom: 19 })

    switchTileLayer(resolveIsDark())

    clusterGroup = L.markerClusterGroup({ chunkedLoading: true })
    map.addLayer(clusterGroup)

    map.setView([20, 0], 2)

    isLoaded.value = true
  }

  function buildPopupHtml(marker: MapMarker): string {
    const lines: string[] = []

    if (marker.distanceKm !== undefined && marker.bearing !== undefined) {
      lines.push(
        `<div class="map-popup-dist">${marker.distanceKm} km &middot; ${marker.bearing}&deg; ${bearingToCompass(marker.bearing)}</div>`
      )
    }

    for (const qso of marker.qsos) {
      const dateStr = new Date(qso.date).toLocaleDateString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit',
      })
      lines.push(
        `<div class="map-popup-qso">` +
        `<strong>${qso.callsign}</strong> &mdash; ${dateStr}<br>` +
        `${qso.mode} &middot; ${qso.band}` +
        `</div>`
      )
    }

    return `<div class="map-popup"><div class="map-popup-loc">${marker.locator}</div>${lines.join('')}</div>`
  }

  function setMarkers(markers: MapMarker[]) {
    if (!map || !L || !clusterGroup) return
    currentMarkers = markers

    clusterGroup.clearLayers()

    for (const marker of markers) {
      const circle = L.circleMarker([marker.latLon.lat, marker.latLon.lon], {
        radius: marker.qsos.length > 1 ? 8 : 6,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
        weight: 2,
      })
      circle.bindPopup(buildPopupHtml(marker), { maxWidth: 260 })
      const qsoCount = marker.qsos.length
      const tooltipText =
        marker.distanceKm !== undefined
          ? `${marker.locator} — ${qsoCount} QSO${qsoCount > 1 ? 's' : ''}, ${marker.distanceKm} km`
          : `${marker.locator} — ${qsoCount} QSO${qsoCount > 1 ? 's' : ''}`
      circle.bindTooltip(tooltipText, { direction: 'top' })
      clusterGroup.addLayer(circle)
    }

    if (showLines.value && currentOwnLatLon) {
      drawLines(currentMarkers, currentOwnLatLon)
    }
  }

  function setOwnStation(latLon: { lat: number; lon: number }, callsign: string, ownStationLabel: string) {
    if (!map || !L) return
    currentOwnLatLon = latLon

    if (ownMarker) {
      map.removeLayer(ownMarker)
    }

    ownMarker = L.circleMarker([latLon.lat, latLon.lon], {
      radius: 10,
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 0.9,
      weight: 3,
    })
    ownMarker.bindPopup(`<div class="map-popup"><strong>${callsign || ownStationLabel}</strong><br>${ownStationLabel}</div>`)
    ownMarker.bindTooltip(callsign ? `${ownStationLabel}: ${callsign}` : ownStationLabel, { direction: 'top' })
    ownMarker.addTo(map)
  }

  function clearOwnStation() {
    if (ownMarker && map) {
      map.removeLayer(ownMarker)
      ownMarker = null
    }
    currentOwnLatLon = null
  }

  function drawLines(markers: MapMarker[], ownLatLon: { lat: number; lon: number }) {
    if (!map || !L) return
    clearLines()
    for (const marker of markers) {
      const line = L.polyline(
        [[ownLatLon.lat, ownLatLon.lon], [marker.latLon.lat, marker.latLon.lon]],
        { color: '#6366f1', weight: 1, opacity: 0.5 }
      )
      line.addTo(map)
      polylines.push(line)
    }
  }

  function clearLines() {
    if (!map) return
    for (const line of polylines) {
      map.removeLayer(line)
    }
    polylines = []
  }

  function toggleLines(markers: MapMarker[], ownLatLon: { lat: number; lon: number } | null) {
    showLines.value = !showLines.value
    if (showLines.value && ownLatLon) {
      drawLines(markers, ownLatLon)
    } else {
      clearLines()
    }
  }

  function fitBounds(markers: MapMarker[], ownLatLon: { lat: number; lon: number } | null) {
    if (!map || !L) return
    const points: [number, number][] = markers.map((m) => [m.latLon.lat, m.latLon.lon])
    if (ownLatLon) points.push([ownLatLon.lat, ownLatLon.lon])
    if (points.length === 0) {
      map.setView([20, 0], 2)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 8)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
  }

  function destroy() {
    clearLines()
    if (clusterGroup && map) map.removeLayer(clusterGroup)
    if (ownMarker && map) map.removeLayer(ownMarker)
    if (map) {
      map.remove()
      map = null
    }
    isLoaded.value = false
  }

  // Watch theme changes
  const stopThemeWatch = watch(() => settings.theme, () => {
    switchTileLayer(resolveIsDark())
  })

  // Watch system preference when theme is 'system'
  let mediaQueryListener: (() => void) | null = null
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = () => {
      if (settings.theme === 'system') {
        switchTileLayer(mq.matches)
      }
    }
    mq.addEventListener('change', mediaQueryListener)
  }

  onUnmounted(() => {
    stopThemeWatch()
    if (mediaQueryListener && typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaQueryListener)
    }
    destroy()
  })

  return {
    isLoaded,
    showLines,
    init,
    setMarkers,
    setOwnStation,
    clearOwnStation,
    toggleLines,
    fitBounds,
    destroy,
    getCurrentOwnLatLon: () => currentOwnLatLon,
    getCurrentMarkers: () => currentMarkers,
  }
}
