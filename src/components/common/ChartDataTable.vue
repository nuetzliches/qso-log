<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  caption: string
  /** Column header for the labels column (typically the X axis name). */
  labelHeader: string
  labels: string[]
  /** One or more series. Each `data` array must align with `labels`. */
  datasets: { label: string; data: number[] }[]
}>()

const { t } = useI18n()
</script>

<template>
  <details class="mt-2 text-xs">
    <summary class="cursor-pointer text-gray-600 underline-offset-2 hover:underline dark:text-gray-300">
      {{ t('a11y.showDataTable') }}
    </summary>
    <div class="mt-2 max-h-64 overflow-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full text-left text-xs">
        <caption class="sr-only">{{ caption }}</caption>
        <thead class="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <tr>
            <th scope="col" class="px-2 py-1 font-medium">{{ labelHeader }}</th>
            <th
              v-for="ds in datasets"
              :key="ds.label"
              scope="col"
              class="px-2 py-1 text-right font-medium"
            >
              {{ ds.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="(label, i) in labels" :key="label + i">
            <th scope="row" class="px-2 py-1 font-normal text-gray-700 dark:text-gray-300">
              {{ label }}
            </th>
            <td
              v-for="ds in datasets"
              :key="ds.label + i"
              class="px-2 py-1 text-right tabular-nums text-gray-700 dark:text-gray-300"
            >
              {{ ds.data[i] ?? '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>
