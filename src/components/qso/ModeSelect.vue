<script setup lang="ts">
import { ref, computed } from 'vue'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/vue'

const model = defineModel<string>({ required: true })

defineProps<{
  label: string
  id: string
}>()

const MODES = [
  'CW', 'SSB', 'FM', 'AM', 'FT8', 'FT4', 'RTTY', 'PSK31',
  'JT65', 'JT9', 'DSTAR', 'DMR', 'C4FM', 'OLIVIA', 'USB', 'LSB',
]

const query = ref('')

const filteredModes = computed(() => {
  if (!query.value) return MODES
  const q = query.value.toUpperCase()
  return MODES.filter((m) => m.includes(q))
})
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
    <Combobox v-model="model" nullable>
      <div class="relative mt-1">
        <ComboboxInput
          :id="id"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          :display-value="(val: any) => val ?? ''"
          @change="query = $event.target.value"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </ComboboxButton>
        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800">
          <ComboboxOption
            v-if="query && !filteredModes.includes(query.toUpperCase())"
            :value="query.toUpperCase()"
            class="cursor-pointer select-none px-3 py-2 text-gray-700 hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-primary-900/50"
          >
            {{ query.toUpperCase() }}
          </ComboboxOption>
          <ComboboxOption
            v-for="mode in filteredModes"
            :key="mode"
            :value="mode"
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
              {{ mode }}
            </span>
          </ComboboxOption>
        </ComboboxOptions>
      </div>
    </Combobox>
  </div>
</template>
