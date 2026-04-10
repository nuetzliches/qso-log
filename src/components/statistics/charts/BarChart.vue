<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
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
}>()

const { colors } = useChartTheme()

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
  <div class="h-[300px]">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
