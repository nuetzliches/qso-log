import { ref, onMounted } from 'vue'
import { qsoRepository } from '../db/repositories/qsoRepository'

export function useNextSequenceNumber() {
  const nextNumber = ref(1)

  async function refresh() {
    nextNumber.value = await qsoRepository.getNextSequenceNumber()
  }

  onMounted(refresh)

  return { nextNumber, refresh }
}
