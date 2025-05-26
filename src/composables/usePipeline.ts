import { ref, watch, type Ref } from "vue";
import type { Exercise, SelectedPinInfo } from "../types/exercise";

export function usePipeline(
  props: { selectedPins: SelectedPinInfo[] },
  allStaticExercises: Readonly<Ref<Exercise[]>>,
  emit: (event: "selectedPinsChange", selectedPins: SelectedPinInfo[]) => void
) {
  const selectedPinIndices = ref<number[]>([]);

  // Watch for changes in the selectedPins prop and update local state
  watch(() => props.selectedPins, () => {
    updateSelectedPinsFromProp();
  }, { deep: true });

  // Helper function to update local selected pins from the prop
  const updateSelectedPinsFromProp = () => {
    selectedPinIndices.value = props.selectedPins.map(pin => pin.originalIndex);
  };

  // Pipeline selection logic
  const togglePipelineSelection = (originalIndex: number) => {
    const isCurrentlySelected = selectedPinIndices.value.includes(originalIndex);
    
    if (isCurrentlySelected) {
      // Remove from selection
      selectedPinIndices.value = selectedPinIndices.value.filter(idx => idx !== originalIndex);
    } else {
      // Add to selection
      selectedPinIndices.value.push(originalIndex);
    }
    
    const selectedPinData = selectedPinIndices.value.map((idx) => {
      const exercise = allStaticExercises.value[idx];
      return {
        name: exercise.name,
        originalIndex: idx,
        order: idx,
        description: exercise.description,
        location: exercise.location,
      };
    });

    emit("selectedPinsChange", selectedPinData);
  };

  // Check if exercise is in pipeline
  const isExerciseInPipeline = (exercise: Exercise, getOriginalExerciseIndex: (exercise: Exercise) => number): boolean => {
    const originalIndex = getOriginalExerciseIndex(exercise);
    return originalIndex >= 0 && selectedPinIndices.value.includes(originalIndex);
  };

  return {
    selectedPinIndices,
    updateSelectedPinsFromProp,
    togglePipelineSelection,
    isExerciseInPipeline,
  };
} 