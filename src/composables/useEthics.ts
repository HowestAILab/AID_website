import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo } from '@/types/exercise';
import { ETHICAL_LENSES, MAIN_CAPITALS } from '@/types/ethics';
import type { EthicalSettings, EthicalLens, MainCapital } from '@/types/ethics';

interface EthicsData {
  exerciseId: string;
  timing: 'before' | 'after';
  settings: EthicalSettings;
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'rating' | 'multiple-choice';
    options?: string[];
    required: boolean;
  }>;
  completed: boolean;
  responses?: Record<string, any>;
  completedAt?: number;
  additionalContext?: string;
}

interface UnifiedEthicsModal {
  open: boolean;
  mode: 'new' | 'view' | 'edit';
  exerciseId: string;
  timing: 'before' | 'after';
  exerciseContext: {
    name: string;
    phase: string;
    step: string;
    humanAiScale: number;
    description?: string;
  };
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }>;
  previousExerciseContext?: {
    name: string;
    chatCount: number;
    outcomes?: string[];
  };
  existingEthicsData?: {
    settings: EthicalSettings;
    questions: Array<{
      id: string;
      question: string;
      type: 'text' | 'rating' | 'multiple-choice';
      options?: string[];
      required: boolean;
    }>;
    responses: Record<string, any>;
    completedAt?: number;
    additionalContext?: string;
  };
}

const LOCAL_STORAGE_KEY = 'ethics-data';

