import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo, EthicsExercise } from '@/types/exercise';
import { useProjectLocalStorage } from './storage/useProjectLocalStorage';
import { useProjects } from './useProjects';
import { ETHICAL_LENSES, MAIN_CAPITALS } from '@/types/ethics';

const { currentProject } = useProjects();
const ethicsExercisesStorage = useProjectLocalStorage('ethics-exercises');

// Create reactive state for ethics exercises
const ethicsExercises = ref<Record<string, EthicsExercise>>(ethicsExercisesStorage.getItem() || {});

// Watch for changes and save to localStorage
watch(
  ethicsExercises,
  (newValue) => {
    ethicsExercisesStorage.setItem(newValue);
  },
  { deep: true }
);

// When the project changes, reload the ethics exercises data
watch(
  () => currentProject.value?.id,
  (newProjectId, oldProjectId) => {
    if (newProjectId !== oldProjectId) {
      ethicsExercises.value = ethicsExercisesStorage.getItem() || {};
    }
  }
);

export function useEthicsExercises() {
  // Predefined ethics exercise templates
  const predefinedEthicsExercises = [
    {
      type: 'initial' as const,
      name: 'Initial Ethical Reflection',
      description: 'Establish ethical foundations and intentions for your entire design process',
      position: 0, // At the beginning
      questions: [
        {
          id: 'initial-values',
          question: 'What core values and ethical principles should guide your entire design process?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'initial-stakeholders',
          question: 'Who are all the stakeholders that might be affected by your solution, and what responsibilities do you have toward them?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'initial-risks',
          question: 'What potential ethical risks or unintended consequences can you anticipate at this early stage?',
          type: 'text' as const,
          required: true
        }
      ]
    },
    {
      type: 'intermediate' as const,
      name: 'Intermediate Ethical Reflection',
      description: 'Evaluate and adjust your ethical approach as your understanding deepens',
      position: 0.5, // In the middle
      questions: [
        {
          id: 'intermediate-evolution',
          question: 'How has your understanding of the ethical implications evolved since the initial reflection?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'intermediate-conflicts',
          question: 'What ethical tensions or conflicts have emerged, and how are you addressing them?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'intermediate-adjustments',
          question: 'What adjustments to your approach have you made or should you make based on new insights?',
          type: 'text' as const,
          required: true
        }
      ]
    },
    {
      type: 'final' as const,
      name: 'Final Ethical Reflection',
      description: 'Comprehensively evaluate the ethical outcomes and implications of your solution',
      position: 1, // At the end
      questions: [
        {
          id: 'final-assessment',
          question: 'How well does your final solution align with the ethical principles you established initially?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'final-impact',
          question: 'What are the likely positive and negative impacts of your solution on different stakeholder groups?',
          type: 'text' as const,
          required: true
        },
        {
          id: 'final-future',
          question: 'What ongoing ethical considerations should be monitored as this solution is implemented and evolves?',
          type: 'text' as const,
          required: true
        }
      ]
    }
  ];

  // Create an ethics exercise
  const createEthicsExercise = (
    type: 'initial' | 'intermediate' | 'final' | 'custom',
    position: number,
    customData?: Partial<EthicsExercise>
  ): EthicsExercise => {
    const template = predefinedEthicsExercises.find(t => t.type === type);
    const id = `ethics-${type}-${Date.now()}`;
    
    return {
      id,
      name: customData?.name || template?.name || `Ethics Reflection ${position}`,
      description: customData?.description || template?.description || 'Ethical reflection on the pipeline progress',
      type,
      position,
      settings: {
        ethicalLens: 'virtue', // Default to virtue ethics for zoom-out
        mainCapital: 'human', // Default to human capital
        zoomingState: 'out'
      },
      questions: customData?.questions || template?.questions || [],
      completed: false,
      ...(customData || {})
    };
  };

  // Add predefined ethics exercises to a list of pins
  const addPredefinedEthicsExercises = (selectedPins: SelectedPinInfo[]): SelectedPinInfo[] => {
    let result = selectedPins.filter(p => !p.isEthicsExercise || p.ethicsExerciseData?.type === 'custom');

    const addOrGetPredefined = (type: 'initial' | 'intermediate' | 'final', position: number) => {
      let existing = Object.values(ethicsExercises.value).find(ex => ex.type === type);
      if (!existing) {
        existing = createEthicsExercise(type, position);
        ethicsExercises.value[existing.id] = existing;
      }
      return {
        name: existing.name,
        originalIndex: -1, // Distinguishes from real exercises
        order: -1, // Will be sorted later
        description: existing.description,
        location: { phase: 'Ethics', step: 'Reflection', human_ai_scale: 0 },
        isEthicsExercise: true,
        ethicsExerciseData: existing,
      };
    };

    const initialCheck = addOrGetPredefined('initial', 0);
    const intermediateCheck = addOrGetPredefined('intermediate', 0.5);
    const finalCheck = addOrGetPredefined('final', 1);

    // Separate regular exercises by phase
    const discover = result.filter(p => p.location.phase === 'Discover');
    const define = result.filter(p => p.location.phase === 'Define');
    const develop = result.filter(p => p.location.phase === 'Develop');
    const deliver = result.filter(p => p.location.phase === 'Deliver');
    const customEthics = selectedPins.filter(p => p.isEthicsExercise && p.ethicsExerciseData?.type === 'custom');

    // Reconstruct the pipeline in the correct, locked order
    const finalPipeline = [
      initialCheck,
      ...discover,
      ...define,
      intermediateCheck,
      ...develop,
      ...deliver,
      finalCheck,
    ];

    // Re-insert any custom ethics exercises based on their original relative order
    customEthics.forEach(customPin => {
        const originalIndex = selectedPins.indexOf(customPin);
        // Find the last non-custom pin before this one
        let lastRegularPinIndex = -1;
        for (let i = originalIndex - 1; i >= 0; i--) {
            const pin = selectedPins[i];
            if (!pin.isEthicsExercise || pin.ethicsExerciseData?.type !== 'custom') {
                lastRegularPinIndex = finalPipeline.findIndex(p => 
                    (p.isEthicsExercise ? p.ethicsExerciseData?.id : p.originalIndex) === 
                    (pin.isEthicsExercise ? pin.ethicsExerciseData?.id : pin.originalIndex)
                );
                break;
            }
        }
        finalPipeline.splice(lastRegularPinIndex + 1, 0, customPin);
    });

    return finalPipeline;
  };

  // Update ethics exercise responses
  const updateEthicsExercise = (exerciseId: string, responses: Record<string, any>) => {
    const exercise = ethicsExercises.value[exerciseId];
    if (exercise) {
      const isCompleted = exercise.questions.every(q => {
        const value = responses[q.id];
        return q.required ? (value !== undefined && value !== null && value !== '') : true;
      });

      ethicsExercises.value[exerciseId] = {
        ...exercise,
        responses,
        completed: isCompleted,
        completedAt: isCompleted ? Date.now() : undefined
      };
    }
  };

  // Update questions for a custom ethics exercise
  const setEthicsExerciseQuestions = (exerciseId: string, questions: EthicsExercise['questions']) => {
    const exercise = ethicsExercises.value[exerciseId];
    if (exercise && exercise.type === 'custom') {
      ethicsExercises.value[exerciseId] = {
        ...exercise,
        questions,
      };
    }
  };

  // Get ethics exercise by ID
  const getEthicsExercise = (exerciseId: string): EthicsExercise | null => {
    return ethicsExercises.value[exerciseId] || null;
  };

  // Check if an ethics exercise is completed
  const isEthicsExerciseCompleted = (exerciseId: string): boolean => {
    return ethicsExercises.value[exerciseId]?.completed || false;
  };

  // Remove an ethics exercise from the state and from a list of pins
  const removeEthicsExercise = (exerciseId: string, currentPins: SelectedPinInfo[]): SelectedPinInfo[] => {
    if (ethicsExercises.value[exerciseId]) {
        delete ethicsExercises.value[exerciseId];
    }
    return currentPins.filter(pin => 
        !pin.isEthicsExercise || pin.ethicsExerciseData?.id !== exerciseId
    );
  };

  // Get all ethics exercises
  const getAllEthicsExercises = computed(() => ethicsExercises.value);

  // Get ethics exercises for display positions (for diamond grid purple lines)
  const getEthicsExercisePositions = () => {
    return predefinedEthicsExercises.map(template => ({
      type: template.type,
      position: template.position,
      name: template.name,
      description: template.description,
      exists: Object.values(ethicsExercises.value).some(ex => ex.type === template.type),
      completed: Object.values(ethicsExercises.value).find(ex => ex.type === template.type)?.completed || false
    }));
  };

  // Add custom ethics exercise at specific position
  const addCustomEthicsExercise = (position: number, selectedPins: SelectedPinInfo[]): SelectedPinInfo[] => {
    const ethicsExercise = createEthicsExercise('custom', position, {
      name: `Custom Ethics Reflection`,
      description: 'Custom ethical reflection point in your pipeline'
    });
    
    ethicsExercises.value[ethicsExercise.id] = ethicsExercise;
    
    const ethicsPin: SelectedPinInfo = {
      name: ethicsExercise.name,
      originalIndex: -1,
      order: position,
      description: ethicsExercise.description,
      location: {
        phase: 'Ethics',
        step: 'Reflection',
        human_ai_scale: 0
      },
      isEthicsExercise: true,
      ethicsExerciseData: ethicsExercise
    };
    
    const result = [...selectedPins];
    result.splice(position, 0, ethicsPin);
    return result;
  };

  return {
    // Data
    ethicsExercises: getAllEthicsExercises,
    
    // Core functions
    createEthicsExercise,
    addPredefinedEthicsExercises,
    updateEthicsExercise,
    setEthicsExerciseQuestions,
    getEthicsExercise,
    isEthicsExerciseCompleted,
    removeEthicsExercise,
    getEthicsExercisePositions,
    addCustomEthicsExercise,
    
    // Utility
    predefinedEthicsExercises
  };
} 