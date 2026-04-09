<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { isValidLocator, formatLocator, calculateDistanceKm, calculateBearing, bearingToCompass, latLonToLocator } from '../../utils/locator'

const props = withDefaults(defineProps<{
  modelValue: string
  ownLocator?: string
  showDistance?: boolean
  showGpsButton?: boolean
  label: string
  id: string
}>(), {
  ownLocator: '',
  showDistance: false,
  showGpsButton: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const gpsLoading = ref(false)
const gpsError = ref<string | null>(null)

const isValid = computed(() => !props.modelValue || isValidLocator(props.modelValue))

const distanceInfo = computed(() => {
  if (!props.showDistance || !props.ownLocator || !props.modelValue) return null
  if (!isValidLocator(props.ownLocator) || !isValidLocator(props.modelValue)) return null

  const km = calculateDistanceKm(props.ownLocator, props.modelValue)
  const deg = calculateBearing(props.ownLocator, props.modelValue)
  if (km === null || deg === null) return null

  return { km, deg, dir: bearingToCompass(deg) }
})

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  const value = raw.length >= 4 && isValidLocator(raw) ? formatLocator(raw) : raw.toUpperCase()
  emit('update:modelValue', value)
}

function fetchGps() {
  if (!navigator.geolocation) {
    gpsError.value = t('common.gpsError')
    return
  }
  gpsLoading.value = true
  gpsError.value = null
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const locator = latLonToLocator(position.coords.latitude, position.coords.longitude)
      emit('update:modelValue', locator)
      gpsLoading.value = false
    },
    () => {
      gpsError.value = t('common.gpsError')
      gpsLoading.value = false
    },
    { timeout: 10000 },
  )
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <label :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
      </label>
      <button
        v-if="showGpsButton"
        type="button"
        :disabled="gpsLoading"
        :title="t('common.useGpsLocation')"
        class="rounded p-0.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
        @click="fetchGps"
      >
        <svg v-if="gpsLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
        </svg>
      </button>
    </div>
    <input
      :id="id"
      :value="modelValue"
      type="text"
      maxlength="6"
      autocomplete="off"
      :placeholder="t('qso.locatorHint')"
      :class="[
        'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1',
        !isValid
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600',
        'bg-white dark:bg-gray-800 dark:text-white',
      ]"
      @input="onInput"
    />
    <p v-if="gpsError" class="mt-1 text-xs text-red-500">{{ gpsError }}</p>
    <div
      v-if="distanceInfo"
      class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
    >
      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <span>{{ t('qso.distance', { km: distanceInfo.km.toLocaleString() }) }}</span>
      <span class="text-primary-500 dark:text-primary-400">&middot;</span>
      <span>{{ t('qso.bearing', { deg: distanceInfo.deg, dir: distanceInfo.dir }) }}</span>
    </div>
  </div>
</template>
