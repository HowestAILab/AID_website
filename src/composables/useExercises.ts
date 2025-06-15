import { ref, computed } from "vue";
import type { Exercise } from "../types/exercise";
import { LOCAL_STORAGE_KEYS } from "../constants/exercises";
import dummyData from "../../dummy.json";

export function useExercises() {
  const allStaticExercises = ref<Exercise[]>([]);
  const customExercises = ref<Exercise[]>([]);

  const loadExercises = () => {
    // Load diamond exercises state from local storage
    const savedDiamondExercises = localStorage.getItem(
      LOCAL_STORAGE_KEYS.DIAMOND_EXERCISES
    );
    const diamondExercises = savedDiamondExercises
      ? JSON.parse(savedDiamondExercises)
      : {};

    // Load static exercises (from imported JSON), apply saved diamond state
    allStaticExercises.value = (dummyData.exercise || []).map((item: any, index: number) => ({
      ...item,
      isCustom: false,
      originalIndex: index, // Preserve original index for tracking
    }));
    
    // Debug: Check if ethics data is properly loaded from dummy.json
    console.log('🔧 useExercises Debug - Loaded from dummy.json:', {
      totalExercises: allStaticExercises.value.length,
      dummyDataSample: dummyData.exercise?.slice(0, 3).map(ex => ({
        name: ex.name,
        hasEthical: !!ex.ethical,
        ethicalKeys: ex.ethical ? Object.keys(ex.ethical) : 'none'
      })),
      trendAnalysisFromDummy: dummyData.exercise?.find(ex => ex.name === 'AI-Powered Trend Analysis'),
      trendAnalysisProcessed: allStaticExercises.value.find(ex => ex.name === 'AI-Powered Trend Analysis')
    });

    // Load custom exercises from local storage and apply their diamond state
    const storedCustomExercises = localStorage.getItem(
      LOCAL_STORAGE_KEYS.CUSTOM_EXERCISES
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
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CUSTOM_EXERCISES);
      }
    }
  };

  // Get all exercises (static + custom) with proper indexing
  const getAllExercises = computed(() => {
    return allStaticExercises.value.map((exercise, index) => ({
      ...exercise,
      originalIndex: index, // Use the index from the static array
    }));
  });

  // Get exercise by original index
  const getExerciseByIndex = (index: number): Exercise | null => {
    if (index >= 0 && index < allStaticExercises.value.length) {
      return {
        ...allStaticExercises.value[index],
        originalIndex: index,
      };
    }
    return null;
  };

  // Get exercise by name
  const getExerciseByName = (name: string): Exercise | null => {
    const exercise = allStaticExercises.value.find(ex => ex.name === name);
    if (exercise) {
      const index = allStaticExercises.value.indexOf(exercise);
      return {
        ...exercise,
        originalIndex: index,
      };
    }
    return null;
  };

  const getExercisesForCategory = (categoryName: string, phase: string) => {
    // For static exercises, filter using item.location.phase & location.step
    const staticFiltered = allStaticExercises.value.filter(
      (ex) => ex.location.phase === phase && ex.location.step === categoryName
    );
    // For custom, must mimic location shape as well
    const customFiltered = customExercises.value.filter(
      (ex) => ex.location?.phase === phase && ex.location?.step === categoryName
    );
    return [...staticFiltered, ...customFiltered];
  };

  const addNewExercise = (
    exerciseData: { 
      name: string; 
      description: string; 
      location?: { phase?: string; step?: string; human_ai_scale?: number } 
    },
    phase: string,
    categoryStep: string
  ) => {
    const location = {
      phase,
      step: categoryStep,
      human_ai_scale: exerciseData.location?.human_ai_scale ?? 3,
    };
    const newExercise: Exercise = {
      name: exerciseData.name,
      description: exerciseData.description,
      location,
      prompt_example: [],
      ethical: { before: [], after: [] },
      miro_board: "",
      isCustom: true,
    };
    customExercises.value.push(newExercise);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.CUSTOM_EXERCISES,
      JSON.stringify(customExercises.value)
    );
  };

  const editExistingExercise = (
    exerciseData: { 
      name: string; 
      description: string; 
      location?: { phase?: string; step?: string; human_ai_scale?: number } 
    },
    phase: string,
    categoryStep: string
  ) => {
    // Use name+step as key for finding custom exercise
    const index = customExercises.value.findIndex(
      (ex) => ex.name === exerciseData.name && ex.location?.step === exerciseData.location?.step
    );
    if (index !== -1) {
      customExercises.value[index] = {
        name: exerciseData.name,
        description: exerciseData.description,
        location: {
          phase,
          step: categoryStep,
          human_ai_scale: exerciseData.location?.human_ai_scale ?? 3,
        },
        prompt_example: [],
        ethical: { before: [], after: [] },
        miro_board: "",
        isCustom: true,
      };
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CUSTOM_EXERCISES,
        JSON.stringify(customExercises.value)
      );
    }
  };

  const deleteExercise = (exerciseToDelete: Exercise) => {
    // Use index for safety since id no longer exists
    const index = customExercises.value.findIndex(
      (ex) => ex.name === exerciseToDelete.name && ex.location?.step === exerciseToDelete.location?.step
    );
    if (index !== -1) {
      customExercises.value.splice(index, 1);
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CUSTOM_EXERCISES,
        JSON.stringify(customExercises.value)
      );
    }
  };

  const getOriginalExerciseIndex = (exercise: Exercise): number => {
    // For static exercises, find index in the original dummy data
    if (!exercise.isCustom) {
      return allStaticExercises.value.findIndex(ex => 
        ex.name === exercise.name && 
        ex.location.phase === exercise.location.phase &&
        ex.location.step === exercise.location.step
      );
    }
    // For custom exercises, we'll use a negative index or a different approach. Since custom exercises don't exist in the original array, we'll need to handle them differently
    return -1; // Custom exercises won't be compatible with the canvas for now, probably fix when connected to backend
  };

  return {
    allStaticExercises,
    customExercises,
    getAllExercises,
    getExerciseByIndex,
    getExerciseByName,
    loadExercises,
    getExercisesForCategory,
    addNewExercise,
    editExistingExercise,
    deleteExercise,
    getOriginalExerciseIndex,
  };
} 