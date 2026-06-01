<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QSO } from '../../../types/qso'
import { useSettingsStore } from '../../../stores/settingsStore'
import { calculateDistanceStats, getDistanceBuckets, getTopDistances } from '../../../composables/useStatisticsAggregation'
import StatCard from '../StatCard.vue'
import BarChart from '../charts/BarChart.vue'
import FlagIcon from '../../common/FlagIcon.vue'

const { t } = useI18n()
const settings = useSettingsStore()

const props = defineProps<{ qsos: QSO[] }>()

const ownLocator = computed(() => settings.ownLocator)

const stats = computed(() => calculateDistanceStats(props.qsos, ownLocator.value))
const buckets = computed(() => getDistanceBuckets(props.qsos, ownLocator.value))
const topDistances = computed(() => getTopDistances(props.qsos, ownLocator.value, 10))

const bucketChartData = computed(() => ({
  labels: [...buckets.value.keys()],
  datasets: [{
    label: 'QSOs',
    data: [...buckets.value.values()],
    backgroundColor: '#3b82f6',
  }],
}))

function formatKm(km: number): string {
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k` : String(km)
}
</script>

<template>
  <div class="space-y-6">
    <p v-if="!ownLocator" class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
      {{ t('statistics.noOwnLocator') }}
    </p>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        :label="t('statistics.farthestQso')"
        :value="stats.farthest ? `${formatKm(stats.farthest.distance)} km` : '–'"
        :detail="stats.farthest ? stats.farthest.callsign : undefined"
      />
      <StatCard
        :label="t('statistics.avgDistance')"
        :value="stats.average > 0 ? `${formatKm(stats.average)} km` : '–'"
      />
      <StatCard :label="t('statistics.gridSquares')" :value="stats.uniqueGridSquares" />
      <StatCard
        :label="t('statistics.withLocator')"
        :value="stats.withLocator"
        :detail="`${stats.withoutLocator} ${t('statistics.withoutLocatorLabel')}`"
      />
    </div>

    <div v-if="stats.withLocator > 0" class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('statistics.distanceDistribution') }}</h3>
        <BarChart :chart-data="bucketChartData" />
      </div>

      <!-- Top distances table -->
      <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <h3 class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
          {{ t('statistics.topDistances') }}
        </h3>
        <div class="overflow-auto">
          <table class="w-full text-left text-sm">
            <caption class="sr-only">{{ t('statistics.topDistances') }}</caption>
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">#</th>
                <th scope="col" class="px-4 py-2 font-medium text-gray-600 dark:text-gray-400">{{ t('qso.callsign') }}</th>
                <th scope="col" class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">km</th>
                <th scope="col" class="hidden px-4 py-2 font-medium text-gray-600 dark:text-gray-400 sm:table-cell">{{ t('statistics.direction') }}</th>
                <th scope="col" class="hidden px-4 py-2 font-medium text-gray-600 dark:text-gray-400 sm:table-cell">{{ t('qso.locator') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, i) in topDistances" :key="i" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-4 py-2 text-gray-400">{{ i + 1 }}</td>
                <td class="whitespace-nowrap px-4 py-2">
                  <div class="flex items-center gap-1">
                    <FlagIcon :iso2="entry.flag" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ entry.callsign }}</span>
                    <span v-if="entry.country" class="text-xs text-gray-400">{{ entry.country }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                  {{ formatKm(entry.distance) }}
                </td>
                <td class="hidden whitespace-nowrap px-4 py-2 text-gray-600 dark:text-gray-300 sm:table-cell">
                  {{ entry.bearing }}° {{ entry.compass }}
                </td>
                <td class="hidden whitespace-nowrap px-4 py-2 text-gray-600 dark:text-gray-300 sm:table-cell">
                  {{ entry.locator }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <p v-if="qsos.length === 0" class="text-center text-sm text-gray-600 dark:text-gray-300">{{ t('statistics.noData') }}</p>
  </div>
</template>
