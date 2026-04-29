<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'
import { usePwaInstall } from '../composables/usePwaInstall'
import LocatorInput from '../components/common/LocatorInput.vue'
import PropagationConsentDialog from '../components/propagation/PropagationConsentDialog.vue'
import { backfillMissing, clearAllPropagationData, type BackfillProgress } from '../services/propagation/propagationService'
import { useQsoStore } from '../stores/qsoStore'
const { t } = useI18n()
const settings = useSettingsStore()
const qsoStore = useQsoStore()
const { canInstall, promptInstall } = usePwaInstall()

const showConsentDialog = ref(false)
const backfillRunning = ref(false)
const backfillProgress = ref<BackfillProgress>({ done: 0, total: 0, updated: 0 })
const backfillMessage = ref<string>('')
let backfillController: AbortController | null = null

onMounted(() => {
  settings.loadSettings()
})

async function startBackfill() {
  if (backfillRunning.value) return
  backfillRunning.value = true
  backfillMessage.value = ''
  backfillProgress.value = { done: 0, total: 0, updated: 0 }
  backfillController = new AbortController()
  try {
    const result = await backfillMissing(
      (p) => { backfillProgress.value = p },
      backfillController.signal,
    )
    if (result.total === 0) {
      backfillMessage.value = t('settings.propagation.backfillNothing')
    } else {
      backfillMessage.value = t('settings.propagation.backfillDone', { count: result.updated })
    }
    await qsoStore.loadRecentQsos()
  } finally {
    backfillRunning.value = false
    backfillController = null
  }
}

function cancelBackfill() {
  backfillController?.abort()
}

async function resetPropagationData() {
  if (backfillRunning.value) return
  await clearAllPropagationData()
  backfillMessage.value = t('settings.propagation.resetDone')
  await qsoStore.loadRecentQsos()
}

function onPropagationToggle(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    // Vorsicht: erst nach Consent aktivieren
    target.checked = false
    showConsentDialog.value = true
  } else {
    settings.revokePropagationConsent()
  }
}

function onConsentAccept() {
  showConsentDialog.value = false
  settings.grantPropagationConsent()
}

function onConsentCancel() {
  showConsentDialog.value = false
}
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

    <!-- Propagation -->
    <section class="space-y-2">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('settings.propagation.heading') }}</h2>
      <label class="flex items-start gap-3">
        <input
          id="settings-propagation-toggle"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          :checked="settings.propagation.enabled"
          @change="onPropagationToggle"
        />
        <span class="space-y-1">
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('settings.propagation.toggleLabel') }}
          </span>
          <span class="block text-xs text-gray-500 dark:text-gray-400">
            {{ t('settings.propagation.toggleHint') }}
          </span>
        </span>
      </label>

      <div v-if="settings.propagation.enabled" class="flex flex-wrap items-center gap-3 pt-2">
        <button
          :disabled="backfillRunning"
          class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          @click="startBackfill"
        >
          {{ t('settings.propagation.backfillButton') }}
        </button>
        <button
          v-if="backfillRunning"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="cancelBackfill"
        >
          {{ t('settings.propagation.backfillCancel') }}
        </button>
        <button
          v-else
          class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="resetPropagationData"
        >
          {{ t('settings.propagation.resetButton') }}
        </button>
        <span v-if="backfillRunning" class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('settings.propagation.backfillRunning', { done: backfillProgress.done, total: backfillProgress.total }) }}
        </span>
        <span v-else-if="backfillMessage" class="text-xs text-gray-600 dark:text-gray-300">
          {{ backfillMessage }}
        </span>
      </div>
      <p v-if="settings.propagation.enabled" class="text-xs text-gray-500 dark:text-gray-400">
        {{ t('settings.propagation.resetHint') }}
      </p>
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

    <PropagationConsentDialog
      :open="showConsentDialog"
      @accept="onConsentAccept"
      @cancel="onConsentCancel"
    />
  </div>
</template>
