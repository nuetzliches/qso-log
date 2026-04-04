<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOperatorStore } from '../../stores/operatorStore'
import { getBandNames } from '../../utils/frequency'
import type { QSOFilters } from '../../types/qso'

const { t } = useI18n()
const operatorStore = useOperatorStore()

const emit = defineEmits<{
  filter: [filters: QSOFilters]
}>()

const callsign = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedModes = ref<string[]>([])
const selectedBands = ref<string[]>([])
const operatorId = ref<number | undefined>(undefined)

const MODES = ['CW', 'SSB', 'FM', 'AM', 'FT8', 'FT4', 'RTTY', 'PSK31', 'DSTAR', 'DMR', 'C4FM']
const BANDS = getBandNames()

function emitFilters() {
  emit('filter', {
    callsign: callsign.value || undefined,
    dateFrom: dateFrom.value ? `${dateFrom.value}T00:00:00.000Z` : undefined,
    dateTo: dateTo.value ? `${dateTo.value}T23:59:59.999Z` : undefined,
    modes: selectedModes.value.length > 0 ? selectedModes.value : undefined,
    bands: selectedBands.value.length > 0 ? selectedBands.value : undefined,
    operatorId: operatorId.value,
  })
}

watch([callsign, dateFrom, dateTo, selectedModes, selectedBands, operatorId], emitFilters, { deep: true })

function clearFilters() {
  callsign.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  selectedModes.value = []
  selectedBands.value = []
  operatorId.value = undefined
}
</script>

<template>
  <div class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('history.filter') }}</h2>
      <button
        class="text-xs text-primary-600 hover:underline dark:text-primary-400"
        @click="clearFilters"
      >
        Reset
      </button>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Callsign search -->
      <div>
        <label for="filter-callsign" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ t('qso.callsign') }}
        </label>
        <input
          id="filter-callsign"
          v-model="callsign"
          type="text"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <!-- Date from -->
      <div>
        <label for="filter-date-from" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ t('history.from') }}
        </label>
        <input
          id="filter-date-from"
          v-model="dateFrom"
          type="date"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <!-- Date to -->
      <div>
        <label for="filter-date-to" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ t('history.to') }}
        </label>
        <input
          id="filter-date-to"
          v-model="dateTo"
          type="date"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <!-- Operator -->
      <div v-if="operatorStore.hasMultipleOperators">
        <label for="filter-operator" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ t('qso.operator') }}
        </label>
        <select
          id="filter-operator"
          :value="operatorId"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @change="operatorId = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : undefined"
        >
          <option value="">--</option>
          <option v-for="op in operatorStore.operators" :key="op.id" :value="op.id">
            {{ op.callsign }}
          </option>
        </select>
      </div>
    </div>

    <!-- Mode & Band checkboxes -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('qso.mode') }}</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <label
            v-for="mode in MODES"
            :key="mode"
            :for="`filter-mode-${mode}`"
            class="inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-xs transition-colors"
            :class="selectedModes.includes(mode)
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            <input
              :id="`filter-mode-${mode}`"
              type="checkbox"
              :value="mode"
              v-model="selectedModes"
              class="sr-only"
            />
            {{ mode }}
          </label>
        </div>
      </div>

      <div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('qso.band') }}</span>
        <div class="mt-1 flex flex-wrap gap-1">
          <label
            v-for="bandName in BANDS"
            :key="bandName"
            :for="`filter-band-${bandName}`"
            class="inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-xs transition-colors"
            :class="selectedBands.includes(bandName)
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'"
          >
            <input
              :id="`filter-band-${bandName}`"
              type="checkbox"
              :value="bandName"
              v-model="selectedBands"
              class="sr-only"
            />
            {{ bandName }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
