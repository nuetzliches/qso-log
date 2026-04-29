<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Propagation } from '../../services/propagation/types'

const props = defineProps<{
  propagation?: Propagation
  compact?: boolean
}>()

const { t } = useI18n()

const sfiClass = computed(() => {
  const v = props.propagation?.sfi
  if (v === undefined) return ''
  if (v >= 150) return 'text-emerald-700 dark:text-emerald-300'
  if (v >= 100) return 'text-emerald-600 dark:text-emerald-400'
  if (v >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
})

const kClass = computed(() => {
  const v = props.propagation?.kIndex
  if (v === undefined) return ''
  if (v <= 2) return 'text-emerald-600 dark:text-emerald-400'
  if (v <= 4) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
})

const tooltip = computed(() => {
  const p = props.propagation
  if (!p) return ''
  const parts: string[] = []
  if (p.sfi !== undefined) {
    let key = 'propagation.sfi.veryLow'
    if (p.sfi >= 150) key = 'propagation.sfi.excellent'
    else if (p.sfi >= 100) key = 'propagation.sfi.good'
    else if (p.sfi >= 70) key = 'propagation.sfi.low'
    parts.push(t(key))
  }
  if (p.kIndex !== undefined) {
    let key = 'propagation.k.quiet'
    if (p.kIndex >= 6) key = 'propagation.k.major'
    else if (p.kIndex === 5) key = 'propagation.k.minor'
    else if (p.kIndex >= 3) key = 'propagation.k.unsettled'
    parts.push(t(key))
  }
  return parts.join(' · ')
})
</script>

<template>
  <span
    v-if="propagation"
    class="inline-flex items-center gap-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700"
    :title="tooltip"
  >
    <span v-if="propagation.sfi !== undefined" :class="sfiClass">
      <span class="text-gray-500 dark:text-gray-400">{{ compact ? '' : 'SFI ' }}</span>{{ Math.round(propagation.sfi) }}
    </span>
    <span v-if="propagation.ssn !== undefined && !compact" class="text-gray-600 dark:text-gray-300">
      <span class="text-gray-500 dark:text-gray-400">SSN </span>{{ Math.round(propagation.ssn) }}
    </span>
    <span v-if="propagation.kIndex !== undefined" :class="kClass">
      <span class="text-gray-500 dark:text-gray-400">K </span>{{ propagation.kIndex }}
    </span>
  </span>
</template>
