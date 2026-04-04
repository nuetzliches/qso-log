<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/vue'
import { COMMON_FREQUENCIES, parseFrequency, frequencyToBand } from '../../utils/frequency'

const frequency = defineModel<string>('frequency', { required: true })
const band = defineModel<string>('band', { required: true })

defineProps<{
  frequencyLabel: string
  bandLabel: string
  frequencyId: string
  bandId: string
}>()

const query = ref('')

const filteredFrequencies = computed(() => {
  if (!query.value) return COMMON_FREQUENCIES
  const q = query.value.toLowerCase()
  return COMMON_FREQUENCIES.filter(
    (f) => f.label.toLowerCase().includes(q) || f.value.includes(q) || f.band.toLowerCase().includes(q),
  )
})

// Auto-derive band from frequency
watch(frequency, (newFreq) => {
  if (newFreq) {
    const freq = parseFrequency(newFreq)
    if (freq !== null) {
      const derivedBand = frequencyToBand(freq)
      if (derivedBand) {
        band.value = derivedBand
      }
    }
  }
})

function onSelect(selected: string) {
  frequency.value = selected
  const entry = COMMON_FREQUENCIES.find((f) => f.value === selected)
  if (entry) {
    band.value = entry.band
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label :for="frequencyId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ frequencyLabel }}
      </label>
      <Combobox :model-value="frequency" @update:model-value="onSelect" nullable>
        <div class="relative mt-1">
          <ComboboxInput
            :id="frequencyId"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            :display-value="(val: any) => val ?? ''"
            @change="query = $event.target.value; frequency = $event.target.value"
          />
          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </ComboboxButton>
          <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800">
            <ComboboxOption
              v-for="freq in filteredFrequencies"
              :key="freq.value"
              :value="freq.value"
              v-slot="{ active, selected }"
              class="cursor-pointer select-none px-3 py-2"
            >
              <span
                :class="[
                  active ? 'bg-primary-50 dark:bg-primary-900/50' : '',
                  selected ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200',
                  'block rounded px-1',
                ]"
              >
                {{ freq.label }}
              </span>
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>

    <div>
      <label :for="bandId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ bandLabel }}
      </label>
      <input
        :id="bandId"
        v-model="band"
        type="text"
        readonly
        class="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400"
      />
    </div>
  </div>
</template>
