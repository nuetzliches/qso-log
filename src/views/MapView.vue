<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'
import { useLeafletMap } from '../composables/useLeafletMap'
import { qsoRepository } from '../db/repositories/qsoRepository'
import { groupQsosByLocator } from '../utils/mapHelpers'
import { locatorToLatLon, isValidLocator } from '../utils/locator'
import MapFilterBar from '../components/map/MapFilterBar.vue'
import type { MapFilters, MapMarker } from '../types/map'

const { t } = useI18n()
const settings = useSettingsStore()

const mapContainer = ref<HTMLElement | null>(null)
const mapMap = useLeafletMap()
const { isLoaded, showLines, init, setMarkers, setOwnStation, clearOwnStation, toggleLines, fitBounds } = mapMap

const filters = ref<MapFilters>({})
const markers = ref<MapMarker[]>([])
const totalQsos = ref(0)
const hiddenQsos = ref(0)
const isLoadingData = ref(false)

const ownLatLon = computed(() => {
  if (settings.ownLocator && isValidLocator(settings.ownLocator)) {
    return locatorToLatLon(settings.ownLocator)
  }
  return null
})

async function loadQsos() {
  isLoadingData.value = true
  try {
    const { qsos } = await qsoRepository.getAll({
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo,
      modes: filters.value.modes,
      bands: filters.value.bands,
    })

    totalQsos.value = qsos.length
    const grouped = groupQsosByLocator(qsos, settings.ownLocator || undefined)
    const qsosWithLocator = grouped.reduce((sum, m) => sum + m.qsos.length, 0)
    hiddenQsos.value = totalQsos.value - qsosWithLocator
    markers.value = grouped
  } finally {
    isLoadingData.value = false
  }
}

async function updateMap() {
  if (!isLoaded.value) return
  await loadQsos()
  setMarkers(markers.value)

  if (ownLatLon.value) {
    setOwnStation(ownLatLon.value, settings.ownCallsign, t('map.ownStation'))
  } else {
    clearOwnStation()
  }
}

onMounted(async () => {
  if (mapContainer.value) {
    await init(mapContainer.value)
    await updateMap()
    fitBounds(markers.value, ownLatLon.value)
  }
})

watch(filters, updateMap, { deep: true })
watch(() => settings.ownLocator, updateMap)

function handleFitBounds() {
  fitBounds(markers.value, ownLatLon.value)
}

function handleToggleLines() {
  toggleLines(markers.value, ownLatLon.value)
}
</script>

<template>
  <div class="flex flex-1 flex-col min-h-0">
    <!-- Filter bar -->
    <MapFilterBar v-model="filters" />

    <!-- Status bar -->
    <div class="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
      <span v-if="isLoaded && !isLoadingData">
        {{ t('map.status', { shown: markers.length, hidden: hiddenQsos }) }}
      </span>
      <span v-else-if="isLoadingData">{{ t('map.loading') }}</span>
      <span v-else>{{ t('map.loading') }}</span>

      <!-- Floating action buttons -->
      <div class="ml-auto flex gap-1.5">
        <button
          class="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
          :aria-label="t('a11y.centerMap')"
          :title="t('map.centerMap')"
          @click="handleFitBounds"
        >
          <!-- Target/center icon -->
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          <span class="hidden sm:inline">{{ t('map.centerMap') }}</span>
        </button>
        <button
          v-if="ownLatLon"
          class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium shadow-sm ring-1 transition-colors"
          :class="showLines
            ? 'bg-primary-50 text-primary-700 ring-primary-300 hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:ring-primary-700'
            : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800'"
          :aria-label="t('a11y.toggleConnections')"
          :aria-pressed="showLines"
          :title="t('map.connections')"
          @click="handleToggleLines"
        >
          <!-- Line icon -->
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <span class="hidden sm:inline">{{ t('map.connections') }}</span>
        </button>
      </div>
    </div>

    <!-- Map container (always rendered so Leaflet gets correct dimensions) -->
    <div ref="mapContainer" class="relative flex-1 min-h-0">
      <!-- Loading overlay (absolute, on top of map area) -->
      <div
        v-if="!isLoaded"
        class="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-100 dark:bg-gray-900"
      >
        <div class="text-center text-sm text-gray-600 dark:text-gray-300">
          <svg class="mx-auto mb-2 h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ t('map.loading') }}
        </div>
      </div>

      <!-- Empty state (when loaded but no markers) -->
      <div
        v-else-if="isLoaded && markers.length === 0 && !isLoadingData"
        class="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center"
      >
        <div class="rounded-lg bg-white/90 px-6 py-4 text-center shadow-lg dark:bg-gray-900/90">
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('map.emptyState') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Leaflet popup dark mode overrides */
:deep(.leaflet-popup-content-wrapper) {
  background: white;
  color: #1f2937;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
:global(.dark) :deep(.leaflet-popup-content-wrapper) {
  background: #111827;
  color: #f3f4f6;
}
:deep(.leaflet-popup-tip) {
  background: white;
}
:global(.dark) :deep(.leaflet-popup-tip) {
  background: #111827;
}
:deep(.leaflet-popup-close-button) {
  color: #9ca3af;
}
:global(.dark) :deep(.leaflet-popup-close-button) {
  color: #6b7280;
}

/* Leaflet control dark mode */
:deep(.leaflet-control-zoom a) {
  border-color: #d1d5db;
  background: white;
  color: #374151;
}
:global(.dark) :deep(.leaflet-control-zoom a) {
  border-color: #4b5563;
  background: #111827;
  color: #e5e7eb;
}
:deep(.leaflet-control-zoom a:hover) {
  background: #f3f4f6;
}
:global(.dark) :deep(.leaflet-control-zoom a:hover) {
  background: #1f2937;
}
:deep(.leaflet-control-attribution) {
  background: rgb(255 255 255 / 0.8);
  color: #6b7280;
}
:global(.dark) :deep(.leaflet-control-attribution) {
  background: rgb(17 24 39 / 0.8);
  color: #9ca3af;
}

/* Popup content */
:deep(.map-popup) {
  font-size: 0.8125rem;
  line-height: 1.5;
}
:deep(.map-popup-loc) {
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  color: #6b7280;
}
:global(.dark) :deep(.map-popup-loc) {
  color: #9ca3af;
}
:deep(.map-popup-dist) {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: #2563eb;
}
:global(.dark) :deep(.map-popup-dist) {
  color: #60a5fa;
}
:deep(.map-popup-qso) {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.25rem;
  margin-top: 0.25rem;
}
:global(.dark) :deep(.map-popup-qso) {
  border-top-color: #374151;
}
</style>
