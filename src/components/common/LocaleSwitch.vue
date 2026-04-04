<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../stores/settingsStore'

const { locale } = useI18n()
const settings = useSettingsStore()

const locales = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
]

function setLocale(code: string) {
  locale.value = code
  settings.setSetting('locale', code)
}
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="radiogroup" aria-label="Language">
    <button
      v-for="loc in locales"
      :key="loc.code"
      role="radio"
      :aria-checked="locale === loc.code"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      :class="locale === loc.code
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      @click="setLocale(loc.code)"
    >
      {{ loc.label }}
    </button>
  </div>
</template>
