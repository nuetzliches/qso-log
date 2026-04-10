<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatistics } from '../composables/useStatistics'
import { useOperatorStore } from '../stores/operatorStore'
import StatisticsFilter from '../components/statistics/StatisticsFilter.vue'
import BandModeTab from '../components/statistics/tabs/BandModeTab.vue'
import ActivityTab from '../components/statistics/tabs/ActivityTab.vue'
import DxccTab from '../components/statistics/tabs/DxccTab.vue'
import DistanceTab from '../components/statistics/tabs/DistanceTab.vue'

const { t } = useI18n()
const { qsos, loading, selectedOperatorId, loadQsos } = useStatistics()
const operatorStore = useOperatorStore()

const activeTab = ref(0)

const tabs = [
  { key: 'bandMode', labelKey: 'statistics.tabBandMode' },
  { key: 'activity', labelKey: 'statistics.tabActivity' },
  { key: 'dxcc', labelKey: 'statistics.tabDxcc' },
  { key: 'distance', labelKey: 'statistics.tabDistance' },
]

onMounted(async () => {
  await operatorStore.loadOperators()
  await loadQsos()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('statistics.title') }}</h1>
      <StatisticsFilter
        v-model:operator-id="selectedOperatorId"
        :operators="operatorStore.operators"
        :has-multiple-operators="operatorStore.hasMultipleOperators"
      />
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-1 overflow-x-auto" aria-label="Statistics tabs">
        <button
          v-for="(tab, i) in tabs"
          :key="tab.key"
          class="whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
          :class="activeTab === i
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          @click="activeTab = i"
        >
          {{ t(tab.labelKey) }}
        </button>
      </nav>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>

    <!-- Tab content -->
    <div v-else>
      <BandModeTab v-if="activeTab === 0" :qsos="qsos" />
      <ActivityTab v-else-if="activeTab === 1" :qsos="qsos" />
      <DxccTab v-else-if="activeTab === 2" :qsos="qsos" />
      <DistanceTab v-else-if="activeTab === 3" :qsos="qsos" />
    </div>
  </div>
</template>
