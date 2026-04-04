<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQsoStore } from '../stores/qsoStore'
import QsoForm from '../components/qso/QsoForm.vue'
import { formatUtcDateTime } from '../utils/dateTime'

const { t } = useI18n()
const qsoStore = useQsoStore()

onMounted(() => {
  qsoStore.loadRecentQsos()
})
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('qso.title') }}
    </h1>

    <QsoForm />

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
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <tr v-for="qso in qsoStore.recentQsos" :key="qso.id" class="text-sm text-gray-700 dark:text-gray-300">
              <td class="px-3 py-2 font-mono">{{ qso.sequenceNumber }}</td>
              <td class="px-3 py-2">{{ formatUtcDateTime(qso.date) }}</td>
              <td class="px-3 py-2 font-semibold">{{ qso.callsign }}</td>
              <td class="px-3 py-2">{{ qso.mode }}</td>
              <td class="px-3 py-2">{{ qso.band }}</td>
              <td class="px-3 py-2">{{ qso.rstSent }}</td>
              <td class="px-3 py-2">{{ qso.rstReceived }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
