<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQsoStore } from '../../stores/qsoStore'
import { useOperatorStore } from '../../stores/operatorStore'
import { useNextSequenceNumber } from '../../composables/useNextSequenceNumber'
import { useCallsignLookup } from '../../composables/useCallsignLookup'
import { usePreviousContact } from '../../composables/usePreviousContact'
import { nowUtcIso, formatUtcDate, formatUtcTime } from '../../utils/dateTime'
import { getDefaultRst } from '../../utils/rst'
import { lookupDxcc } from '../../utils/dxcc'
import ModeSelect from './ModeSelect.vue'
import BandSelect from './BandSelect.vue'
import OperatorSelect from '../operators/OperatorSelect.vue'
import LocatorInput from '../common/LocatorInput.vue'
import FlagIcon from '../common/FlagIcon.vue'
import { useFormDraftStore } from '../../stores/formDraftStore'
import { useSettingsStore } from '../../stores/settingsStore'
import type { QslStatus, QSO } from '../../types/qso'

const props = defineProps<{ editQso?: QSO }>()

const { t } = useI18n()
const router = useRouter()
const qsoStore = useQsoStore()
const operatorStore = useOperatorStore()
const { nextNumber, refresh: refreshSequenceNumber } = useNextSequenceNumber()
const { info: callsignInfo, loading: lookupLoading, lookup: lookupCallsign, clear: clearLookup } = useCallsignLookup()
const { previousQsos, lookup: lookupPrevious, clear: clearPrevious } = usePreviousContact()
const formDraft = useFormDraftStore()
const settings = useSettingsStore()

const savedMessage = ref(false)

// Form fields
const date = ref(formatUtcDate(nowUtcIso()))
const time = ref(formatUtcTime(nowUtcIso()))
const callsign = ref('')
const name = ref('')
const mode = ref('SSB')
const power = ref('')
const frequency = ref('')
const band = ref('')
const rstSent = ref('59')
const rstReceived = ref('59')
const remarks = ref('')
const qslSent = ref<QslStatus>('no')
const qslReceived = ref<QslStatus>('no')
const locator = ref('')
const myLocator = ref('')
const operatorId = ref(0)
const country = ref('')
const countryCode = ref('')

// Update RST defaults when mode changes
watch(mode, (newMode) => {
  if (newMode) {
    const defaultRst = getDefaultRst(newMode)
    rstSent.value = defaultRst
    rstReceived.value = defaultRst
  }
})

// Auto-fill name and locator from previous contacts
watch(previousQsos, (qsos) => {
  if (qsos.length > 0) {
    if (!name.value) {
      const withName = qsos.find(q => q.name)
      if (withName?.name) name.value = withName.name
    }
    if (!locator.value) {
      const withLocator = qsos.find(q => q.locator)
      if (withLocator?.locator) locator.value = withLocator.locator
    }
  }
})

// Auto-fill name, locator and country from external callsign lookup (overrides local DXCC)
watch(callsignInfo, (info) => {
  if (info?.name && !name.value) name.value = info.name
  if (info?.locator && !locator.value) locator.value = info.locator
  if (info?.country) country.value = info.country
})

function resetToNew() {
  date.value = formatUtcDate(nowUtcIso())
  time.value = formatUtcTime(nowUtcIso())
  callsign.value = ''
  name.value = ''
  country.value = ''
  countryCode.value = ''
  locator.value = ''
  myLocator.value = settings.ownLocator
  mode.value = 'SSB'
  power.value = ''
  frequency.value = ''
  band.value = ''
  rstSent.value = '59'
  rstReceived.value = '59'
  remarks.value = ''
  qslSent.value = 'no'
  qslReceived.value = 'no'
  operatorId.value = operatorStore.currentOperator?.id ?? 0
}

