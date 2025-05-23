import { ref } from "vue";
import type { Exercise } from "../types/exercise";

export function useExerciseDialog() {
  const isAddExerciseDialogOpen = ref(false);
  const currentCategoryForDialog = ref<string | null>(null);
  const editingExercise = ref<Exercise | undefined>(undefined);

  const openDialogForCategory = (category: string) => {
    currentCategoryForDialog.value = category;
    editingExercise.value = undefined;
    isAddExerciseDialogOpen.value = true;
  };

  const openEditDialog = (exercise: Exercise) => {
    editingExercise.value = exercise;
    currentCategoryForDialog.value = exercise.location?.step || '';
    isAddExerciseDialogOpen.value = true;
  };

  const closeDialog = () => {
    isAddExerciseDialogOpen.value = false;
    currentCategoryForDialog.value = null;
    editingExercise.value = undefined;
  };

  return {
    isAddExerciseDialogOpen,
    currentCategoryForDialog,
    editingExercise,
    openDialogForCategory,
    openEditDialog,
    closeDialog,
  };
} 