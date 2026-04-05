<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'
import ThemeToggle from '../components/common/ThemeToggle.vue'
import LocaleSwitch from '../components/common/LocaleSwitch.vue'
import LocatorInput from '../components/common/LocatorInput.vue'
const { t } = useI18n()
const settings = useSettingsStore()

onMounted(() => {
  settings.loadSettings()
})
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('settings.title') }}
    </h1>

    <!-- Language + Theme -->
    <section class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('settings.language') }}</h2>
        <LocaleSwitch />
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('settings.theme') }}</h2>
        <ThemeToggle />
      </div>
    </section>

    <!-- Own Callsign and Locator -->
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="space-y-2">
        <label for="settings-callsign" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('settings.ownCallsign') }}
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.ownCallsignHint') }}</p>
        <input
          id="settings-callsign"
          :value="settings.ownCallsign"
          type="text"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @change="settings.setSetting('ownCallsign', ($event.target as HTMLInputElement).value.toUpperCase())"
        />
      </div>

      <div class="space-y-2">
        <label for="settings-locator" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('settings.ownLocator') }}
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.ownLocatorHint') }}</p>
        <LocatorInput
          :model-value="settings.ownLocator"
          :show-distance="false"
          :label="''"
          id="settings-locator"
          @update:model-value="settings.setSetting('ownLocator', $event)"
        />
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

  </div>
</template>
