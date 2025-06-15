import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo } from '@/types/exercise';
import type { EthicalCheck } from '@/types/ethics';

const LOCAL_STORAGE_KEY = 'pipelineProgress';

interface ExerciseProgress {
  exerciseId: string;
  originalIndex: number;
  isCompleted: boolean;
  completedAt?: string;
  chatHistory?: string[];
  notes?: string;
  ethicsData?: {
    before?: {
      completed: boolean;
      completedAt?: string;
      responses?: Record<string, any>;
      checkData?: EthicalCheck;
    };
    after?: {
      completed: boolean;
      completedAt?: string;
      responses?: Record<string, any>;
      checkData?: EthicalCheck;
    };
  };
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
      chatHistory: exerciseProgress.value[exerciseId]?.chatHistory || [],
      ethicsData: exerciseProgress.value[exerciseId]?.ethicsData || {}
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
        chatHistory: [],
        ethicsData: {}
      };
    }
    if (!exerciseProgress.value[exerciseId].chatHistory) {
      exerciseProgress.value[exerciseId].chatHistory = [];
    }
    exerciseProgress.value[exerciseId].chatHistory!.push(message);
  };

  // Update ethics data for an exercise
  const updateEthicsData = (
    exerciseId: string, 
    timing: 'before' | 'after', 
    ethicsCheck: EthicalCheck,
    responses?: Record<string, any>
  ) => {
    if (!exerciseProgress.value[exerciseId]) {
      exerciseProgress.value[exerciseId] = {
        exerciseId,
        originalIndex: -1,
        isCompleted: false,
        chatHistory: [],
        ethicsData: {}
      };
    }
    
    if (!exerciseProgress.value[exerciseId].ethicsData) {
      exerciseProgress.value[exerciseId].ethicsData = {};
    }

    exerciseProgress.value[exerciseId].ethicsData![timing] = {
      completed: ethicsCheck.status === 'completed',
      completedAt: ethicsCheck.completedAt,
      responses: responses || ethicsCheck.responses,
      checkData: ethicsCheck
    };
  };

  // Get ethics completion status
  const getEthicsCompletionStatus = (exerciseId: string) => {
    const progress = exerciseProgress.value[exerciseId];
    if (!progress?.ethicsData) return { before: false, after: false };
    
    return {
      before: progress.ethicsData.before?.completed || false,
      after: progress.ethicsData.after?.completed || false
    };
  };

  // Check if exercise can be started (simplified)
  const canStartExercise = (exercise: SelectedPinInfo): { allowed: boolean; reason?: string } => {
    // For now, always allow starting exercises
    // Ethics checks will be handled by the useEthics composable
    return { allowed: true };
  };

  // Check if exercise can be completed (simplified)
  const canCompleteExercise = (exercise: SelectedPinInfo): { allowed: boolean; reason?: string } => {
    // For now, always allow completing exercises
    // Ethics checks will be handled by the useEthics composable
    return { allowed: true };
  };

  // Calculate overall pipeline progress (simplified)
  const calculatePipelineProgress = (selectedPins: SelectedPinInfo[]) => {
    if (selectedPins.length === 0) return 0;
    
    const completedCount = selectedPins.filter(pin => {
      return isExerciseCompleted(pin.name);
    }).length;
    
    return Math.round((completedCount / selectedPins.length) * 100);
  };

  // Get current exercise (first incomplete or last completed)
  const getCurrentExercise = (selectedPins: SelectedPinInfo[]): SelectedPinInfo | null => {
    if (selectedPins.length === 0) return null;
    
    // Find first incomplete exercise (simplified)
    const firstIncomplete = selectedPins.find(pin => {
      return !isExerciseCompleted(pin.name);
    });
    
    if (firstIncomplete) return firstIncomplete;
    
    // If all completed, return last exercise
    return selectedPins[selectedPins.length - 1];
  };

  // Get completed exercises count by phase (simplified)
  const getPhaseProgress = (selectedPins: SelectedPinInfo[], phase: string) => {
    const phaseExercises = selectedPins.filter(pin => pin.location.phase === phase);
    const completedInPhase = phaseExercises.filter(pin => {
      return isExerciseCompleted(pin.name);
    });
    
    return {
      completed: completedInPhase.length,
      total: phaseExercises.length,
      percentage: phaseExercises.length > 0 ? Math.round((completedInPhase.length / phaseExercises.length) * 100) : 0
    };
  };

  // Export pipeline data including ethics
  const exportPipelineData = () => {
    return {
      exerciseProgress: exerciseProgress.value,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  };

  // Import pipeline data including ethics
  const importPipelineData = (data: any) => {
    try {
      if (data.exerciseProgress) {
        exerciseProgress.value = data.exerciseProgress;
        saveProgress();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import pipeline data:', error);
      return false;
    }
  };

  return {
    exerciseProgress,
    markExerciseCompleted,
    markExerciseIncomplete,
    isExerciseCompleted,
    getExerciseProgress,
    addChatMessage,
    updateEthicsData,
    getEthicsCompletionStatus,
    canStartExercise,
    canCompleteExercise,
    calculatePipelineProgress,
    getCurrentExercise,
    getPhaseProgress,
    exportPipelineData,
    importPipelineData,
    loadProgress,
    saveProgress
  };
} 