<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatUtcDateTime } from '../../utils/dateTime'
import { calculateDistanceKm, isValidLocator } from '../../utils/locator'
import { useOperatorStore } from '../../stores/operatorStore'
import FlagIcon from '../common/FlagIcon.vue'
import PropagationBadge from '../propagation/PropagationBadge.vue'
import type { QSO, QSOSort } from '../../types/qso'

const { t } = useI18n()
const operatorStore = useOperatorStore()

defineProps<{
  qsos: QSO[]
  sort: QSOSort
  totalCount: number
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  sort: [field: keyof QSO]
  page: [page: number]
  edit: [qso: QSO]
  delete: [qso: QSO]
}>()

const columns: { field: keyof QSO; labelKey: string; sortable: boolean }[] = [
  { field: 'sequenceNumber', labelKey: 'qso.sequenceNumber', sortable: true },
  { field: 'date', labelKey: 'qso.date', sortable: true },
  { field: 'callsign', labelKey: 'qso.callsign', sortable: true },
  { field: 'locator', labelKey: 'qso.distanceLabel', sortable: false },
  { field: 'mode', labelKey: 'qso.mode', sortable: true },
  { field: 'frequency', labelKey: 'qso.frequency', sortable: false },
  { field: 'band', labelKey: 'qso.band', sortable: true },
  { field: 'rstSent', labelKey: 'qso.rstSent', sortable: false },
  { field: 'rstReceived', labelKey: 'qso.rstReceived', sortable: false },
]

function qslLabel(value: string): string {
  switch (value) {
    case 'yes': return t('common.yes')
    case 'no': return t('common.no')
    case 'requested': return t('common.requested')
    default: return value
  }
}
</script>

<template>
  <div>
    <!-- Count -->
    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
      {{ t('history.totalCount', totalCount) }}
    </p>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="col in columns"
              :key="col.field"
              class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
              :class="{ 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200': col.sortable }"
              :tabindex="col.sortable ? 0 : undefined"
              :role="col.sortable ? 'button' : undefined"
              :aria-sort="col.sortable && sort.field === col.field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined"
              @click="col.sortable && emit('sort', col.field)"
              @keydown.enter="col.sortable && emit('sort', col.field)"
              @keydown.space.prevent="col.sortable && emit('sort', col.field)"
            >
              <span class="flex items-center gap-1">
                {{ t(col.labelKey) }}
                <template v-if="col.sortable && sort.field === col.field">
                  <svg v-if="sort.direction === 'asc'" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd" />
                  </svg>
                </template>
              </span>
            </th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('propagation.title') }}</th>
            <th v-if="operatorStore.hasMultipleOperators" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.operator') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.qslSent') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.qslReceived') }}</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.remarks') }}</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          <tr
            v-for="qso in qsos"
            :key="qso.id"
            class="text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <td class="px-3 py-2 font-mono">{{ qso.sequenceNumber }}</td>
            <td class="whitespace-nowrap px-3 py-2">{{ formatUtcDateTime(qso.date) }}</td>
            <td class="px-3 py-2 font-semibold">
              <div v-if="qso.countryCode" class="inline-flex items-center gap-1" :title="qso.country">
                <FlagIcon :iso2="qso.countryCode" />
                <span>{{ qso.callsign }}</span>
              </div>
              <span v-else>{{ qso.callsign }}</span>
            </td>
            <td class="px-3 py-2 text-gray-500 dark:text-gray-400">
              <template v-if="qso.locator && qso.myLocator && isValidLocator(qso.locator) && isValidLocator(qso.myLocator)">
                {{ calculateDistanceKm(qso.myLocator, qso.locator) }} km
              </template>
            </td>
            <td class="px-3 py-2">{{ qso.mode }}</td>
            <td class="px-3 py-2">{{ qso.frequency }}</td>
            <td class="px-3 py-2">{{ qso.band }}</td>
            <td class="px-3 py-2">{{ qso.rstSent }}</td>
            <td class="px-3 py-2">{{ qso.rstReceived }}</td>
            <td class="px-3 py-2">
              <PropagationBadge :propagation="qso.propagation" compact />
            </td>
            <td v-if="operatorStore.hasMultipleOperators" class="px-3 py-2">{{ operatorStore.operators.find(o => o.id === qso.operatorId)?.callsign ?? '' }}</td>
            <td class="px-3 py-2">{{ qslLabel(qso.qslSent) }}</td>
            <td class="px-3 py-2">{{ qslLabel(qso.qslReceived) }}</td>
            <td class="max-w-[200px] truncate px-3 py-2" :title="qso.remarks">{{ qso.remarks }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-right">
              <button
                class="text-xs text-primary-600 hover:underline dark:text-primary-400"
                :aria-label="`${t('qso.edit')} ${qso.callsign}`"
                @click="emit('edit', qso)"
              >
                {{ t('qso.edit') }}
              </button>
              <button
                class="ml-2 text-xs text-red-600 hover:underline dark:text-red-400"
                :aria-label="`${t('qso.delete')} ${qso.callsign}`"
                @click="emit('delete', qso)"
              >
                {{ t('qso.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="qsos.length === 0">
            <td :colspan="operatorStore.hasMultipleOperators ? 15 : 14" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ t('history.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > pageSize" class="mt-3 flex items-center justify-between">
      <button
        :disabled="currentPage <= 1"
        :aria-label="t('history.previousPage')"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="emit('page', currentPage - 1)"
      >
        &larr;
      </button>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ currentPage }} / {{ Math.ceil(totalCount / pageSize) }}
      </span>
      <button
        :disabled="currentPage >= Math.ceil(totalCount / pageSize)"
        :aria-label="t('history.nextPage')"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="emit('page', currentPage + 1)"
      >
        &rarr;
      </button>
    </div>
  </div>
</template>
