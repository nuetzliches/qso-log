<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  detail?: string
}>()
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ label }}</p>
    <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
    <p v-if="detail" class="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{{ detail }}</p>
  </div>
</template>