watch(
  () => props.editQso,
  (q) => {
    if (q) {
      const d = q.date // ISO string like "2024-01-15T14:30:00.000Z"
      date.value = d.slice(0, 10)
      time.value = d.slice(11, 16)
      callsign.value = q.callsign
      name.value = q.name ?? ''
      country.value = q.country ?? ''
      countryCode.value = q.countryCode ?? ''
      locator.value = q.locator ?? ''
      myLocator.value = q.myLocator ?? ''
      mode.value = q.mode ?? ''
      power.value = q.power ?? ''
      frequency.value = q.frequency ?? ''
      band.value = q.band ?? ''
      rstSent.value = q.rstSent ?? ''
      rstReceived.value = q.rstReceived ?? ''
      remarks.value = q.remarks ?? ''
      qslSent.value = q.qslSent
      qslReceived.value = q.qslReceived
      operatorId.value = q.operatorId
    } else {
      resetToNew()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await operatorStore.loadOperators()

  if (props.editQso) return

  if (formDraft.hasDraft && formDraft.draft) {
    const d = formDraft.draft
    date.value = d.date
    time.value = d.time
    callsign.value = d.callsign
    name.value = d.name
    country.value = d.country
    countryCode.value = d.countryCode
    locator.value = d.locator
    myLocator.value = d.myLocator
    mode.value = d.mode
    power.value = d.power
    frequency.value = d.frequency
    band.value = d.band
    rstSent.value = d.rstSent
    rstReceived.value = d.rstReceived
    remarks.value = d.remarks
    qslSent.value = d.qslSent
    qslReceived.value = d.qslReceived
    operatorId.value = d.operatorId
    formDraft.clearDraft()
    if (callsign.value.length >= 3) {
      lookupCallsign(callsign.value)
      lookupPrevious(callsign.value)
    }
  } else {
    if (operatorStore.currentOperator?.id) {
      operatorId.value = operatorStore.currentOperator.id
    }
    myLocator.value = settings.ownLocator
  }
})

function persistDraft() {
  if (props.editQso) return
  if (callsign.value || remarks.value) {
    formDraft.saveDraft({
      date: date.value,
      time: time.value,
      callsign: callsign.value,
      name: name.value,
      country: country.value,
      countryCode: countryCode.value,
      locator: locator.value,
      myLocator: myLocator.value,
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
  } else {
    formDraft.clearDraft()
  }
}

// Auto-save draft to localStorage so data survives page reloads (e.g. SW updates)
const draftKey = computed(() =>
  [callsign.value, name.value, remarks.value, mode.value, band.value, frequency.value, power.value, locator.value].join('|'),
)

let autoSaveTimer: ReturnType<typeof setTimeout> | undefined
watch(draftKey, () => {
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(persistDraft, 500)
})

onBeforeUnmount(() => {
  clearTimeout(autoSaveTimer)
  persistDraft()
})

function handleCallsignInput(event: Event) {
  callsign.value = (event.target as HTMLInputElement).value.toUpperCase()
  const dxcc = lookupDxcc(callsign.value)
  if (dxcc) {
    country.value = dxcc.country
    countryCode.value = dxcc.iso2 ?? ''
  } else {
    country.value = ''
    countryCode.value = ''
  }
  lookupCallsign(callsign.value)
  lookupPrevious(callsign.value)
}

function setNow() {
  const now = nowUtcIso()
  date.value = formatUtcDate(now)
  time.value = formatUtcTime(now)
}

async function handleSubmit() {
  const isoDate = `${date.value}T${time.value}:00.000Z`

  if (props.editQso?.id) {
    await qsoStore.updateQso(props.editQso.id, {
      date: isoDate,
      callsign: callsign.value.toUpperCase(),
      name: name.value || undefined,
      locator: locator.value || undefined,
      myLocator: myLocator.value || undefined,
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
    router.push({ name: 'qso-history' })
    return
  }

  await qsoStore.addQso({
    date: isoDate,
    callsign: callsign.value.toUpperCase(),
    name: name.value || undefined,
    country: country.value || undefined,
    countryCode: countryCode.value || undefined,
    locator: locator.value || undefined,
    myLocator: myLocator.value || undefined,
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

  // Smart defaults: keep mode, power, frequency, band, operator, myLocator
  callsign.value = ''
  name.value = ''
  country.value = ''
  countryCode.value = ''
  locator.value = ''
  remarks.value = ''
  clearLookup()
  clearPrevious()
  formDraft.clearDraft()
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
    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span class="font-medium">{{ t('qso.sequenceNumber') }}</span>
      <span class="rounded bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-800">{{ props.editQso ? props.editQso.sequenceNumber : nextNumber }}</span>
      <span v-if="props.editQso?.updatedAt" class="text-xs text-amber-600 dark:text-amber-400">
        {{ t('qso.updatedAt') }}: {{ new Date(props.editQso.updatedAt).toLocaleString() }}
      </span>
    </div>

    <!-- Operator -->
    <OperatorSelect v-model="operatorId" />

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
        <div class="flex items-center justify-between">
          <label for="qso-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('qso.time') }}
          </label>
          <button
            type="button"
            @click="setNow()"
            :aria-label="t('a11y.setNow')"
            :title="t('a11y.setNow')"
            class="rounded p-0.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </div>
        <input
          id="qso-time"
          v-model="time"
          type="time"
          required
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Callsign & Name -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between">
          <label for="qso-callsign" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('qso.callsign') }}
          </label>
          <span v-if="country" class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300" :title="country">
            <span v-if="countryCode" class="inline-flex items-center gap-1">[{{ countryCode }}] <FlagIcon :iso2="countryCode" /></span>
            <span v-else>{{ country }}</span>
          </span>
        </div>
        <input
          id="qso-callsign"
          v-model="callsign"
          type="text"
          required
          autocomplete="off"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @input="handleCallsignInput($event)"
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

      <div>
        <label for="qso-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('qso.name') }}
        </label>
        <input
          id="qso-name"
          v-model="name"
          type="text"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Locator (contact) & own locator -->
    <div class="grid grid-cols-2 gap-4">
      <LocatorInput
        v-model="locator"
        :own-locator="myLocator"
        :show-distance="true"
        :label="t('qso.locator')"
        id="qso-locator"
      />
      <LocatorInput
        v-model="myLocator"
        :show-distance="false"
        :show-gps-button="true"
        :label="t('qso.myLocator')"
        id="qso-my-locator"
      />
    </div>

    <!-- Previous contacts -->
    <div
      v-if="previousQsos.length > 0"
      class="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-200"
    >
      <div class="mb-1.5 font-medium">{{ t('qso.previousContact') }}</div>
      <div class="space-y-1">
        <div v-for="qso in previousQsos" :key="qso.id" class="flex items-center gap-2">
          <span class="w-20 shrink-0">{{ qso.date.slice(0, 10) }}</span>
          <span class="w-11 shrink-0">{{ qso.date.slice(11, 16) }}</span>
          <span class="w-10 shrink-0 font-medium">{{ qso.mode }}</span>
          <span class="w-12 shrink-0">{{ qso.band }}</span>
          <router-link
            :to="{ name: 'qso-entry', query: { edit: String(qso.id) } }"
            class="ml-auto shrink-0 text-green-600 underline hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
          >
            {{ t('common.open') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mode & Power -->
    <div class="grid grid-cols-2 gap-4">
      <ModeSelect v-model="mode" :label="t('qso.mode')" id="qso-mode" />

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

    <!-- RST & QSL in einer Zeile (4 Spalten) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        {{ editQso ? t('common.update') : t('qso.save') }}
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
