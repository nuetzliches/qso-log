<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQsoStore } from '../../stores/qsoStore'
import { useOperatorStore } from '../../stores/operatorStore'
import { useNextSequenceNumber } from '../../composables/useNextSequenceNumber'
import { useCallsignLookup } from '../../composables/useCallsignLookup'
import { nowUtcIso, formatUtcDate, formatUtcTime } from '../../utils/dateTime'
import { getDefaultRst } from '../../utils/rst'
import ModeSelect from './ModeSelect.vue'
import BandSelect from './BandSelect.vue'
import OperatorSelect from '../operators/OperatorSelect.vue'
import type { QslStatus } from '../../types/qso'

const { t } = useI18n()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()
const { nextNumber, refresh: refreshSequenceNumber } = useNextSequenceNumber()
const { info: callsignInfo, loading: lookupLoading, lookup: lookupCallsign, clear: clearLookup } = useCallsignLookup()

const savedMessage = ref(false)

// Form fields
const date = ref(formatUtcDate(nowUtcIso()))
const time = ref(formatUtcTime(nowUtcIso()))
const callsign = ref('')
const mode = ref('SSB')
const power = ref('')
const frequency = ref('')
const band = ref('')
const rstSent = ref('59')
const rstReceived = ref('59')
const remarks = ref('')
const qslSent = ref<QslStatus>('no')
const qslReceived = ref<QslStatus>('no')
const operatorId = ref(0)

// Update RST defaults when mode changes
watch(mode, (newMode) => {
  if (newMode) {
    const defaultRst = getDefaultRst(newMode)
    rstSent.value = defaultRst
    rstReceived.value = defaultRst
  }
})

onMounted(async () => {
  await operatorStore.loadOperators()
  if (operatorStore.currentOperator?.id) {
    operatorId.value = operatorStore.currentOperator.id
  }
})

async function handleSubmit() {
  const isoDate = `${date.value}T${time.value}:00.000Z`

  await qsoStore.addQso({
    date: isoDate,
    callsign: callsign.value.toUpperCase(),
    mode: mode.value,
    power: power.value,
    frequency: frequency.value,
    band: band.value,
    rstSent: rstSent.value,
    rstReceived: rstReceived.value,
    remarks: remarks.value,
    qslSent: qslSent.value,
    qslReceived: qslReceived.value,
    operatorId: operatorId.value,
  })

  // Smart defaults: keep mode, power, frequency, band, operator
  callsign.value = ''
  remarks.value = ''
  clearLookup()
  const now = nowUtcIso()
  date.value = formatUtcDate(now)
  time.value = formatUtcTime(now)
  qslSent.value = 'no'
  qslReceived.value = 'no'

  await refreshSequenceNumber()

  savedMessage.value = true
  setTimeout(() => {
    savedMessage.value = false
  }, 3000)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Sequence number (read-only) -->
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span class="font-medium">{{ t('qso.sequenceNumber') }}</span>
      <span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800">{{ nextNumber }}</span>
    </div>

    <!-- Date & Time -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="qso-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.date') }}
        </label>
        <input
          id="qso-date"
          v-model="date"
          type="date"
          required
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label for="qso-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          UTC
        </label>
        <input
          id="qso-time"
          v-model="time"
          type="time"
          required
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Callsign -->
    <div>
      <label for="qso-callsign" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('qso.callsign') }}
      </label>
      <input
        id="qso-callsign"
        v-model="callsign"
        type="text"
        required
        autocomplete="off"
        class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        @input="callsign = ($event.target as HTMLInputElement).value.toUpperCase(); lookupCallsign(callsign)"
      />
      <!-- Callsign lookup info -->
      <div v-if="lookupLoading" class="mt-1 text-xs text-gray-400">
        Looking up...
      </div>
      <div
        v-else-if="callsignInfo"
        class="mt-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
      >
        <span class="font-medium">{{ callsignInfo.name }}</span>
        <span v-if="callsignInfo.qth"> &middot; {{ callsignInfo.qth }}</span>
        <span v-if="callsignInfo.country"> &middot; {{ callsignInfo.country }}</span>
        <span v-if="callsignInfo.locator"> &middot; {{ callsignInfo.locator }}</span>
        <span class="ml-1 text-blue-500 dark:text-blue-400">({{ callsignInfo.provider }})</span>
      </div>
    </div>

    <!-- Mode -->
    <ModeSelect v-model="mode" :label="t('qso.mode')" id="qso-mode" />

    <!-- Power -->
    <div>
      <label for="qso-power" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('qso.power') }}
      </label>
      <input
        id="qso-power"
        v-model="power"
        type="text"
        placeholder="100W"
        class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>

    <!-- Frequency & Band -->
    <BandSelect
      v-model:frequency="frequency"
      v-model:band="band"
      :frequency-label="t('qso.frequency')"
      :band-label="t('qso.band')"
      frequency-id="qso-frequency"
      band-id="qso-band"
    />

    <!-- RST Sent & Received -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="qso-rst-sent" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.rstSent') }}
        </label>
        <input
          id="qso-rst-sent"
          v-model="rstSent"
          type="text"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label for="qso-rst-received" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.rstReceived') }}
        </label>
        <input
          id="qso-rst-received"
          v-model="rstReceived"
          type="text"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- QSL Sent & Received -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="qso-qsl-sent" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.qslSent') }}
        </label>
        <select
          id="qso-qsl-sent"
          v-model="qslSent"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="no">{{ t('common.no') }}</option>
          <option value="yes">{{ t('common.yes') }}</option>
          <option value="requested">{{ t('common.requested') }}</option>
        </select>
      </div>
      <div>
        <label for="qso-qsl-received" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.qslReceived') }}
        </label>
        <select
          id="qso-qsl-received"
          v-model="qslReceived"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="no">{{ t('common.no') }}</option>
          <option value="yes">{{ t('common.yes') }}</option>
          <option value="requested">{{ t('common.requested') }}</option>
        </select>
      </div>
    </div>

    <!-- Operator -->
    <OperatorSelect v-model="operatorId" />

    <!-- Remarks -->
    <div>
      <label for="qso-remarks" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('qso.remarks') }}
      </label>
      <textarea
        id="qso-remarks"
        v-model="remarks"
        rows="2"
        class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>

    <!-- Submit -->
    <div class="flex items-center gap-4">
      <button
        type="submit"
        class="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
      >
        {{ t('qso.save') }}
      </button>

      <!-- Success feedback (aria-live for screen readers) -->
      <div aria-live="polite">
        <span
          v-if="savedMessage"
          class="text-sm font-medium text-green-600 dark:text-green-400"
        >
          {{ t('qso.saved') }}
        </span>
      </div>
    </div>
  </form>
</template>
