<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QSO } from '../../../types/qso'
import { aggregateByBand, aggregateByMode, aggregateByBandAndMode, sortBands, topEntry } from '../../../composables/useStatisticsAggregation'
import { CHART_COLORS } from '../charts/useChartTheme'
import StatCard from '../StatCard.vue'
import BarChart from '../charts/BarChart.vue'
import PieChart from '../charts/PieChart.vue'

const { t } = useI18n()

const props = defineProps<{ qsos: QSO[] }>()

const byBand = computed(() => aggregateByBand(props.qsos))
const byMode = computed(() => aggregateByMode(props.qsos))
const byBandAndMode = computed(() => aggregateByBandAndMode(props.qsos))

const topBand = computed(() => topEntry(byBand.value))
const topMode = computed(() => topEntry(byMode.value))

// All modes across all bands (for consistent stacking)
const allModes = computed(() => {
  const modes = new Set<string>()
  for (const modeMap of byBandAndMode.value.values()) {
    for (const mode of modeMap.keys()) modes.add(mode)
  }
  return [...modes].sort()
})

const bands = computed(() => sortBands([...byBand.value.keys()]))

const stackedBarData = computed(() => ({
  labels: bands.value,
  datasets: allModes.value.map((mode, i) => ({
    label: mode,
    data: bands.value.map((band) => byBandAndMode.value.get(band)?.get(mode) ?? 0),
    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
  })),
}))

const pieData = computed(() => {
  const sorted = [...byMode.value.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(([mode]) => mode),
    datasets: [{
      data: sorted.map(([, count]) => count),
      backgroundColor: sorted.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
    }],
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard :label="t('statistics.totalQsos')" :value="qsos.length" />
      <StatCard :label="t('statistics.uniqueBands')" :value="byBand.size" />
      <StatCard
        :label="t('statistics.topBand')"
        :value="topBand?.key ?? '–'"
        :detail="topBand ? `${topBand.count} QSOs` : undefined"
      />
      <StatCard
        :label="t('statistics.topMode')"
        :value="topMode?.key ?? '–'"
        :detail="topMode ? `${topMode.count} QSOs` : undefined"
      />
    </div>

    <div v-if="qsos.length > 0" class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('statistics.qsosByBand') }}</h3>
        <BarChart :chart-data="stackedBarData" :stacked="true" :horizontal="true" />
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('statistics.modeDistribution') }}</h3>
        <PieChart :chart-data="pieData" />
      </div>
    </div>

    <p v-else class="text-center text-sm text-gray-500 dark:text-gray-400">{{ t('statistics.noData') }}</p>
  </div>
</template>
