<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../../stores/settingsStore'
import {
  correlationByBand,
  kIndexBandMatrix,
  qsosWithPropagation,
  sfiDistancePairs,
} from '../../../composables/usePropagationAggregation'
import { sortBands } from '../../../composables/useStatisticsAggregation'
import { CHART_COLORS } from '../charts/useChartTheme'
import StatCard from '../StatCard.vue'
import ScatterChart from '../charts/ScatterChart.vue'
import BarChart from '../charts/BarChart.vue'
import type { QSO } from '../../../types/qso'

const props = defineProps<{ qsos: QSO[] }>()
const { t } = useI18n()
const settings = useSettingsStore()

const enriched = computed(() => qsosWithPropagation(props.qsos))

const avgSfi = computed(() => {
  const values = enriched.value.map((q) => q.propagation?.sfi).filter((v): v is number => v !== undefined)
  if (values.length === 0) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
})

const avgK = computed(() => {
  const values = enriched.value.map((q) => q.propagation?.kIndex).filter((v): v is number => v !== undefined)
  if (values.length === 0) return null
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
})

const sfiDistance = computed(() => sfiDistancePairs(props.qsos, settings.ownLocator))

const bandsInScatter = computed(() => sortBands(Array.from(new Set(sfiDistance.value.map((p) => p.band)))))

const scatterData = computed(() => ({
  datasets: bandsInScatter.value.map((band, i) => ({
    label: band,
    data: sfiDistance.value
      .filter((p) => p.band === band)
      .map((p) => ({ x: p.sfi, y: p.distance })),
    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
  })),
}))

const kMatrix = computed(() => kIndexBandMatrix(enriched.value))
const kBands = computed(() => sortBands(
  Array.from(new Set(
    Array.from(kMatrix.value.values()).flatMap((row) => Array.from(row.keys())),
  )),
))
const kKeys = computed(() => Array.from(kMatrix.value.keys()).sort((a, b) => a - b))

const kBarData = computed(() => ({
  labels: kKeys.value.map((k) => `K=${k}`),
  datasets: kBands.value.map((band, i) => ({
    label: band,
    data: kKeys.value.map((k) => kMatrix.value.get(k)?.get(band) ?? 0),
    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
  })),
}))

const correlations = computed(() => correlationByBand(props.qsos, settings.ownLocator))
</script>

<template>
  <div v-if="enriched.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
    {{ t('propagation.noData') }}
  </div>

  <div v-else class="space-y-6">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard :label="t('statistics.totalQsos')" :value="enriched.length" />
      <StatCard label="∅ SFI" :value="avgSfi ?? '–'" />
      <StatCard label="∅ K" :value="avgK ?? '–'" />
      <StatCard
        :label="t('statistics.uniqueBands')"
        :value="new Set(enriched.map((q) => q.band)).size"
      />
    </div>

    <section v-if="scatterData.datasets.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        SFI vs. Distanz (km) — pro Band
      </h2>
      <ScatterChart :chart-data="scatterData" x-label="SFI" y-label="km" />
    </section>

    <section v-if="kBarData.labels.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        QSOs nach K-Index und Band
      </h2>
      <BarChart :chart-data="kBarData" :stacked="true" />
    </section>

    <section v-if="correlations.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Korrelation SFI ↔ Distanz (Pearson r)
      </h2>
      <table class="min-w-full text-sm">
        <caption class="sr-only">Korrelation SFI ↔ Distanz pro Band</caption>
        <thead>
          <tr class="text-left text-xs uppercase text-gray-600 dark:text-gray-300">
            <th scope="col" class="pb-2">Band</th>
            <th scope="col" class="pb-2">QSOs</th>
            <th scope="col" class="pb-2">r</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="row in correlations" :key="row.band">
            <td class="py-1.5 font-medium text-gray-700 dark:text-gray-300">{{ row.band }}</td>
            <td class="py-1.5 text-gray-600 dark:text-gray-300">{{ row.count }}</td>
            <td class="py-1.5 font-mono">
              <span v-if="row.sfiVsDistance === undefined" class="text-gray-400">–</span>
              <span v-else>{{ row.sfiVsDistance.toFixed(2) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
