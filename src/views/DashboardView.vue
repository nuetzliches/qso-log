<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQsoStore } from '../stores/qsoStore'
import { useOperatorStore } from '../stores/operatorStore'
import { qsoRepository } from '../db/repositories/qsoRepository'
import {
  aggregateByBand,
  countUniqueDxcc,
  countQsosInPeriod,
} from '../composables/useStatisticsAggregation'
import StatCard from '../components/statistics/StatCard.vue'
import RecentQsosTable from '../components/dashboard/RecentQsosTable.vue'
import type { QSO } from '../types/qso'

const { t } = useI18n()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()

const allQsos = ref<QSO[]>([])

const totalQsos = computed(() => allQsos.value.length)
const uniqueDxcc = computed(() => countUniqueDxcc(allQsos.value))
const uniqueBands = computed(() => aggregateByBand(allQsos.value).size)

const monthStart = computed(() => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
})
const qsosThisMonth = computed(() => countQsosInPeriod(allQsos.value, monthStart.value))

onMounted(async () => {
  await operatorStore.loadOperators()
  await qsoStore.loadRecentQsos()
  const { qsos } = await qsoRepository.getAll(undefined, { field: 'sequenceNumber', direction: 'desc' })
  allQsos.value = qsos
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('dashboard.title') }}
      </h1>
      <span
        v-if="operatorStore.currentOperator"
        class="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
      >
        {{ operatorStore.currentOperator.callsign }}
      </span>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard :label="t('dashboard.totalQsos')" :value="totalQsos" />
      <StatCard :label="t('dashboard.dxccCountries')" :value="uniqueDxcc" />
      <StatCard :label="t('dashboard.bands')" :value="uniqueBands" />
      <StatCard :label="t('dashboard.thisMonth')" :value="qsosThisMonth" />
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {{ t('dashboard.quickActions') }}
      </h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RouterLink
          to="/new"
          class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ t('dashboard.newQso') }}
        </RouterLink>
        <RouterLink
          to="/history"
          class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {{ t('dashboard.viewHistory') }}
        </RouterLink>
        <RouterLink
          to="/map"
          class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
          </svg>
          {{ t('dashboard.viewMap') }}
        </RouterLink>
        <RouterLink
          to="/statistics"
          class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          {{ t('dashboard.viewStatistics') }}
        </RouterLink>
      </div>
    </div>

    <!-- Recent QSOs -->
    <div>
      <h2 class="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {{ t('dashboard.recentQsos') }}
      </h2>
      <RecentQsosTable v-if="qsoStore.recentQsos.length > 0" :qsos="qsoStore.recentQsos" />
      <div
        v-else
        class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {{ t('dashboard.noRecentQsos') }}
      </div>
    </div>
  </div>
</template>
