<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useChartTheme } from './useChartTheme'
import ChartDataTable from '../../common/ChartDataTable.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
    }[]
  }
  title?: string
  labelHeader?: string
  seriesLabel?: string
}>()

const { t } = useI18n()
const { colors } = useChartTheme()

const a11yLabel = computed(() =>
  t('a11y.chartPieSummary', { label: props.title || props.seriesLabel || '' }),
)

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { color: colors.value.text },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number; dataset: { data: number[] } }) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0'
          return `${ctx.label}: ${ctx.parsed} (${pct}%)`
        },
      },
    },
  },
}))
</script>

<template>
  <figure>
    <div class="h-[300px]" role="img" :aria-label="a11yLabel">
      <Doughnut :data="chartData" :options="options" />
    </div>
    <ChartDataTable
      :caption="a11yLabel"
      :label-header="labelHeader ?? ''"
      :labels="chartData.labels"
      :datasets="chartData.datasets.map((d, i) => ({ label: seriesLabel ?? `Series ${i + 1}`, data: d.data }))"
    />
  </figure>
</template>
