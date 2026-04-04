<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQsoStore } from '../stores/qsoStore'
import { useOperatorStore } from '../stores/operatorStore'
import { useExportImport } from '../composables/useExportImport'
import { usePdfReport } from '../composables/usePdfReport'
import QsoFilters from '../components/qso/QsoFilters.vue'
import QsoTable from '../components/qso/QsoTable.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import FileDropZone from '../components/common/FileDropZone.vue'
import type { QSO, QSOFilters as QSOFiltersType } from '../types/qso'
import type { ExportFormat } from '../types/export'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const { t } = useI18n()
const router = useRouter()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()
const { importResult, importing, doExport, prepareImport, confirmImport, cancelImport } = useExportImport()
const { generate: generatePdf } = usePdfReport()

const filtersOpen = ref(typeof window !== 'undefined' && window.innerWidth >= 768)
const deleteTarget = ref<QSO | null>(null)
const showExportDialog = ref(false)
const showImportDialog = ref(false)

onMounted(async () => {
  await operatorStore.loadOperators()
  await qsoStore.loadQsos()
})

function handleFilter(filters: QSOFiltersType) {
  qsoStore.loadQsos(filters, undefined, { page: 1, pageSize: 25 })
}

function handleSort(field: keyof QSO) {
  const currentSort = qsoStore.sort
  const direction = currentSort.field === field && currentSort.direction === 'desc' ? 'asc' : 'desc'
  qsoStore.loadQsos(undefined, { field, direction })
}

function handlePage(page: number) {
  qsoStore.loadQsos(undefined, undefined, { page, pageSize: 25 })
}

async function confirmDelete() {
  if (deleteTarget.value?.id) {
    await qsoStore.deleteQso(deleteTarget.value.id)
  }
  deleteTarget.value = null
}

function handleExport(format: ExportFormat) {
  doExport(qsoStore.qsos, format)
  showExportDialog.value = false
}

async function handleFileSelected(file: File) {
  await prepareImport(file)
}

async function handleConfirmImport() {
  await confirmImport()
  showImportDialog.value = false
  await qsoStore.loadQsos()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('history.title') }}
    </h1>

    <!-- Collapsible filter & actions -->
    <div>
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        :aria-expanded="filtersOpen"
        aria-controls="filter-section"
        @click="filtersOpen = !filtersOpen"
      >
        {{ t('history.filter') }}
        <svg
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-180': filtersOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-show="filtersOpen" id="filter-section" class="mt-2 space-y-4">
        <QsoFilters @filter="handleFilter" />

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="showExportDialog = true"
          >
            {{ t('history.export') }}
          </button>
          <button
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="showImportDialog = true"
          >
            {{ t('history.import') }}
          </button>
          <button
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="generatePdf(qsoStore.qsos)"
          >
            {{ t('history.pdfReport') }}
          </button>
        </div>
      </div>
    </div>

    <QsoTable
      :qsos="qsoStore.qsos"
      :sort="qsoStore.sort"
      :total-count="qsoStore.totalCount"
      :current-page="qsoStore.pagination.page"
      :page-size="qsoStore.pagination.pageSize"
      @sort="handleSort"
      @page="handlePage"
      @edit="(qso) => router.push({ name: 'qso-entry', query: { edit: String(qso.id) } })"
      @delete="deleteTarget = $event"
    />

    <!-- Delete confirmation -->
    <ConfirmDialog
      :open="deleteTarget !== null"
      :title="t('qso.delete')"
      :message="t('qso.deleteConfirm')"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Export dialog -->
    <Dialog :open="showExportDialog" class="relative z-50" @close="showExportDialog = false">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('history.selectFormat') }}
          </DialogTitle>
          <div class="mt-4 flex flex-col gap-2">
            <button
              v-for="fmt in (['csv', 'json', 'adif'] as const)"
              :key="fmt"
              class="rounded-md border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="handleExport(fmt)"
            >
              {{ fmt.toUpperCase() }}
            </button>
          </div>
          <button
            class="mt-3 w-full rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="showExportDialog = false"
          >
            {{ t('common.cancel') }}
          </button>
        </DialogPanel>
      </div>
    </Dialog>

    <!-- Import dialog -->
    <Dialog :open="showImportDialog" class="relative z-50" @close="showImportDialog = false; cancelImport()">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('history.import') }}
          </DialogTitle>

          <div v-if="!importResult" class="mt-4">
            <FileDropZone @file="handleFileSelected" />
          </div>

          <div v-else class="mt-4 space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ t('history.importConfirm', importResult.qsos.length) }}
            </p>

            <div v-if="importResult.validation.errors.length > 0" class="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              {{ importResult.validation.errors.length }} validation errors
            </div>

            <!-- Preview table -->
            <div class="max-h-60 overflow-auto rounded border border-gray-200 dark:border-gray-700">
              <table class="min-w-full text-xs">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-2 py-1 text-left">{{ t('qso.callsign') }}</th>
                    <th class="px-2 py-1 text-left">{{ t('qso.date') }}</th>
                    <th class="px-2 py-1 text-left">{{ t('qso.mode') }}</th>
                    <th class="px-2 py-1 text-left">{{ t('qso.band') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(qso, i) in importResult.qsos.slice(0, 20)" :key="i" class="text-gray-700 dark:text-gray-300">
                    <td class="px-2 py-1 font-semibold">{{ qso.callsign }}</td>
                    <td class="px-2 py-1">{{ qso.date?.slice(0, 16) }}</td>
                    <td class="px-2 py-1">{{ qso.mode }}</td>
                    <td class="px-2 py-1">{{ qso.band }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end gap-2">
              <button
                class="rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                @click="cancelImport(); showImportDialog = false"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                :disabled="importing"
                class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
                @click="handleConfirmImport"
              >
                {{ t('common.confirm') }}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>
