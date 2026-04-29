<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../stores/settingsStore'
import FlagIcon from './FlagIcon.vue'

const props = withDefaults(defineProps<{ placement?: 'top' | 'bottom' }>(), { placement: 'bottom' })

const { locale, t } = useI18n()
const settings = useSettingsStore()
const open = ref(false)
const container = ref<HTMLElement | null>(null)
const button = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const locales = [
  { code: 'de', iso2: 'de', labelKey: 'settings.localeDe' },
  { code: 'en', iso2: 'gb', labelKey: 'settings.localeEn' },
]

function openDropdown() {
  if (button.value) {
    const rect = button.value.getBoundingClientRect()
    const openUpward = props.placement === 'top'
    dropdownStyle.value = {
      position: 'fixed',
      left: rect.left + 'px',
      minWidth: rect.width + 'px',
      zIndex: '9999',
      ...(openUpward
        ? { bottom: (window.innerHeight - rect.top) + 'px' }
        : { top: rect.bottom + 'px' }),
    }
  }
  open.value = true
}

function setLocale(code: string) {
  locale.value = code
  settings.setSetting('locale', code)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (container.value && !container.value.contains(e.target as Node)) {
    open.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})

const current = () => locales.find(l => l.code === locale.value) ?? locales[0]
</script>

<template>
  <div ref="container" class="relative">
    <button
      ref="button"
      :aria-label="t('settings.language')"
      :title="t(current().labelKey)"
      aria-haspopup="listbox"
      :aria-expanded="open"
      class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      @click="open ? open = false : openDropdown()"
    >
      <FlagIcon :iso2="current().iso2" />
      <span class="flex-1 text-left">{{ t(current().labelKey) }}</span>
      <!-- Chevron -->
      <svg class="h-3.5 w-3.5 flex-shrink-0 transition-transform" :class="open ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        role="listbox"
        :aria-label="t('settings.language')"
        :style="dropdownStyle"
        class="rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        <button
          v-for="loc in locales"
          :key="loc.code"
          role="option"
          :aria-selected="locale === loc.code"
          :aria-label="t(loc.labelKey)"
          class="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
          :class="locale === loc.code
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
          @click="setLocale(loc.code)"
        >
          <FlagIcon :iso2="loc.iso2" />
          {{ t(loc.labelKey) }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
