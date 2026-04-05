import { ref, onMounted } from 'vue'

export function useStoragePersistence() {
  const isPersisted = ref(false)

  onMounted(async () => {
    if (!navigator.storage?.persist) return

    isPersisted.value = await navigator.storage.persisted()
    if (!isPersisted.value) {
      isPersisted.value = await navigator.storage.persist()
    }
  })

  return { isPersisted }
}
