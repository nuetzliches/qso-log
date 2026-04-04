import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { operatorRepository } from '../db/repositories/operatorRepository'
import type { Operator, OperatorInput } from '../types/operator'

export const useOperatorStore = defineStore('operators', () => {
  const operators = ref<Operator[]>([])
  const lastSelectedOperatorId = ref<number | null>(null)
  const loading = ref(false)

  const hasMultipleOperators = computed(() => operators.value.length > 1)

  const currentOperator = computed(() => {
    if (lastSelectedOperatorId.value === null) return operators.value[0] ?? null
    return operators.value.find((op) => op.id === lastSelectedOperatorId.value) ?? operators.value[0] ?? null
  })

  async function loadOperators() {
    loading.value = true
    try {
      operators.value = await operatorRepository.getAll()
    } finally {
      loading.value = false
    }
  }

  async function addOperator(input: OperatorInput): Promise<number> {
    const id = await operatorRepository.add(input)
    await loadOperators()
    return id
  }

  async function updateOperator(id: number, changes: Partial<Operator>): Promise<void> {
    await operatorRepository.update(id, changes)
    await loadOperators()
  }

  async function deleteOperator(id: number): Promise<void> {
    await operatorRepository.delete(id)
    if (lastSelectedOperatorId.value === id) {
      lastSelectedOperatorId.value = null
    }
    await loadOperators()
  }

  function selectOperator(id: number) {
    lastSelectedOperatorId.value = id
  }

  return {
    operators,
    lastSelectedOperatorId,
    loading,
    hasMultipleOperators,
    currentOperator,
    loadOperators,
    addOperator,
    updateOperator,
    deleteOperator,
    selectOperator,
  }
})