export function useEthics() {
  const ethicsData = ref<Record<string, EthicsData>>({});
  const unifiedEthicsModal = ref<UnifiedEthicsModal | null>(null);
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

  // Trigger unified ethics modal
  const openEthicsModal = (
    exercise: SelectedPinInfo,
    timing: 'before' | 'after',
    mode: 'new' | 'view' | 'edit' = 'new',
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }> = []
  ) => {
    const key = getEthicsKey(exercise.name, timing);
    const existingData = ethicsData.value[key];

    unifiedEthicsModal.value = {
      open: true,
      mode,
      exerciseId: exercise.name,
      timing,
      exerciseContext: {
        name: exercise.name,
        phase: exercise.location.phase,
        step: exercise.location.step,
        humanAiScale: exercise.location.human_ai_scale,
        description: exercise.description
      },
      chatHistory,
      existingEthicsData: existingData ? {
        settings: existingData.settings,
        questions: existingData.questions,
        responses: existingData.responses || {},
        completedAt: existingData.completedAt,
        additionalContext: existingData.additionalContext
      } : undefined
    };

    return true;
  };

  // Handle ethics completion/update
  const handleEthicsSubmit = (data: {
    settings: EthicalSettings;
    questions: Array<{
      id: string;
      question: string;
      type: 'text' | 'rating' | 'multiple-choice';
      options?: string[];
      required: boolean;
    }>;
    responses: Record<string, any>;
    additionalContext?: string;
  }) => {
    if (!unifiedEthicsModal.value) return;

    const { exerciseId, timing } = unifiedEthicsModal.value;
    const key = getEthicsKey(exerciseId, timing);

    ethicsData.value[key] = {
      exerciseId,
      timing,
      settings: data.settings,
      questions: data.questions,
      completed: true,
      responses: data.responses,
      completedAt: Date.now(),
      additionalContext: data.additionalContext
    };

    unifiedEthicsModal.value = null;
    
    // Return pending navigation info if any
    const pendingNav = pendingNavigation.value;
    pendingNavigation.value = null;
    return pendingNav;
  };

  // Handle ethics cancellation
  const handleEthicsCancel = () => {
    unifiedEthicsModal.value = null;
    pendingNavigation.value = null;
  };

  // Get completed ethics data for a specific exercise and timing
  const getCompletedEthicsData = (exerciseId: string, timing: 'before' | 'after') => {
    const key = getEthicsKey(exerciseId, timing);
    const data = ethicsData.value[key];
    return data?.completed ? data : null;
  };

  // Update ethics responses for already completed ethics
  const updateEthicsResponses = (exerciseId: string, timing: 'before' | 'after', responses: Record<string, any>) => {
    const key = getEthicsKey(exerciseId, timing);
    const existingData = ethicsData.value[key];
    
    if (existingData?.completed) {
      ethicsData.value[key] = {
        ...existingData,
        responses,
        completedAt: Date.now() // Update completion time
      };
      return true;
    }
    return false;
  };

  // Check if an exercise has any completed ethics
  const hasCompletedEthics = (exerciseId: string): boolean => {
    const beforeKey = getEthicsKey(exerciseId, 'before');
    const afterKey = getEthicsKey(exerciseId, 'after');
    return !!(ethicsData.value[beforeKey]?.completed || ethicsData.value[afterKey]?.completed);
  };

  // Get all completed ethics for an exercise
  const getExerciseCompletedEthics = (exerciseId: string) => {
    const beforeKey = getEthicsKey(exerciseId, 'before');
    const afterKey = getEthicsKey(exerciseId, 'after');
    
    return {
      before: ethicsData.value[beforeKey]?.completed ? ethicsData.value[beforeKey] : null,
      after: ethicsData.value[afterKey]?.completed ? ethicsData.value[afterKey] : null
    };
  };

  // Check if navigation should be blocked due to incomplete ethics
  const checkNavigationBlock = (exerciseId: string): string | null => {
    const exerciseEthics = getExerciseEthicsStatus({ name: exerciseId } as any);
    
    if (exerciseEthics.beforeRequired && !exerciseEthics.beforeCompleted) {
      return "Please complete the pre-exercise ethics review before proceeding.";
    }
    
    if (exerciseEthics.afterRequired && !exerciseEthics.afterCompleted) {
      return "Please complete the post-exercise ethics review before proceeding.";
    }
    
    return null;
  };

  // Watch for changes and auto-save
  watch(ethicsData, saveEthicsData, { deep: true });

  // Load on initialization
  loadEthicsData();

  // Computed values for modal state
  const ethicsModalOpen = computed(() => unifiedEthicsModal.value?.open || false);
  const currentEthicsData = computed(() => unifiedEthicsModal.value);

  return {
    // Data
    ethicsData: computed(() => ethicsData.value),
    unifiedEthicsModal: computed(() => unifiedEthicsModal.value),
    ethicsModalOpen,
    currentEthicsData,
    
    // Main functions
    openEthicsModal,
    handleEthicsSubmit,
    handleEthicsCancel,
    checkNavigationBlock,
    
    // Core functions
    hasEthicsRequirement,
    getExerciseEthicsStatus,
    isEthicsCompleted,
    getCompletedEthicsData,
    updateEthicsResponses,
    hasCompletedEthics,
    getExerciseCompletedEthics,
    
    // Legacy compatibility
    getEthicsSettings,
    getEthicsQuestions,
    hasEthics: hasEthicsRequirement,
    isCompleted: isEthicsCompleted,
    triggerEthicsCheck: openEthicsModal, // Map old function to new
    handleEthicsCompleted: handleEthicsSubmit, // Map old function to new
    
    // Simplified legacy functions
    getEthicalCheck: (exerciseId: string, timing: 'before' | 'after') => {
      const key = getEthicsKey(exerciseId, timing);
      const data = ethicsData.value[key];
      return data ? {
        id: key,
        exerciseId,
        timing,
        status: data.completed ? 'completed' : 'pending',
        questions: data.questions.map((q, i) => ({ 
          id: q.id || `${key}-q${i}`, 
          question: typeof q === 'string' ? q : q.question, 
          type: 'text', 
          required: true 
        })),
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
      } else {
        // Create new entry if it doesn't exist
        ethicsData.value[key] = {
          exerciseId,
          timing,
          settings: {
            ethicalLens: ETHICAL_LENSES[0],
            mainCapital: MAIN_CAPITALS[0],
            zoomingState: 'in' as const
          },
          questions: [],
          completed: true,
          responses,
          completedAt: Date.now()
        };
      }
    }
  };
} 