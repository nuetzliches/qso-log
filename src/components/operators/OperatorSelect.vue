<script setup lang="ts">
import { useOperatorStore } from '../../stores/operatorStore'
import { useI18n } from 'vue-i18n'

const operatorStore = useOperatorStore()
const { t } = useI18n()

const model = defineModel<number>({ required: true })

function onSelect(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  model.value = id
  operatorStore.selectOperator(id)
}
</script>

<template>
  <div v-if="operatorStore.hasMultipleOperators">
    <label for="operator-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ t('qso.operator') }}
    </label>
    <select
      id="operator-select"
      :value="model"
      class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      @change="onSelect"
    >
      <option
        v-for="op in operatorStore.operators"
        :key="op.id"
        :value="op.id"
      >
        {{ op.callsign }} - {{ op.name }}
      </option>
    </select>
  </div>
</template>
