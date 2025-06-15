import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo } from '@/types/exercise';

const LOCAL_STORAGE_KEY = 'pipelineProgress';

interface ExerciseProgress {
  exerciseId: string;
  originalIndex: number;
  isCompleted: boolean;
  completedAt?: string;
  chatHistory?: string[];
  notes?: string;
}

export function usePipelineProgress() {
  const exerciseProgress = ref<Record<string, ExerciseProgress>>({});

  // Load from localStorage
  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        exerciseProgress.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pipeline progress:', error);
      exerciseProgress.value = {};
    }
  };

  // Save to localStorage
  const saveProgress = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(exerciseProgress.value));
    } catch (error) {
      console.error('Failed to save pipeline progress:', error);
    }
  };

  // Watch for changes and auto-save
  watch(exerciseProgress, saveProgress, { deep: true });

  // Load on initialization
  loadProgress();

  // Mark exercise as completed
  const markExerciseCompleted = (exerciseId: string, originalIndex: number, notes?: string) => {
    exerciseProgress.value[exerciseId] = {
      exerciseId,
      originalIndex,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      notes: notes || '',
      chatHistory: exerciseProgress.value[exerciseId]?.chatHistory || []
    };
  };

  // Mark exercise as incomplete
  const markExerciseIncomplete = (exerciseId: string) => {
    if (exerciseProgress.value[exerciseId]) {
      exerciseProgress.value[exerciseId].isCompleted = false;
      delete exerciseProgress.value[exerciseId].completedAt;
    }
  };

  // Check if exercise is completed
  const isExerciseCompleted = (exerciseId: string): boolean => {
    return exerciseProgress.value[exerciseId]?.isCompleted || false;
  };

  // Get exercise progress
  const getExerciseProgress = (exerciseId: string): ExerciseProgress | null => {
    return exerciseProgress.value[exerciseId] || null;
  };

  // Add chat message to exercise
  const addChatMessage = (exerciseId: string, message: string) => {
    if (!exerciseProgress.value[exerciseId]) {
      exerciseProgress.value[exerciseId] = {
        exerciseId,
        originalIndex: -1,
        isCompleted: false,
        chatHistory: []
      };
    }
    if (!exerciseProgress.value[exerciseId].chatHistory) {
      exerciseProgress.value[exerciseId].chatHistory = [];
    }
    exerciseProgress.value[exerciseId].chatHistory!.push(message);
  };

  // Calculate overall pipeline progress
  const calculatePipelineProgress = (selectedPins: SelectedPinInfo[]) => {
    if (selectedPins.length === 0) return 0;
    
    const completedCount = selectedPins.filter(pin => 
      isExerciseCompleted(pin.name)
    ).length;
    
    return Math.round((completedCount / selectedPins.length) * 100);
  };

  // Get current exercise (first incomplete or last completed)
  const getCurrentExercise = (selectedPins: SelectedPinInfo[]): SelectedPinInfo | null => {
    if (selectedPins.length === 0) return null;
    
    // Find first incomplete exercise
    const firstIncomplete = selectedPins.find(pin => !isExerciseCompleted(pin.name));
    if (firstIncomplete) return firstIncomplete;
    
    // If all completed, return last exercise
    return selectedPins[selectedPins.length - 1];
  };

  // Get completed exercises count by phase
  const getPhaseProgress = (selectedPins: SelectedPinInfo[], phase: string) => {
    const phaseExercises = selectedPins.filter(pin => pin.location.phase === phase);
    const completedInPhase = phaseExercises.filter(pin => isExerciseCompleted(pin.name));
    
    return {
      completed: completedInPhase.length,
      total: phaseExercises.length,
      percentage: phaseExercises.length > 0 ? Math.round((completedInPhase.length / phaseExercises.length) * 100) : 0
    };
  };

  return {
    exerciseProgress,
    markExerciseCompleted,
    markExerciseIncomplete,
    isExerciseCompleted,
    getExerciseProgress,
    addChatMessage,
    calculatePipelineProgress,
    getCurrentExercise,
    getPhaseProgress,
    loadProgress,
    saveProgress
  };
} 