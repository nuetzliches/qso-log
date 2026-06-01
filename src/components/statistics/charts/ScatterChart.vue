<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useChartTheme } from './useChartTheme'

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend)

const props = defineProps<{
  chartData: {
    datasets: {
      label: string
      data: { x: number; y: number }[]
      backgroundColor: string
    }[]
  }
  xLabel?: string
  yLabel?: string
  title?: string
}>()

const { colors } = useChartTheme()

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: colors.value.text } },
    title: { display: !!props.title, text: props.title, color: colors.value.text },
    tooltip: { mode: 'point' as const, intersect: true },
  },
  scales: {
    x: {
      type: 'linear' as const,
      title: { display: !!props.xLabel, text: props.xLabel, color: colors.value.text },
      ticks: { color: colors.value.text },
      grid: { color: colors.value.grid },
    },
    y: {
      type: 'linear' as const,
      title: { display: !!props.yLabel, text: props.yLabel, color: colors.value.text },
      ticks: { color: colors.value.text },
      grid: { color: colors.value.grid },
    },
  },
}))
</script>

<template>
  <div class="h-[320px]">
    <Scatter :data="chartData" :options="options" />
  </div>
</template>
