<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QSO } from '../../../types/qso'
import {
  aggregateByDay,
  aggregateByWeek,
  aggregateByMonth,
  calculateStreaks,
  findMostActiveDay,
  countQsosInPeriod,
} from '../../../composables/useStatisticsAggregation'
import StatCard from '../StatCard.vue'
import LineChart from '../charts/LineChart.vue'

const { t } = useI18n()

const props = defineProps<{ qsos: QSO[] }>()

type Granularity = 'day' | 'week' | 'month'
const granularity = ref<Granularity>('month')

const streaks = computed(() => calculateStreaks(props.qsos))
const mostActive = computed(() => findMostActiveDay(props.qsos))

const now = new Date()
const thisWeekStart = computed(() => {
  const d = new Date(now)
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1)
  return d.toISOString().slice(0, 10)
})
const thisMonthStart = computed(() => `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`)
const thisYearStart = computed(() => `${now.getUTCFullYear()}-01-01`)

const qsosThisWeek = computed(() => countQsosInPeriod(props.qsos, thisWeekStart.value))
const qsosThisMonth = computed(() => countQsosInPeriod(props.qsos, thisMonthStart.value))
const qsosThisYear = computed(() => countQsosInPeriod(props.qsos, thisYearStart.value))

const aggregateMap = computed(() => {
  switch (granularity.value) {
    case 'day': return aggregateByDay(props.qsos)
    case 'week': return aggregateByWeek(props.qsos)
    case 'month': return aggregateByMonth(props.qsos)
  }
})

const lineData = computed(() => {
  const sorted = [...aggregateMap.value.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  return {
    labels: sorted.map(([date]) => date),
    datasets: [{
      label: 'QSOs',
      data: sorted.map(([, count]) => count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    }],
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <StatCard :label="t('statistics.thisWeek')" :value="qsosThisWeek" />
      <StatCard :label="t('statistics.thisMonth')" :value="qsosThisMonth" />
      <StatCard :label="t('statistics.thisYear')" :value="qsosThisYear" />
      <StatCard :label="t('statistics.currentStreak')" :value="streaks.current" :detail="t('statistics.days')" />
      <StatCard :label="t('statistics.longestStreak')" :value="streaks.longest" :detail="t('statistics.days')" />
      <StatCard
        :label="t('statistics.mostActiveDay')"
        :value="mostActive?.date ?? '–'"
        :detail="mostActive ? `${mostActive.count} QSOs` : undefined"
      />
    </div>

    <div v-if="qsos.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('statistics.activityTimeline') }}</h3>
        <div role="group" :aria-label="t('statistics.activityTimeline')" class="flex gap-1">
          <button
            v-for="g in (['day', 'week', 'month'] as Granularity[])"
            :key="g"
            type="button"
            :aria-pressed="granularity === g"
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            :class="granularity === g
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
            @click="granularity = g"
          >
            {{ t(`statistics.${g}`) }}
          </button>
        </div>
      </div>
      <LineChart :chart-data="lineData" />
    </div>

    <p v-else class="text-center text-sm text-gray-600 dark:text-gray-300">{{ t('statistics.noData') }}</p>
  </div>
</template>
