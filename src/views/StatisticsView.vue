<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatistics } from '../composables/useStatistics'
import { useOperatorStore } from '../stores/operatorStore'
import StatisticsFilter from '../components/statistics/StatisticsFilter.vue'
import BandModeTab from '../components/statistics/tabs/BandModeTab.vue'
import ActivityTab from '../components/statistics/tabs/ActivityTab.vue'
import DxccTab from '../components/statistics/tabs/DxccTab.vue'
import DistanceTab from '../components/statistics/tabs/DistanceTab.vue'
import PropagationTab from '../components/statistics/tabs/PropagationTab.vue'
import { useSettingsStore } from '../stores/settingsStore'

const { t } = useI18n()
const { qsos, loading, selectedOperatorId, loadQsos } = useStatistics()
const operatorStore = useOperatorStore()
const settings = useSettingsStore()

const activeTab = ref(0)
const tabRefs = ref<HTMLButtonElement[]>([])

const tabs = computed(() => {
  const base = [
    { key: 'bandMode', labelKey: 'statistics.tabBandMode' },
    { key: 'activity', labelKey: 'statistics.tabActivity' },
    { key: 'dxcc', labelKey: 'statistics.tabDxcc' },
    { key: 'distance', labelKey: 'statistics.tabDistance' },
  ]
  if (settings.propagation.enabled) {
    base.push({ key: 'propagation', labelKey: 'propagation.title' })
  }
  return base
})

async function focusTab(index: number) {
  activeTab.value = index
  await nextTick()
  tabRefs.value[index]?.focus()
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  const lastIndex = tabs.value.length - 1
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      focusTab(index === lastIndex ? 0 : index + 1)
      break
    case 'ArrowLeft':
      event.preventDefault()
      focusTab(index === 0 ? lastIndex : index - 1)
      break
    case 'Home':
      event.preventDefault()
      focusTab(0)
      break
    case 'End':
      event.preventDefault()
      focusTab(lastIndex)
      break
  }
}

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
      <div role="tablist" :aria-label="t('statistics.title')" class="-mb-px flex gap-1 overflow-x-auto">
        <button
          v-for="(tab, i) in tabs"
          :key="tab.key"
          :ref="(el) => { if (el) tabRefs[i] = el as HTMLButtonElement }"
          :id="`stats-tab-${tab.key}`"
          role="tab"
          type="button"
          :aria-selected="activeTab === i"
          :aria-controls="`stats-panel-${tab.key}`"
          :tabindex="activeTab === i ? 0 : -1"
          class="whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          :class="activeTab === i
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200'"
          @click="activeTab = i"
          @keydown="onTabKeydown($event, i)"
        >
          {{ t(tab.labelKey) }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" role="status" :aria-label="t('a11y.loading')" />
    </div>

    <!-- Tab content -->
    <div v-else>
      <div
        v-show="activeTab === 0"
        id="stats-panel-bandMode"
        role="tabpanel"
        aria-labelledby="stats-tab-bandMode"
        tabindex="0"
      >
        <BandModeTab v-if="activeTab === 0" :qsos="qsos" />
      </div>
      <div
        v-show="activeTab === 1"
        id="stats-panel-activity"
        role="tabpanel"
        aria-labelledby="stats-tab-activity"
        tabindex="0"
      >
        <ActivityTab v-if="activeTab === 1" :qsos="qsos" />
      </div>
      <div
        v-show="activeTab === 2"
        id="stats-panel-dxcc"
        role="tabpanel"
        aria-labelledby="stats-tab-dxcc"
        tabindex="0"
      >
        <DxccTab v-if="activeTab === 2" :qsos="qsos" />
      </div>
      <div
        v-show="activeTab === 3"
        id="stats-panel-distance"
        role="tabpanel"
        aria-labelledby="stats-tab-distance"
        tabindex="0"
      >
        <DistanceTab v-if="activeTab === 3" :qsos="qsos" />
      </div>
      <div
        v-if="settings.propagation.enabled"
        v-show="activeTab === 4"
        id="stats-panel-propagation"
        role="tabpanel"
        aria-labelledby="stats-tab-propagation"
        tabindex="0"
      >
        <PropagationTab v-if="activeTab === 4" :qsos="qsos" />
      </div>
    </div>
  </div>
</template>
