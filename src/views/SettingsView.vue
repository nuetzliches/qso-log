<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'
import { usePwaInstall } from '../composables/usePwaInstall'
import LocatorInput from '../components/common/LocatorInput.vue'
const { t } = useI18n()
const settings = useSettingsStore()
const { canInstall, promptInstall } = usePwaInstall()

onMounted(() => {
  settings.loadSettings()
})
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('settings.title') }}
    </h1>

    <!-- Own Callsign and Locator -->
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="space-y-2">
        <label for="settings-callsign" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('settings.ownCallsign') }}
        </label>
        <input
          id="settings-callsign"
          :value="settings.ownCallsign"
          type="text"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @change="settings.setSetting('ownCallsign', ($event.target as HTMLInputElement).value.toUpperCase())"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.ownCallsignHint') }}</p>
      </div>

      <div class="space-y-2">
        <LocatorInput
          :model-value="settings.ownLocator"
          :show-distance="false"
          :show-gps-button="true"
          :label="t('settings.ownLocator')"
          id="settings-locator"
          @update:model-value="settings.setSetting('ownLocator', $event)"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.ownLocatorHint') }}</p>
      </div>
    </section>

    <!-- Callsign Lookup -->
    <section class="space-y-4">
      <div>
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('settings.callsignLookup') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.callsignLookupHint') }}</p>
      </div>

      <!-- QRZ.com + HamQTH -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="settings-qrz" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('settings.qrzApiKey') }}
          </label>
          <input
            id="settings-qrz"
            :value="settings.qrzApiKey"
            type="password"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @change="settings.setSetting('qrzApiKey', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- HamQTH -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="settings-hamqth-user" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('settings.hamqthUsername') }}
          </label>
          <input
            id="settings-hamqth-user"
            :value="settings.hamqthUsername"
            type="text"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @change="settings.setSetting('hamqthUsername', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label for="settings-hamqth-pass" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('settings.hamqthPassword') }}
          </label>
          <input
            id="settings-hamqth-pass"
            :value="settings.hamqthPassword"
            type="password"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            @change="settings.setSetting('hamqthPassword', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </section>

    <!-- PWA Install -->
    <section>
      <button
        :disabled="!canInstall"
        :title="!canInstall ? t('settings.installAppUnavailable') : ''"
        class="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canInstall ? 'bg-primary-600 text-white hover:bg-primary-500' : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'"
        @click="promptInstall()"
      >
        {{ t('settings.installApp') }}
      </button>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('settings.installAppHint') }}</p>
    </section>

  </div>
</template>
