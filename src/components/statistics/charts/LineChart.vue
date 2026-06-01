<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useChartTheme } from './useChartTheme'
import ChartDataTable from '../../common/ChartDataTable.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor?: string
      fill?: boolean
    }[]
  }
  title?: string
  labelHeader?: string
}>()

const { t } = useI18n()
const { colors } = useChartTheme()

const a11yLabel = computed(() =>
  t('a11y.chartLineSummary', { label: props.title || props.chartData.datasets[0]?.label || '' }),
)

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: { color: colors.value.text },
    },
    title: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: { color: colors.value.text, maxTicksLimit: 12 },
      grid: { color: colors.value.grid },
    },
    y: {
      beginAtZero: true,
      ticks: { color: colors.value.text },
      grid: { color: colors.value.grid },
    },
  },
  elements: {
    point: { radius: 2, hoverRadius: 5 },
    line: { tension: 0.3 },
  },
}))
</script>

<template>
  <figure>
    <div class="h-[300px]" role="img" :aria-label="a11yLabel">
      <Line :data="chartData" :options="options" />
    </div>
    <ChartDataTable
      :caption="a11yLabel"
      :label-header="labelHeader ?? ''"
      :labels="chartData.labels"
      :datasets="chartData.datasets.map(d => ({ label: d.label, data: d.data }))"
    />
  </figure>
</template>
