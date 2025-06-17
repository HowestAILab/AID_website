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

  // Handle reordering of pins in the pipeline (with phase restrictions)
  const handleReorderPins = (fromIndex: number, toIndex: number) => {
    const updatedPins = [...props.selectedPins];
    const movedPin = updatedPins[fromIndex];
    const targetPin = updatedPins[toIndex];
    
    // Check if the move is within the same phase
    if (movedPin.location.phase !== targetPin.location.phase) {
      console.warn(`Cannot move exercise "${movedPin.name}" from ${movedPin.location.phase} phase to ${targetPin.location.phase} phase`);
      return; // Don't allow cross-phase moves
    }
    
    const [movedExercise] = updatedPins.splice(fromIndex, 1);
    updatedPins.splice(toIndex, 0, movedExercise);
    
    emit("selectedPinsChange", updatedPins);
  };

  // Check if drag target is valid (same phase)
  const canDropAtIndex = (draggedIndex: number, targetIndex: number): boolean => {
    if (draggedIndex === targetIndex) return false;
    
    const draggedExercise = props.selectedPins[draggedIndex];
    const targetExercise = props.selectedPins[targetIndex];
    
    return draggedExercise.location.phase === targetExercise.location.phase;
  };

  // Get exercises grouped by phase in correct order
  const getExercisesByPhase = () => {
    const phaseOrder = ['Discover', 'Define', 'Develop', 'Deliver'];
    const groupedByPhase: Record<string, typeof props.selectedPins> = {};
    
    // Group exercises by phase
    props.selectedPins.forEach(exercise => {
      const phase = exercise.location.phase;
      if (!groupedByPhase[phase]) {
        groupedByPhase[phase] = [];
      }
      groupedByPhase[phase].push(exercise);
    });
    
    // Return phases in correct order with their exercises
    return phaseOrder.map(phase => ({
      phase,
      exercises: groupedByPhase[phase] || []
    })).filter(group => group.exercises.length > 0);
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
    handleReorderPins,
    canDropAtIndex,
    getExercisesByPhase,
    isExerciseInPipeline,
  };
} 