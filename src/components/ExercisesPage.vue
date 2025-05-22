<template>
  <div class="flex-1 bg-white flex flex-col">
    <Tabs
      :tabs="tabNames"
      :active-tab="phase"
      @update:active-tab="handleTabChange"
      @button-refs-updated="handleButtonRefsUpdate"
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
            :key="exercise.title + '-' + index"
          >
            <div class="relative">
              <ExerciseCard
                :title="exercise.name"
                :description="exercise.description"
                :driveType="exercise.location?.human_ai_scale === 3 ? 'human' : (exercise.location?.human_ai_scale === 2 ? 'human-ai' : 'ai')"
              >
                <template #action>
                  <button
                    class="btn btn-primary"
                    style="margin-top:0.5rem"
                  >
                    Add to pipeline
                  </button>
                </template>
              </ExerciseCard>
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
import { ref, computed, onMounted } from "vue";
import Tabs from "./Tabs.vue";
import ExerciseCard from "./ExerciseCard.vue";
import AddExerciseDialog from "./AddExerciseDialog.vue";
import { ArrowLeft, CirclePlus, Trash2, SquarePen } from "lucide-vue-next";
import dummyData from "../../dummy.json";

const tabNames = ["Discover", "Define", "Develop", "Deliver"];

interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
  prompt_example: any[];
  etchical: {
    before: any[];
    after: any[];
  };
  miro_board: string;
  isCustom?: boolean; // Only for custom exercises
}


type ExerciseData = Exercise;

const props = defineProps<{
  phase: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:phase", phase: string): void;
}>();

const allStaticExercises = ref<Exercise[]>([]);
const customExercises = ref<Exercise[]>([]);

const LOCAL_STORAGE_KEY_CUSTOM_EXERCISES = "customDesignExercises";
const LOCAL_STORAGE_KEY_DIAMOND_EXERCISES = "diamondExercises";

// --- Load exercises ---
onMounted(() => {
  // Load diamond exercises state from local storage
  const savedDiamondExercises = localStorage.getItem(
    LOCAL_STORAGE_KEY_DIAMOND_EXERCISES
  );
  const diamondExercises = savedDiamondExercises
    ? JSON.parse(savedDiamondExercises)
    : {};

  // Load static exercises (from imported JSON), apply saved diamond state
  allStaticExercises.value = (dummyData.exercise || []).map((item: any) => ({
    ...item,
    isCustom: false,
  }));

  // Load custom exercises from local storage and apply their diamond state
  const storedCustomExercises = localStorage.getItem(
    LOCAL_STORAGE_KEY_CUSTOM_EXERCISES
  );
  if (storedCustomExercises) {
    try {
      const parsedExercises: Exercise[] = JSON.parse(storedCustomExercises);
      customExercises.value = parsedExercises.map((ex) => ({
        ...ex,
      }));
    } catch (e) {
      console.error("Error parsing custom exercises from local storage:", e);
      // Optionally clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOM_EXERCISES);
    }
  }
});

// Defines the categories for each phase and their order
const phaseCategoryMapping: Record<string, string[]> = {
  Discover: ["Prepare (Discover)", "Discover"],
  Define: ["Define", "Synthesise (Define)"],
  Develop: ["Prepare (Develop)", "Develop"],
  Deliver: ["Deliver", "Synthesise (Develop)"],
};

const categoriesForCurrentPhase = computed(() => {
  return phaseCategoryMapping[props.phase] || [];
});

const getExercisesForCategory = (categoryName: string) => {
  // For static exercises, filter using item.location.phase & location.step
  const staticFiltered = allStaticExercises.value.filter(
    (ex) => ex.location.phase === props.phase && ex.location.step === categoryName
  );
  // For custom, must mimic location shape as well
  const customFiltered = customExercises.value.filter(
    (ex) => ex.location?.phase === props.phase && ex.location?.step === categoryName
  );
  return [...staticFiltered, ...customFiltered];
};

// Dialog state and handling
const isAddExerciseDialogOpen = ref(false);
const currentCategoryForDialog = ref<string | null>(null);
const editingExercise = ref<Exercise | undefined>(undefined);

const openDialogForCategory = (category: string) => {
  currentCategoryForDialog.value = category;
  editingExercise.value = undefined;
  isAddExerciseDialogOpen.value = true;
};

const handleEditExercise = (exercise: Exercise) => {
  editingExercise.value = exercise;
  currentCategoryForDialog.value = exercise.location?.step || '';
  isAddExerciseDialogOpen.value = true;
};

const handleAddNewExercise = (exerciseData: { name: string; description: string; location?: { phase?: string; step?: string; human_ai_scale?: number } }) => {
  const location = {
    phase: props.phase,
    step: currentCategoryForDialog.value ?? "",
    human_ai_scale: exerciseData.location?.human_ai_scale ?? 3,
  };
  const newExercise: Exercise = {
    name: exerciseData.name,
    description: exerciseData.description,
    location,
    prompt_example: [],
    etchical: { before: [], after: [] },
    miro_board: "",
    isCustom: true,
  };
  customExercises.value.push(newExercise);
  localStorage.setItem(
    LOCAL_STORAGE_KEY_CUSTOM_EXERCISES,
    JSON.stringify(customExercises.value)
  );
  isAddExerciseDialogOpen.value = false;
  currentCategoryForDialog.value = null;
};

const handleEditExistingExercise = (exerciseData: { name: string; description: string; location?: { phase?: string; step?: string; human_ai_scale?: number } }) => {
  // Use name+step as key for finding custom exercise
  const index = customExercises.value.findIndex(
    (ex) => ex.name === exerciseData.name && ex.location?.step === exerciseData.location?.step
  );
  if (index !== -1) {
    customExercises.value[index] = {
      name: exerciseData.name,
      description: exerciseData.description,
      location: {
        phase: props.phase,
        step: currentCategoryForDialog.value ?? "",
        human_ai_scale: exerciseData.location?.human_ai_scale ?? 3,
      },
      prompt_example: [],
      etchical: { before: [], after: [] },
      miro_board: "",
      isCustom: true,
    };
    localStorage.setItem(
      LOCAL_STORAGE_KEY_CUSTOM_EXERCISES,
      JSON.stringify(customExercises.value)
    );
  }
  isAddExerciseDialogOpen.value = false;
  currentCategoryForDialog.value = null;
  editingExercise.value = undefined;
};

const handleAddToDiamond = () => {
  // Disabled for now – this would add to pipeline
};

const handleDeleteExercise = (exerciseToDelete: Exercise) => {
  // Use index for safety since id no longer exists
  const index = customExercises.value.findIndex(
    (ex) => ex.name === exerciseToDelete.name && ex.location?.step === exerciseToDelete.location?.step
  );
  if (index !== -1) {
    customExercises.value.splice(index, 1);
    localStorage.setItem(
      LOCAL_STORAGE_KEY_CUSTOM_EXERCISES,
      JSON.stringify(customExercises.value)
    );
  }
};

// Tab handling
const handleTabChange = (tab: string) => {
  emit("update:phase", tab);
};

const handleButtonRefsUpdate = (
  refs: Record<string, HTMLButtonElement | null>
) => {
  // Placeholder for future use
};
</script>
