<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOperatorStore } from '../stores/operatorStore'
import OperatorList from '../components/operators/OperatorList.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import type { Operator } from '../types/operator'

const { t } = useI18n()
const operatorStore = useOperatorStore()

const callsign = ref('')
const name = ref('')
const editingId = ref<number | null>(null)
const deleteTarget = ref<Operator | null>(null)

onMounted(() => {
  operatorStore.loadOperators()
})

async function handleSubmit() {
  if (editingId.value !== null) {
    await operatorStore.updateOperator(editingId.value, {
      callsign: callsign.value.toUpperCase(),
      name: name.value,
    })
    editingId.value = null
  } else {
    await operatorStore.addOperator({
      callsign: callsign.value.toUpperCase(),
      name: name.value,
    })
  }
  callsign.value = ''
  name.value = ''
}

function startEdit(op: Operator) {
  editingId.value = op.id!
  callsign.value = op.callsign
  name.value = op.name
}

function cancelEdit() {
  editingId.value = null
  callsign.value = ''
  name.value = ''
}

async function confirmDelete() {
  if (deleteTarget.value?.id) {
    await operatorStore.deleteOperator(deleteTarget.value.id)
  }
  deleteTarget.value = null
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('operators.title') }}
    </h1>

    <!-- Add/Edit form -->
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-end">
      <div class="flex-1">
        <label for="op-callsign" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('operators.callsign') }}
        </label>
        <input
          id="op-callsign"
          v-model="callsign"
          type="text"
          required
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @input="callsign = ($event.target as HTMLInputElement).value.toUpperCase()"
        />
      </div>
      <div class="flex-1">
        <label for="op-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('operators.name') }}
        </label>
        <input
          id="op-name"
          v-model="name"
          type="text"
          required
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div class="flex gap-2">
        <button
          type="submit"
          class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          {{ editingId !== null ? t('common.save') : t('operators.add') }}
        </button>
        <button
          v-if="editingId !== null"
          type="button"
          class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="cancelEdit"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </form>

    <!-- Operator list -->
    <OperatorList
      :operators="operatorStore.operators"
      @edit="startEdit"
      @delete="deleteTarget = $event"
    />

    <!-- Delete confirmation -->
    <ConfirmDialog
      :open="deleteTarget !== null"
      :title="t('operators.delete')"
      :message="t('operators.deleteConfirm', { name: deleteTarget?.callsign ?? '' })"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
