<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useOperatorStore } from '../../stores/operatorStore'
import FlagIcon from '../common/FlagIcon.vue'
import PropagationBadge from '../propagation/PropagationBadge.vue'
import { formatUtcDateTime } from '../../utils/dateTime'
import type { QSO } from '../../types/qso'

defineProps<{
  qsos: QSO[]
}>()

const { t } = useI18n()
const operatorStore = useOperatorStore()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <caption class="sr-only">{{ t('dashboard.recentQsos') }}</caption>
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.sequenceNumber') }}</th>
          <th scope="col" class="whitespace-nowrap px-2 py-2 md:px-3 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.date') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.callsign') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.mode') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.band') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.rstSent') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.rstReceived') }}</th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('propagation.title') }}</th>
          <th v-if="operatorStore.hasMultipleOperators" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-600 dark:text-gray-300">{{ t('qso.operator') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
        <tr v-for="qso in qsos" :key="qso.id" class="text-sm text-gray-700 dark:text-gray-300">
          <td class="px-3 py-2 font-mono">{{ qso.sequenceNumber }}</td>
          <td class="whitespace-nowrap px-2 py-2 text-base md:px-3 md:text-sm">{{ formatUtcDateTime(qso.date) }}</td>
          <td class="px-3 py-2 font-semibold">
            <div v-if="qso.countryCode" class="inline-flex items-center gap-1" :title="qso.country">
              <FlagIcon :iso2="qso.countryCode" />
              <span>{{ qso.callsign }}</span>
            </div>
            <span v-else>{{ qso.callsign }}</span>
          </td>
          <td class="px-3 py-2">{{ qso.mode }}</td>
          <td class="px-3 py-2">{{ qso.band }}</td>
          <td class="px-3 py-2">{{ qso.rstSent }}</td>
          <td class="px-3 py-2">{{ qso.rstReceived }}</td>
          <td class="px-3 py-2">
            <PropagationBadge :propagation="qso.propagation" compact />
          </td>
          <td v-if="operatorStore.hasMultipleOperators" class="px-3 py-2">{{ operatorStore.operators.find(o => o.id === qso.operatorId)?.callsign ?? '' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
