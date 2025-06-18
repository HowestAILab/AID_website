import { ref } from 'vue'
import type { SelectedPinInfo } from '@/types/exercise'

interface PendingExerciseOpen {
  exercise: SelectedPinInfo
  index: number
}

const pendingExerciseOpen = ref<PendingExerciseOpen | null>(null)
const currentActiveExercise = ref<SelectedPinInfo | null>(null)

export function usePipelineNavigation() {
  const setPendingExerciseOpen = (exercise: SelectedPinInfo, index: number) => {
    pendingExerciseOpen.value = { exercise, index }
  }

  const getPendingExerciseOpen = () => {
    const pending = pendingExerciseOpen.value
    pendingExerciseOpen.value = null // Clear after getting
    return pending
  }

  const clearPendingExerciseOpen = () => {
    pendingExerciseOpen.value = null
  }

  const setCurrentActiveExercise = (exercise: SelectedPinInfo | null) => {
    currentActiveExercise.value = exercise
  }

  const getCurrentActiveExercise = () => {
    return currentActiveExercise.value
  }

  return {
    setPendingExerciseOpen,
    getPendingExerciseOpen,
    clearPendingExerciseOpen,
    setCurrentActiveExercise,
    getCurrentActiveExercise
  }
} 