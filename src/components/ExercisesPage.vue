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
      <div v-for="categoryName in categoriesForCurrentPhase" :key="categoryName" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h5 class="font-medium text-[#4B5563]">{{ categoryName }}</h5>
          <AddExerciseDialog
            :open="isAddExerciseDialogOpen && currentCategoryForDialog === categoryName"
            @update:open="isAddExerciseDialogOpen = $event"
            :title="`Add Custom Exercise to ${categoryName}`"
            :description="`Create a new custom exercise for the ${categoryName} category in the ${phase} phase.`"
            @add-exercise="handleAddNewExercise"
          >
            <template #trigger>
              <button
                class="text-[#F59E0C] flex items-center gap-2"
                @click="openDialogForCategory(categoryName)"
              >
                <CirclePlus />
                <p>Add Custom</p>
              </button>
            </template>
          </AddExerciseDialog>
        </div>
        <div class="grid grid-cols-3 gap-4 w-full">
          <template v-for="(exercise, index) in getExercisesForCategory(categoryName)" :key="exercise.title + '-' + index">
            <div class="relative">
              <ExerciseCard2
                :title="exercise.title"
                :description="exercise.description"
                :driveType="exercise.driveType"
                @add-to-diamond="() => {}"
              />
              <button
                v-if="exercise.isCustom"
                @click="handleDeleteExercise(exercise)"
                class="absolute bottom-4 right-4 text-red-500 hover:text-red-700"
              >
                <Trash2 :size="20" />
              </button>
            </div>
          </template>
           <p v-if="getExercisesForCategory(categoryName).length === 0" class="text-gray-500 col-span-3">No exercises in this category yet. Click "Add Custom" to add one.</p>
        </div>
      </div>
       <p v-if="categoriesForCurrentPhase.length === 0" class="text-gray-500">No categories defined for this phase yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Tabs from "./Tabs.vue";
import ExerciseCard2 from "./ExerciseCard2.vue";
import AddExerciseDialog from "./AddExerciseDialog.vue";
import { ArrowLeft, CirclePlus, Trash2 } from "lucide-vue-next";
import dummyData from "../../dummy.json";

const tabNames = ["Discover", "Define", "Develop", "Deliver"];


interface Exercise {
  title: string;
  description: string;
  driveType: "human" | "human-ai" | "ai";
  phase: string;
  category: string;
  isCustom?: boolean;

  id?: string;
  x?: number;
  y?: number;
}

const props = defineProps<{
  phase: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:phase", phase: string): void;
}>();

const allStaticExercises = ref<Exercise[]>([]);

const customExercises = ref<Exercise[]>([]);

const LOCAL_STORAGE_KEY_CUSTOM_EXERCISES = 'customDesignExercises';

// --- Load exercises ---
onMounted(() => {
  // Load static exercises (from imported JSON)
  allStaticExercises.value = dummyData.map((item: any, index: number) => ({
    id: `static-${index}`,
    title: item.labelConfig.text,
    description: item.description,
    driveType: item.driveType as "human" | "human-ai" | "ai",
    phase: item.phase,
    category: item.category,
    isCustom: false,

    x: item.config?.x, 
    y: item.config?.y,
  }));

  // Load custom exercises from local storage
  const storedCustomExercises = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_EXERCISES);
  if (storedCustomExercises) {
    try {
      const parsedExercises: Exercise[] = JSON.parse(storedCustomExercises);
      // Optional: Add more validation here if needed (e.g., check structure of parsedExercises)
      customExercises.value = parsedExercises;
    } catch (e) {
      console.error("Error parsing custom exercises from local storage:", e);
      // Optionally clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOM_EXERCISES);
    }
  }
});

// Defines the categories for each phase and their order
const phaseCategoryMapping: Record<string, string[]> = {
  Discover: ["Empathize", "Explore"],
  Define: ["Synthesize", "Frame"],
  Develop: ["Ideate", "Prototype"],
  Deliver: ["Test", "Implement"],
};

const categoriesForCurrentPhase = computed(() => {
  return phaseCategoryMapping[props.phase] || [];
});

const getExercisesForCategory = (categoryName: string) => {
  const staticFiltered = allStaticExercises.value.filter(
    ex => ex.phase === props.phase && ex.category === categoryName
  );
  const customFiltered = customExercises.value.filter(
    ex => ex.phase === props.phase && ex.category === categoryName
  );
  return [...staticFiltered, ...customFiltered];
};

// Dialog state and handling
const isAddExerciseDialogOpen = ref(false);
const currentCategoryForDialog = ref<string | null>(null);

const openDialogForCategory = (category: string) => {
  currentCategoryForDialog.value = category;
  isAddExerciseDialogOpen.value = true;
};

const handleAddNewExercise = (exerciseData: { title: string; description: string; driveType: "human" | "human-ai" | "ai"; x?: number; y?: number }) => {
  if (currentCategoryForDialog.value) {
    const newExercise: Exercise = {
      title: exerciseData.title,
      description: exerciseData.description,
      driveType: exerciseData.driveType,
      phase: props.phase,
      category: currentCategoryForDialog.value,
      isCustom: true,
      id: `custom-${Date.now()}-${Math.random()}`,
      x: exerciseData.x,
      y: exerciseData.y,
    };
    customExercises.value.push(newExercise);
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_EXERCISES, JSON.stringify(customExercises.value));
  }
  isAddExerciseDialogOpen.value = false;
  currentCategoryForDialog.value = null;
};

const handleDeleteExercise = (exerciseToDelete: Exercise) => {
  customExercises.value = customExercises.value.filter(ex => ex.id !== exerciseToDelete.id);
  localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_EXERCISES, JSON.stringify(customExercises.value));
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
