<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QSO } from '../../../types/qso'
import { aggregateByCountry, countUniqueDxcc } from '../../../composables/useStatisticsAggregation'
import { CHART_COLORS } from '../charts/useChartTheme'
import StatCard from '../StatCard.vue'
import BarChart from '../charts/BarChart.vue'

const { t } = useI18n()

const props = defineProps<{ qsos: QSO[] }>()

const countries = computed(() => aggregateByCountry(props.qsos))
const uniqueCount = computed(() => countUniqueDxcc(props.qsos))
const topCountry = computed(() => countries.value[0] ?? null)
const unknownCount = computed(() => props.qsos.filter((q) => !q.country).length)

const top20 = computed(() => countries.value.slice(0, 20))

const barData = computed(() => ({
  labels: top20.value.map((c) => `${c.flag} ${c.country}`),
  datasets: [{
    label: 'QSOs',
    data: top20.value.map((c) => c.count),
    backgroundColor: top20.value.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
  }],
}))
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard :label="t('statistics.uniqueCountries')" :value="uniqueCount" />
      <StatCard
        :label="t('statistics.topCountry')"
        :value="topCountry ? `${topCountry.flag} ${topCountry.country}` : '–'"
        :detail="topCountry ? `${topCountry.count} QSOs` : undefined"
      />
      <StatCard :label="t('statistics.unknownCountry')" :value="unknownCount" />
    </div>

    <div v-if="top20.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('statistics.top20Countries') }}</h3>
      <div class="h-[500px]">
        <BarChart :chart-data="barData" :horizontal="true" />
      </div>
    </div>

    <!-- Country table -->
    <div v-if="countries.length > 0" class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <h3 class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
        {{ t('statistics.allCountries') }} ({{ countries.length }})
      </h3>
      <div class="max-h-[400px] overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 font-medium text-gray-600 dark:text-gray-400"></th>
              <th class="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">{{ t('qso.country') }}</th>
              <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">QSOs</th>
              <th class="hidden px-4 py-2 font-medium text-gray-600 dark:text-gray-400 sm:table-cell">{{ t('statistics.firstQso') }}</th>
              <th class="hidden px-4 py-2 font-medium text-gray-600 dark:text-gray-400 sm:table-cell">{{ t('statistics.lastQso') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in countries" :key="c.country" class="border-t border-gray-100 dark:border-gray-800">
              <td class="px-4 py-2">{{ c.flag }}</td>
              <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">{{ c.country }}</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">{{ c.count }}</td>
              <td class="hidden whitespace-nowrap px-4 py-2 text-gray-500 dark:text-gray-400 sm:table-cell">{{ c.firstDate }}</td>
              <td class="hidden whitespace-nowrap px-4 py-2 text-gray-500 dark:text-gray-400 sm:table-cell">{{ c.lastDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="qsos.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400">{{ t('statistics.noData') }}</p>
  </div>
</template>
