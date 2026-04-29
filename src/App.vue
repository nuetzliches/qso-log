<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLayout from './components/common/AppLayout.vue'
import { useDocumentLang } from './composables/useDocumentLang'
import { usePwaInstall } from './composables/usePwaInstall'
import { useServiceWorker } from './composables/useServiceWorker'
import { useStoragePersistence } from './composables/useStoragePersistence'

const { t } = useI18n()
const { needRefresh, offlineReady, updateServiceWorker, close } = useServiceWorker()
const { showInstallBanner, promptInstall, dismissInstall } = usePwaInstall()
useStoragePersistence()
useDocumentLang()
</script>

<template>
  <AppLayout />

  <!-- PWA update / offline-ready notification -->
  <div
    v-if="needRefresh || offlineReady"
    role="alert"
    class="fixed bottom-20 left-4 right-4 z-[950] mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 md:bottom-4"
  >
    <p v-if="offlineReady" class="text-sm text-gray-700 dark:text-gray-300">
      {{ t('common.offlineReady') }}
    </p>
    <p v-else class="text-sm text-gray-700 dark:text-gray-300">
      {{ t('common.updateAvailable') }}
    </p>
    <div class="mt-2 flex gap-2">
      <button
        v-if="needRefresh"
        class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
        @click="updateServiceWorker()"
      >
        {{ t('common.update') }}
      </button>
      <button
        class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        @click="close()"
      >
        {{ t('common.close') }}
      </button>
    </div>
  </div>

  <!-- PWA install prompt -->
  <div
    v-if="showInstallBanner"
    role="complementary"
    aria-label="Install app"
    class="fixed bottom-20 left-4 right-4 z-[950] mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 md:bottom-4"
  >
    <p class="text-sm text-gray-700 dark:text-gray-300">
      {{ t('common.installPrompt') }}
    </p>
    <div class="mt-2 flex gap-2">
      <button
        class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
        @click="promptInstall()"
      >
        {{ t('common.install') }}
      </button>
      <button
        class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        @click="dismissInstall()"
      >
        {{ t('common.close') }}
      </button>
    </div>
  </div>
</template>
