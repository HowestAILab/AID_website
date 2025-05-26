<template>
  <div class="flex-1 bg-white flex flex-col">
    <Tabs
      :tabs="tabNames"
      :active-tab="phase"
      @update:active-tab="handleTabChange"
    />
    <div class="flex items-center p-4">
      <button
        @click="$emit('close')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft />
        <h1 class="ml-2 text-lg font-medium">{{ phase }} Phase Exercises</h1>
      </button>
    </div>

    <div class="p-4 space-y-8">
      <!-- Loop through categories for the current phase -->
      <div
        v-for="categoryName in categoriesForCurrentPhase"
        :key="categoryName"
        class="mb-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h5 class="font-medium text-[#4B5563]">{{ categoryName }}</h5>
          <AddExerciseDialog
            :open="
              isAddExerciseDialogOpen &&
              currentCategoryForDialog === categoryName
            "
            @update:open="isAddExerciseDialogOpen = $event"
            :title="
              editingExercise
                ? `Edit Exercise in ${categoryName}`
                : `Add Custom Exercise to ${categoryName}`
            "
            :description="
              editingExercise
                ? `Edit this custom exercise in the ${categoryName} category.`
                : `Create a new custom exercise for the ${categoryName} category in the ${phase} phase.`
            "
            :mode="editingExercise ? 'edit' : 'add'"
            :initial-data="editingExercise"
            @add-exercise="handleAddNewExercise"
            @edit-exercise="handleEditExistingExercise"
          >
            <template #trigger>
              <button
                class="text-[#F59E0C] flex items-center gap-2 cursor-pointer"
                @click="openDialogForCategory(categoryName)"
              >
                <CirclePlus />
                <p>Add Custom</p>
              </button>
            </template>
          </AddExerciseDialog>
        </div>
        <div class="grid grid-cols-3 gap-4 w-full">
          <template
            v-for="(exercise, index) in getExercisesForCategory(categoryName)"
            :key="exercise.name + '-' + index"
          >
            <div class="relative">
              <ExerciseCard
                :title="exercise.name"
                :description="exercise.description"
                :driveType="exercise.location?.human_ai_scale === 3 ? 'human' : (exercise.location?.human_ai_scale === 2 ? 'human-ai' : 'ai')"
                :originalIndex="getOriginalExerciseIndex(exercise)"
                :isInPipeline="isExerciseInPipeline(exercise, getOriginalExerciseIndex)"
                @togglePipeline="togglePipelineSelection"
                @open-exercise="handleOpenExerciseDetail(exercise.name)"
              />
              <div
                v-if="exercise.isCustom"
                class="absolute bottom-4 right-4 flex gap-3"
              >
                <button
                  @click="handleEditExercise(exercise)"
                  class="text-black hover:text-gray-600 cursor-pointer"
                >
                  <SquarePen :size="20" />
                </button>
                <button
                  @click="handleDeleteExercise(exercise)"
                  class="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 :size="20" />
                </button>
              </div>
            </div>
          </template>
          <p
            v-if="getExercisesForCategory(categoryName).length === 0"
            class="text-gray-500 col-span-3"
          >
            No exercises in this category yet. Click "Add Custom" to add one.
          </p>
        </div>
      </div>
      <p v-if="categoriesForCurrentPhase.length === 0" class="text-gray-500">
        No categories defined for this phase yet.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import Tabs from "./Tabs.vue";
import ExerciseCard from "./ExerciseCard.vue";
import AddExerciseDialog from "./AddExerciseDialog.vue";
import { ArrowLeft, CirclePlus, Trash2, SquarePen } from "lucide-vue-next";

// Import types
import type { SelectedPinInfo, Exercise } from "../types/exercise";

// Import constants
import { TAB_NAMES, PHASE_CATEGORY_MAPPING } from "../constants/exercises";

// Import composables
import { useExercises } from "../composables/useExercises";
import { usePipeline } from "../composables/usePipeline";
import { useExerciseDialog } from "../composables/useExerciseDialog";

const tabNames = TAB_NAMES;

const props = defineProps<{
  phase: string;
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:phase", phase: string): void;
  (e: "selectedPinsChange", selectedPins: SelectedPinInfo[]): void;
  (e: "open-exercise-detail", exerciseName: string): void;
}>();

// Use composables
const {
  allStaticExercises,
  customExercises,
  loadExercises,
  getExercisesForCategory: getExercisesForCategoryBase,
  addNewExercise,
  editExistingExercise,
  deleteExercise,
  getOriginalExerciseIndex,
} = useExercises();

const {
  selectedPinIndices,
  updateSelectedPinsFromProp,
  togglePipelineSelection,
  isExerciseInPipeline,
} = usePipeline(props, allStaticExercises, emit);

const {
  isAddExerciseDialogOpen,
  currentCategoryForDialog,
  editingExercise,
  openDialogForCategory,
  openEditDialog,
  closeDialog,
} = useExerciseDialog();

// Computed properties
const categoriesForCurrentPhase = computed(() => {
  return PHASE_CATEGORY_MAPPING[props.phase] || [];
});

const getExercisesForCategory = (categoryName: string) => {
  return getExercisesForCategoryBase(categoryName, props.phase);
};

// Event handlers
const handleTabChange = (tab: string) => {
  emit("update:phase", tab);
};

const handleOpenExerciseDetail = (exerciseName: string) => {
  emit("open-exercise-detail", exerciseName);
}

const handleEditExercise = (exercise: Exercise) => {
  openEditDialog(exercise);
};

const handleAddNewExercise = (exerciseData: { name: string; description: string; location?: { phase?: string; step?: string; human_ai_scale?: number } }) => {
  addNewExercise(exerciseData, props.phase, currentCategoryForDialog.value ?? "");
  closeDialog();
};

const handleEditExistingExercise = (exerciseData: { name: string; description: string; location?: { phase?: string; step?: string; human_ai_scale?: number } }) => {
  editExistingExercise(exerciseData, props.phase, currentCategoryForDialog.value ?? "");
  closeDialog();
};

const handleDeleteExercise = (exerciseToDelete: Exercise) => {
  deleteExercise(exerciseToDelete);
};

// Lifecycle
onMounted(() => {
  loadExercises();
  updateSelectedPinsFromProp();
});
</script>
