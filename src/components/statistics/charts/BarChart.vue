<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useChartTheme } from './useChartTheme'
import ChartDataTable from '../../common/ChartDataTable.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string | string[]
    }[]
  }
  horizontal?: boolean
  stacked?: boolean
  title?: string
  labelHeader?: string
}>()

const { t } = useI18n()
const { colors } = useChartTheme()

const a11yLabel = computed(() =>
  t('a11y.chartBarSummary', { label: props.title || props.chartData.datasets[0]?.label || '' }),
)

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? ('y' as const) : ('x' as const),
  plugins: {
    legend: {
      display: props.chartData.datasets.length > 1,
      labels: { color: colors.value.text },
    },
    title: {
      display: !!props.title,
      text: props.title,
      color: colors.value.text,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      stacked: props.stacked,
      ticks: { color: colors.value.text },
      grid: { color: colors.value.grid },
    },
    y: {
      stacked: props.stacked,
      ticks: { color: colors.value.text },
      grid: { color: colors.value.grid },
    },
  },
}))
</script>

<template>
  <figure>
    <div class="h-[300px]" role="img" :aria-label="a11yLabel">
      <Bar :data="chartData" :options="options" />
    </div>
    <ChartDataTable
      :caption="a11yLabel"
      :label-header="labelHeader ?? ''"
      :labels="chartData.labels"
      :datasets="chartData.datasets.map(d => ({ label: d.label, data: d.data }))"
    />
  </figure>
</template>
