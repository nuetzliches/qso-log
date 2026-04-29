<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  accept: []
  cancel: []
}>()
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('cancel')">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('settings.propagation.consentTitle') }}
        </DialogTitle>
        <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {{ t('settings.propagation.consentBody') }}
        </p>
        <div class="mt-5 flex justify-end gap-3">
          <button
            class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="emit('cancel')"
          >
            {{ t('settings.propagation.consentCancel') }}
          </button>
          <button
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
            @click="emit('accept')"
          >
            {{ t('settings.propagation.consentAccept') }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
