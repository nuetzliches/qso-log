<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getBandNames } from '../../utils/frequency'
import type { MapFilters } from '../../types/map'

const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [filters: MapFilters]
}>()

defineProps<{
  modelValue: MapFilters
}>()

const MODES = ['CW', 'SSB', 'FM', 'AM', 'FT8', 'FT4', 'RTTY', 'PSK31', 'DSTAR', 'DMR', 'C4FM']
const BANDS = getBandNames()

const dateFrom = ref('')
const dateTo = ref('')
const selectedModes = ref<string[]>([])
const selectedBands = ref<string[]>([])
const isExpanded = ref(false)

function emitFilters() {
  emit('update:modelValue', {
    dateFrom: dateFrom.value ? `${dateFrom.value}T00:00:00.000Z` : undefined,
    dateTo: dateTo.value ? `${dateTo.value}T23:59:59.999Z` : undefined,
    modes: selectedModes.value.length > 0 ? selectedModes.value : undefined,
    bands: selectedBands.value.length > 0 ? selectedBands.value : undefined,
  })
}

watch([dateFrom, dateTo, selectedModes, selectedBands], emitFilters, { deep: true })

const hasActiveFilters = ref(false)
watch([dateFrom, dateTo, selectedModes, selectedBands], () => {
  hasActiveFilters.value =
    !!dateFrom.value || !!dateTo.value || selectedModes.value.length > 0 || selectedBands.value.length > 0
}, { deep: true })

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  selectedModes.value = []
  selectedBands.value = []
}
</script>

<template>
  <div class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
    <!-- Toggle button (mobile) / header -->
    <div class="flex items-center gap-2 px-3 py-2">
      <button
        class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
        @click="isExpanded = !isExpanded"
      >
        <!-- Filter icon -->
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.25 12.75v6.196a.75.75 0 0 1-1.007.708l-4.5-1.5A.75.75 0 0 1 9 17.25v-4.5L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        {{ t('history.filter') }}
        <span v-if="hasActiveFilters" class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">!</span>
        <svg
          class="h-3 w-3 transition-transform"
          :class="isExpanded ? 'rotate-180' : ''"
          fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          aria-hidden="true" focusable="false"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- Date range summary when collapsed -->
      <span v-if="!isExpanded && (dateFrom || dateTo)" class="text-xs text-gray-600 dark:text-gray-300">
        {{ dateFrom || '…' }} – {{ dateTo || '…' }}
      </span>
      <span v-if="!isExpanded && selectedModes.length > 0" class="text-xs text-gray-600 dark:text-gray-300">
        {{ selectedModes.join(', ') }}
      </span>
      <span v-if="!isExpanded && selectedBands.length > 0" class="text-xs text-gray-600 dark:text-gray-300">
        {{ selectedBands.join(', ') }}
      </span>

      <button
        v-if="hasActiveFilters"
        class="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="clearFilters"
      >
        ✕
      </button>
    </div>

    <!-- Expanded filter panel -->
    <div v-if="isExpanded" class="space-y-3 px-3 pb-3">
      <!-- Date range -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('history.from') }}</label>
          <input
            v-model="dateFrom"
            type="date"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('history.to') }}</label>
          <input
            v-model="dateTo"
            type="date"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Mode pills -->
      <div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('qso.mode') }}</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <label
            v-for="mode in MODES"
            :key="mode"
            :for="`map-mode-${mode}`"
            class="inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-xs transition-colors"
            :class="selectedModes.includes(mode)
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            <input :id="`map-mode-${mode}`" type="checkbox" :value="mode" v-model="selectedModes" class="sr-only" />
            {{ mode }}
          </label>
        </div>
      </div>

      <!-- Band pills -->
      <div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('qso.band') }}</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <label
            v-for="band in BANDS"
            :key="band"
            :for="`map-band-${band}`"
            class="inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-xs transition-colors"
            :class="selectedBands.includes(band)
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            <input :id="`map-band-${band}`" type="checkbox" :value="band" v-model="selectedBands" class="sr-only" />
            {{ band }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
