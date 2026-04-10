<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Operator } from '../../types/operator'

const { t } = useI18n()

const operatorId = defineModel<number | undefined>('operatorId')

defineProps<{
  operators: Operator[]
  hasMultipleOperators: boolean
}>()
</script>

<template>
  <div v-if="hasMultipleOperators" class="flex items-center gap-2">
    <label for="stats-operator" class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ t('qso.operator') }}
    </label>
    <select
      id="stats-operator"
      :value="operatorId ?? ''"
      class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      @change="operatorId = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : undefined"
    >
      <option value="">{{ t('statistics.allOperators') }}</option>
      <option v-for="op in operators" :key="op.id" :value="op.id">
        {{ op.callsign }} – {{ op.name }}
      </option>
    </select>
  </div>
</template>
