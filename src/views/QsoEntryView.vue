<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useQsoStore } from '../stores/qsoStore'
import { useOperatorStore } from '../stores/operatorStore'
import { qsoRepository } from '../db/repositories/qsoRepository'
import QsoForm from '../components/qso/QsoForm.vue'
import { formatUtcDateTime } from '../utils/dateTime'
import { toFlagEmoji } from '../utils/dxcc'
import type { QSO } from '../types/qso'

const { t } = useI18n()
const route = useRoute()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()
const editQso = ref<QSO | undefined>(undefined)

watch(
  () => route.query.edit,
  async (editId) => {
    qsoStore.loadRecentQsos()
    if (editId) {
      editQso.value = await qsoRepository.getById(Number(editId))
    } else {
      editQso.value = undefined
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ editQso ? t('qso.editTitle') : t('qso.title') }}
    </h1>

    <QsoForm :edit-qso="editQso" />

    <!-- Recent QSOs -->
    <div v-if="qsoStore.recentQsos.length > 0">
      <h2 class="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {{ t('qso.recentQsos') }}
      </h2>
      <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.sequenceNumber') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.date') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.callsign') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.mode') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.band') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.rstSent') }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.rstReceived') }}</th>
              <th v-if="operatorStore.hasMultipleOperators" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{{ t('qso.operator') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <tr v-for="qso in qsoStore.recentQsos" :key="qso.id" class="text-sm text-gray-700 dark:text-gray-300">
              <td class="px-3 py-2 font-mono">{{ qso.sequenceNumber }}</td>
              <td class="px-3 py-2">{{ formatUtcDateTime(qso.date) }}</td>
              <td class="px-3 py-2 font-semibold">
                <span v-if="qso.countryCode" :title="qso.country" class="mr-1">{{ toFlagEmoji(qso.countryCode) }}</span>{{ qso.callsign }}
              </td>
              <td class="px-3 py-2">{{ qso.mode }}</td>
              <td class="px-3 py-2">{{ qso.band }}</td>
              <td class="px-3 py-2">{{ qso.rstSent }}</td>
              <td class="px-3 py-2">{{ qso.rstReceived }}</td>
              <td v-if="operatorStore.hasMultipleOperators" class="px-3 py-2">{{ operatorStore.operators.find(o => o.id === qso.operatorId)?.callsign ?? '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
