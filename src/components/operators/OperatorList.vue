<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Operator } from '../../types/operator'

const { t } = useI18n()

defineProps<{
  operators: Operator[]
}>()

const emit = defineEmits<{
  edit: [operator: Operator]
  delete: [operator: Operator]
}>()
</script>

<template>
  <div v-if="operators.length === 0" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
    {{ t('operators.noOperators') }}
  </div>

  <ul v-else class="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
    <li
      v-for="op in operators"
      :key="op.id"
      class="flex items-center justify-between px-4 py-3"
    >
      <div>
        <span class="font-semibold text-gray-900 dark:text-white">{{ op.callsign }}</span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">{{ op.name }}</span>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/50"
          :aria-label="`${t('operators.edit')} ${op.callsign}`"
          @click="emit('edit', op)"
        >
          {{ t('operators.edit') }}
        </button>
        <button
          class="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
          :aria-label="`${t('operators.delete')} ${op.callsign}`"
          @click="emit('delete', op)"
        >
          {{ t('operators.delete') }}
        </button>
      </div>
    </li>
  </ul>
</template>
