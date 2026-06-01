<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useQsoStore } from '../stores/qsoStore'
import { qsoRepository } from '../db/repositories/qsoRepository'
import QsoForm from '../components/qso/QsoForm.vue'
import RecentQsosTable from '../components/dashboard/RecentQsosTable.vue'
import type { QSO } from '../types/qso'

const { t } = useI18n()
const route = useRoute()
const qsoStore = useQsoStore()
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
      <RecentQsosTable :qsos="qsoStore.recentQsos" />
    </div>
  </div>
</template>
