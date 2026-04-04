<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  open: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('cancel')">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </DialogTitle>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {{ message }}
        </p>
        <div class="mt-4 flex justify-end gap-3">
          <button
            class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="emit('cancel')"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            @click="emit('confirm')"
          >
            {{ t('common.confirm') }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
