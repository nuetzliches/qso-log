<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineProps<{
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
}>()

const { colors } = useChartTheme()

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
  <div class="h-[300px]">
    <Line :data="chartData" :options="options" />
  </div>
</template>
