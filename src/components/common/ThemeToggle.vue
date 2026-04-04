<script setup lang="ts">
import { useSettingsStore } from '../../stores/settingsStore'
import { useI18n } from 'vue-i18n'
import type { ThemeMode } from '../../types/settings'

const settings = useSettingsStore()
const { t } = useI18n()

const themes: { value: ThemeMode; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
  { value: 'system', labelKey: 'settings.themeSystem' },
]

function setTheme(mode: ThemeMode) {
  settings.setSetting('theme', mode)
}
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="radiogroup" :aria-label="t('settings.theme')">
    <button
      v-for="option in themes"
      :key="option.value"
      role="radio"
      :aria-checked="settings.theme === option.value"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      :class="settings.theme === option.value
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      @click="setTheme(option.value)"
    >
      {{ t(option.labelKey) }}
    </button>
  </div>
</template>
