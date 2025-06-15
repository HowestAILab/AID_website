import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo } from '@/types/exercise';
import { ETHICAL_LENSES, MAIN_CAPITALS } from '@/types/ethics';
import type { EthicalSettings, EthicalLens, MainCapital } from '@/types/ethics';

interface EthicsData {
  exerciseId: string;
  timing: 'before' | 'after';
  questions: string[];
  settings: {
    lens: string;
    capital: string;
    zoomingState: string;
  };
  completed: boolean;
  responses?: Record<string, any>;
  completedAt?: number;
}

interface EthicsModal {
  open: boolean;
  exerciseId: string;
  timing: 'before' | 'after';
  questions: Array<{
    id: string;
    question: string;
    type: 'text';
    required: boolean;
  }>;
  settings: EthicalSettings;
  exerciseContext: {
    name: string;
    phase: string;
    step: string;
    humanAiScale: number;
    description: string;
  };
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }>;
  existingResponses?: Record<string, any>;
}

const LOCAL_STORAGE_KEY = 'ethics-data';

export function useEthics() {
  const ethicsData = ref<Record<string, EthicsData>>({});
  const ethicsModal = ref<EthicsModal | null>(null);
  const pendingNavigation = ref<{ type: 'exercise-change', targetIndex: number } | null>(null);

  // Load from localStorage
  const loadEthicsData = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        ethicsData.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load ethics data:', error);
    }
  };

  // Save to localStorage
  const saveEthicsData = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ethicsData.value));
    } catch (error) {
      console.error('Failed to save ethics data:', error);
    }
  };

  // Helper functions
  const findLensByType = (type: string): EthicalLens => 
    ETHICAL_LENSES.find(lens => lens.type === type) || ETHICAL_LENSES[0];
  
  const findCapitalByType = (type: string): MainCapital => 
    MAIN_CAPITALS.find(capital => capital.type === type) || MAIN_CAPITALS[0];

  const getEthicsKey = (exerciseId: string, timing: 'before' | 'after') => 
    `${exerciseId}-${timing}`;

  // Check if exercise has ethics requirement
  const hasEthicsRequirement = (exercise: SelectedPinInfo, timing: 'before' | 'after'): boolean => {
    if (!exercise?.ethical?.[timing]) return false;
    
    const ethicsData = exercise.ethical[timing];
    
    // Handle object format (single EthicsRequirement)
    if (typeof ethicsData === 'object' && !Array.isArray(ethicsData)) {
      return Array.isArray(ethicsData.questions) && ethicsData.questions.length > 0;
    }
    
    // Handle array format (EthicsRequirement[])
    if (Array.isArray(ethicsData)) {
      return ethicsData.some(req => Array.isArray(req.questions) && req.questions.length > 0);
    }
    
    return false;
  };

  // Get ethics questions from exercise
  const getEthicsQuestions = (exercise: SelectedPinInfo, timing: 'before' | 'after'): string[] => {
    if (!exercise?.ethical?.[timing]) return [];
    
    const ethicsData = exercise.ethical[timing];
    
    // Handle object format (single EthicsRequirement)
    if (typeof ethicsData === 'object' && !Array.isArray(ethicsData)) {
      return ethicsData.questions || [];
    }
    
    // Handle array format (EthicsRequirement[])
    if (Array.isArray(ethicsData)) {
      // Flatten all questions from all requirements
      return ethicsData.flatMap(req => req.questions || []);
    }
    
    return [];
  };

  // Get ethics settings from exercise
  const getEthicsSettings = (exercise: SelectedPinInfo, timing: 'before' | 'after') => {
    if (!exercise?.ethical?.[timing]) return null;
    
    const ethicsData = exercise.ethical[timing];
    
    // Handle object format (single EthicsRequirement)
    if (typeof ethicsData === 'object' && !Array.isArray(ethicsData)) {
      return {
        lens: ethicsData.lens || 'virtue',
        capital: ethicsData.capital || 'human',
        zoomingState: ethicsData.zoomingState || 'in'
      };
    }
    
    // Handle array format (EthicsRequirement[]) - use first requirement's settings
    if (Array.isArray(ethicsData) && ethicsData.length > 0) {
      const firstReq = ethicsData[0];
      return {
        lens: firstReq.lens || 'virtue',
        capital: firstReq.capital || 'human',
        zoomingState: firstReq.zoomingState || 'in'
      };
    }
    
    // Default settings
    return {
      lens: 'virtue',
      capital: 'human',
      zoomingState: 'in'
    };
  };

  // Check if ethics is completed
  const isEthicsCompleted = (exerciseId: string, timing: 'before' | 'after'): boolean => {
    const key = getEthicsKey(exerciseId, timing);
    return ethicsData.value[key]?.completed || false;
  };

  // Get exercise ethics status
  const getExerciseEthicsStatus = (exercise: SelectedPinInfo) => {
    const beforeRequired = hasEthicsRequirement(exercise, 'before');
    const afterRequired = hasEthicsRequirement(exercise, 'after');
    const beforeCompleted = beforeRequired ? isEthicsCompleted(exercise.name, 'before') : null;
    const afterCompleted = afterRequired ? isEthicsCompleted(exercise.name, 'after') : null;
    
    return {
      beforeRequired,
      afterRequired,
      beforeCompleted,
      afterCompleted,
      allCompleted: (!beforeRequired || beforeCompleted) && (!afterRequired || afterCompleted),
      hasAnyRequirement: beforeRequired || afterRequired
    };
  };

  // Trigger ethics check
  const triggerEthicsCheck = (
    exercise: SelectedPinInfo,
    timing: 'before' | 'after',
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }> = []
  ) => {
    const questions = getEthicsQuestions(exercise, timing);
    const settings = getEthicsSettings(exercise, timing);

    if (questions.length === 0 || !settings) return false;

    const ethicalSettings: EthicalSettings = {
      ethicalLens: findLensByType(settings.lens),
      mainCapital: findCapitalByType(settings.capital),
      zoomingState: settings.zoomingState as 'in' | 'out'
    };

    const formattedQuestions = questions.map((q, index) => ({
      id: `${exercise.name}-${timing}-q${index}`,
      question: q,
      type: 'text' as const,
      required: true
    }));

    const key = getEthicsKey(exercise.name, timing);
    const existingResponses = ethicsData.value[key]?.responses;

    ethicsModal.value = {
      open: true,
      exerciseId: exercise.name,
      timing,
      questions: formattedQuestions,
      settings: ethicalSettings,
      exerciseContext: {
        name: exercise.name,
        phase: exercise.location.phase,
        step: exercise.location.step,
        humanAiScale: exercise.location.human_ai_scale,
        description: exercise.description
      },
      chatHistory,
      existingResponses
    };

    return true;
  };

  // Check if navigation should be blocked
  const checkNavigationBlock = (
    currentExercise: SelectedPinInfo | null,
    targetExercise: SelectedPinInfo,
    targetIndex: number,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }> = []
  ): { allowed: boolean; reason?: string } => {
    // Check if leaving current exercise requires post-ethics
    if (currentExercise && hasEthicsRequirement(currentExercise, 'after') && !isEthicsCompleted(currentExercise.name, 'after')) {
      pendingNavigation.value = { type: 'exercise-change', targetIndex };
      triggerEthicsCheck(currentExercise, 'after', chatHistory);
      return { allowed: false, reason: 'Complete post-exercise ethics review before leaving this exercise' };
    }

    // Check if entering target exercise requires pre-ethics
    if (hasEthicsRequirement(targetExercise, 'before') && !isEthicsCompleted(targetExercise.name, 'before')) {
      pendingNavigation.value = { type: 'exercise-change', targetIndex };
      triggerEthicsCheck(targetExercise, 'before', []);
      return { allowed: false, reason: 'Complete pre-exercise ethics review before starting this exercise' };
    }

    return { allowed: true };
  };

  // Handle ethics completion
  const handleEthicsCompleted = (responses: Record<string, any>) => {
    if (!ethicsModal.value) return;

    const { exerciseId, timing } = ethicsModal.value;
    const key = getEthicsKey(exerciseId, timing);
    const questions = getEthicsQuestions({ name: exerciseId } as SelectedPinInfo, timing);
    const settings = getEthicsSettings({ name: exerciseId } as SelectedPinInfo, timing);

    ethicsData.value[key] = {
      exerciseId,
      timing,
      questions,
      settings: settings || { lens: 'virtue', capital: 'human', zoomingState: 'in' },
      completed: true,
      responses,
      completedAt: Date.now()
    };

    ethicsModal.value = null;
    
    // Return pending navigation info if any
    const pendingNav = pendingNavigation.value;
    pendingNavigation.value = null;
    return pendingNav;
  };

  // Handle ethics cancellation
  const handleEthicsCancel = () => {
    ethicsModal.value = null;
    pendingNavigation.value = null;
  };

  // Watch for changes and auto-save
  watch(ethicsData, saveEthicsData, { deep: true });

  // Load on initialization
  loadEthicsData();

  // Computed values for modal state
  const ethicsModalOpen = computed(() => ethicsModal.value?.open || false);
  const currentEthicsData = computed(() => ethicsModal.value);

  return {
    // Data
    ethicsData: computed(() => ethicsData.value),
    ethicsModalOpen,
    currentEthicsData,
    
    // Functions
    hasEthicsRequirement,
    getExerciseEthicsStatus,
    triggerEthicsCheck,
    checkNavigationBlock,
    handleEthicsCompleted,
    handleEthicsCancel,
    isEthicsCompleted,
    
    // For backwards compatibility with existing components
    getEthicsSettings,
    getEthicsQuestions,
    hasEthics: hasEthicsRequirement,
    isCompleted: isEthicsCompleted,
    
    // Placeholder functions for legacy components (simplified)
    getEthicalCheck: (exerciseId: string, timing: 'before' | 'after') => {
      const key = getEthicsKey(exerciseId, timing);
      const data = ethicsData.value[key];
      return data ? {
        id: key,
        exerciseId,
        timing,
        status: data.completed ? 'completed' : 'pending',
        questions: data.questions.map((q, i) => ({ id: `${key}-q${i}`, question: q, type: 'text', required: true })),
        responses: data.responses
      } : null;
    },
    
    markCompleted: (exerciseId: string, timing: 'before' | 'after', responses: Record<string, any>) => {
      const key = getEthicsKey(exerciseId, timing);
      const existingData = ethicsData.value[key];
      
      if (existingData) {
        ethicsData.value[key] = {
          ...existingData,
          completed: true,
          responses,
          completedAt: Date.now()
        };
      }
    },
    
    ensureEthicalCheck: () => null, // Simplified placeholder
    ensureEthicalCheckFromExercise: () => null // Simplified placeholder
  };
} 