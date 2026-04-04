<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQsoStore } from '../stores/qsoStore'
import { useOperatorStore } from '../stores/operatorStore'
import QsoFilters from '../components/qso/QsoFilters.vue'
import QsoTable from '../components/qso/QsoTable.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import { ref } from 'vue'
import type { QSO, QSOFilters as QSOFiltersType } from '../types/qso'

const { t } = useI18n()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()
const deleteTarget = ref<QSO | null>(null)

onMounted(async () => {
  await operatorStore.loadOperators()
  await qsoStore.loadQsos()
})

function handleFilter(filters: QSOFiltersType) {
  qsoStore.loadQsos(filters, undefined, { page: 1, pageSize: 50 })
}

function handleSort(field: keyof QSO) {
  const currentSort = qsoStore.sort
  const direction = currentSort.field === field && currentSort.direction === 'desc' ? 'asc' : 'desc'
  qsoStore.loadQsos(undefined, { field, direction })
}

function handlePage(page: number) {
  qsoStore.loadQsos(undefined, undefined, { page, pageSize: 50 })
}

async function confirmDelete() {
  if (deleteTarget.value?.id) {
    await qsoStore.deleteQso(deleteTarget.value.id)
  }
  deleteTarget.value = null
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('history.title') }}
    </h1>

    <QsoFilters @filter="handleFilter" />

    <!-- Action buttons -->
    <div class="flex flex-wrap gap-2">
      <button class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
        {{ t('history.export') }}
      </button>
      <button class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
        {{ t('history.import') }}
      </button>
      <button class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
        {{ t('history.pdfReport') }}
      </button>
    </div>

    <QsoTable
      :qsos="qsoStore.qsos"
      :sort="qsoStore.sort"
      :total-count="qsoStore.totalCount"
      :current-page="qsoStore.pagination.page"
      :page-size="qsoStore.pagination.pageSize"
      @sort="handleSort"
      @page="handlePage"
      @edit="() => {}"
      @delete="deleteTarget = $event"
    />

    <ConfirmDialog
      :open="deleteTarget !== null"
      :title="t('qso.delete')"
      :message="t('qso.deleteConfirm')"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
