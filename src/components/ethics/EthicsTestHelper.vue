<template>
  <div class="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Ethics Testing Helper</h3>
    <p class="text-sm text-gray-600 mb-4">Use this to test the ethics modal functionality</p>
    
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <Button 
          @click="triggerBeforeEthics"
          class="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Test "Before" Ethics Modal
        </Button>
        <Button 
          @click="triggerAfterEthics"
          class="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Test "After" Ethics Modal
        </Button>
      </div>
      
      <div class="text-xs text-gray-500">
        <p>• This uses dummy data from "AI-Powered Trend Analysis"</p>
        <p>• Ethics responses will be saved and can be exported</p>
        <p>• Remove this component after testing</p>
      </div>
    </div>
  </div>

  <!-- Ethics Modal -->
  <EthicsModal
    v-if="currentEthicsData"
    :open="showModal"
    :exercise-name="currentEthicsData.exerciseName"
    :timing="currentEthicsData.timing"
    :ethics-questions="currentEthicsData.ethicsQuestions"
    :ethics-settings="currentEthicsData.ethicsSettings"
    :exercise-context="currentEthicsData.exerciseContext"
    :chat-history="currentEthicsData.chatHistory"
    :previous-exercise-context="currentEthicsData.previousExerciseContext"
    :existing-responses="currentEthicsData.existingResponses"
    @update:open="showModal = $event"
    @submit="handleEthicsSubmit"
    @cancel="handleEthicsCancel"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import EthicsModal from './EthicsModal.vue';
import { ETHICAL_LENSES, MAIN_CAPITALS } from '@/types/ethics';
import type { ChatMessage, ExerciseContext, PreviousExerciseContext } from './EthicsModal.vue';

const showModal = ref(false);
const currentEthicsData = ref<any>(null);

// Dummy exercise data based on "AI-Powered Trend Analysis"
const dummyExercise = {
  name: "AI-Powered Trend Analysis",
  phase: "Discover",
  step: "Discover", 
  humanAiScale: 9,
  description: "Use AI to automatically analyze market trends, emerging technologies, and user behavior patterns from large datasets to identify opportunities and threats in the problem space."
};

const dummyChatHistory: ChatMessage[] = [
  {
    role: 'user',
    content: 'What are the key data sources I should consider for trend analysis?',
    timestamp: Date.now() - 3600000
  },
  {
    role: 'assistant', 
    content: 'For comprehensive trend analysis, consider social media platforms, market research reports, patent databases, academic publications, and consumer behavior data. Each provides unique insights into emerging patterns.',
    timestamp: Date.now() - 3500000
  }
];

const dummyPreviousContext: PreviousExerciseContext = {
  name: "User Research Interviews",
  chatCount: 8,
  outcomes: ["Identified key user pain points", "Discovered unmet needs"]
};

const triggerBeforeEthics = () => {
  const ethicsQuestions = [
    {
      id: 'before-1',
      question: 'Ensure data sources are legitimate and privacy-compliant',
      type: 'text' as const,
      required: true
    },
    {
      id: 'before-2', 
      question: 'Consider potential biases in datasets being analyzed',
      type: 'text' as const,
      required: true
    },
    {
      id: 'before-3',
      question: 'Verify that trend analysis doesn\'t reinforce existing inequalities',
      type: 'text' as const,
      required: true
    }
  ];

  const ethicsSettings = {
    ethicalLens: ETHICAL_LENSES.find(l => l.type === 'consequentialist') || ETHICAL_LENSES[0],
    mainCapital: MAIN_CAPITALS.find(c => c.type === 'human') || MAIN_CAPITALS[0],
    zoomingState: 'out' as const
  };

  const exerciseContext: ExerciseContext = {
    name: dummyExercise.name,
    phase: dummyExercise.phase,
    step: dummyExercise.step,
    humanAiScale: dummyExercise.humanAiScale,
    description: dummyExercise.description
  };

  currentEthicsData.value = {
    exerciseName: dummyExercise.name,
    timing: 'before',
    ethicsQuestions,
    ethicsSettings,
    exerciseContext,
    chatHistory: [],
    previousExerciseContext: undefined,
    existingResponses: {}
  };

  showModal.value = true;
};

const triggerAfterEthics = () => {
  const ethicsQuestions = [
    {
      id: 'after-1',
      question: 'Validate AI findings with human expertise and domain knowledge',
      type: 'text' as const,
      required: true
    },
    {
      id: 'after-2',
      question: 'Consider the societal impact of identified trends and opportunities', 
      type: 'text' as const,
      required: true
    },
    {
      id: 'after-3',
      question: 'Ensure recommendations don\'t exclude or harm marginalized groups',
      type: 'text' as const,
      required: true
    }
  ];

  const ethicsSettings = {
    ethicalLens: ETHICAL_LENSES.find(l => l.type === 'care') || ETHICAL_LENSES[0],
    mainCapital: MAIN_CAPITALS.find(c => c.type === 'human') || MAIN_CAPITALS[0],
    zoomingState: 'in' as const
  };

  const exerciseContext: ExerciseContext = {
    name: dummyExercise.name,
    phase: dummyExercise.phase,
    step: dummyExercise.step,
    humanAiScale: dummyExercise.humanAiScale,
    description: dummyExercise.description
  };

  currentEthicsData.value = {
    exerciseName: dummyExercise.name,
    timing: 'after',
    ethicsQuestions,
    ethicsSettings,
    exerciseContext,
    chatHistory: dummyChatHistory,
    previousExerciseContext: dummyPreviousContext,
    existingResponses: {}
  };

  showModal.value = true;
};

const handleEthicsSubmit = (responses: Record<string, any>) => {
  console.log('Ethics responses submitted:', responses);
  
  // Save to localStorage for testing
  const key = `ethics-test-${currentEthicsData.value.exerciseName}-${currentEthicsData.value.timing}`;
  localStorage.setItem(key, JSON.stringify({
    exerciseName: currentEthicsData.value.exerciseName,
    timing: currentEthicsData.value.timing,
    responses,
    completedAt: new Date().toISOString()
  }));
  
  alert(`Ethics review completed! Check browser console and localStorage key: ${key}`);
  
  showModal.value = false;
  currentEthicsData.value = null;
};

const handleEthicsCancel = () => {
  console.log('Ethics review cancelled');
  showModal.value = false;
  currentEthicsData.value = null;
};
</script> 