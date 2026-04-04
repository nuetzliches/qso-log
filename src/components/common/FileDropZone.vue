<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const emit = defineEmits<{
  file: [file: File]
}>()

function handleDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) emit('file', file)
}

function handleSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('file', file)
}
</script>

<template>
  <div
    class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors"
    :class="dragging
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="handleDrop"
    @click="fileInput?.click()"
  >
    <svg class="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('common.dragDropHint') }}</p>
    <input ref="fileInput" type="file" class="hidden" accept=".csv,.json,.adi,.adif" @change="handleSelect" />
  </div>
</template>
