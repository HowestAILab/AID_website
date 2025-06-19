<template>
  <div class="flex flex-col h-full bg-white">

    <!-- Ethics Exercise Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Exercise Header -->
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900">{{ ethicsExercise.name }}</h2>
              <p class="text-sm text-purple-600 font-medium uppercase tracking-wide">
                Pipeline Ethics • {{ ethicsExercise.type }} Reflection
              </p>
            </div>
          </div>
          
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ ethicsExercise.description }}
          </p>
        </div>

        <!-- Pipeline Context -->
        <div 
          v-if="pipelineContext"
          class="bg-gray-50 rounded-lg p-6 border"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Network class="w-5 h-5" />
            Pipeline Context
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Total Exercises:</span>
              <span class="ml-2 text-gray-600">{{ pipelineContext.totalExercises }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Completed:</span>
              <span class="ml-2 text-gray-600">{{ pipelineContext.completedExercises }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Current Phase:</span>
              <span class="ml-2 text-gray-600">{{ pipelineContext.currentPhase }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Progress:</span>
              <span class="ml-2 text-gray-600">
                {{ Math.round((pipelineContext.completedExercises / pipelineContext.totalExercises) * 100) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Question Generation UI for Custom Exercises -->
        <div v-if="isCustomAndNeedsGeneration" class="text-center p-8 border-2 border-dashed rounded-xl space-y-6">
            <h3 class="text-xl font-semibold text-gray-800">Generate Custom Reflection Questions</h3>
            <p class="text-gray-600 max-w-xl mx-auto">This is a custom ethics checkpoint. Generate questions based on the context of the previous exercise to guide your reflection.</p>
            
            <div v-if="previousExercise" class="bg-gray-50 rounded-lg p-4 text-left shadow-sm border">
                <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2"><History class="w-4 h-4" />Context from Previous Step</h4>
                <div class="space-y-2 text-sm">
                    <div><span class="font-medium text-gray-700">Exercise:</span><span class="ml-2 text-gray-600">{{ previousExercise.name }}</span></div>
                    <div><span class="font-medium text-gray-700">Description:</span><p class="ml-2 text-gray-600 mt-1">{{ previousExercise.description }}</p></div>
                </div>
            </div>
            <div v-else class="bg-yellow-50 rounded-lg p-4 text-left shadow-sm border border-yellow-200">
                 <h4 class="font-medium text-yellow-900 mb-2 flex items-center gap-2"><AlertTriangle class="w-4 h-4" />No Previous Exercise</h4>
                <p class="text-sm text-yellow-800">This custom check is the first item in the pipeline. Questions will be general.</p>
            </div>

            <div class="w-full">
                <label for="customContext" class="block text-sm font-medium text-gray-700 text-left mb-2">Additional Context (Optional)</label>
                <Textarea
                    id="customContext"
                    v-model="customContext"
                    placeholder="Provide any additional context, constraints, or specific areas of concern to help tailor the reflection questions..."
                    class="w-full min-h-[100px] resize-y"
                />
            </div>

            <Button @click="generateCustomQuestions" :disabled="isGenerating" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-base">
              <Loader2 v-if="isGenerating" class="w-5 h-5 mr-2 animate-spin" />
              <Sparkles v-else class="w-5 h-5 mr-2" />
              {{ isGenerating ? "Generating..." : "Generate Questions" }}
            </Button>
        </div>

        <!-- Ethics Questions -->
        <div v-else-if="ethicsExercise.questions && ethicsExercise.questions.length > 0" class="space-y-8">
          <div
            v-for="(question, index) in ethicsExercise.questions"
            :key="question.id"
            class="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600 mt-1 flex-shrink-0">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <label class="block text-lg font-medium text-gray-900 mb-4 leading-relaxed">
                    {{ question.question }}
                  </label>

                  <!-- Text Answer -->
                  <Textarea
                    v-if="question.type === 'text'"
                    v-model="responses[question.id]"
                    placeholder="Share your reflections and considerations..."
                    class="min-h-[120px] resize-none text-base leading-relaxed"
                    :class="
                      responses[question.id]
                        ? 'border-green-300 bg-green-50/50'
                        : 'focus:border-purple-300 focus:ring-purple-200'
                    "
                  />

                  <!-- Answer Status -->
                  <div class="mt-4 flex items-center gap-2">
                    <CheckCircle2
                      v-if="responses[question.id]"
                      class="w-5 h-5 text-green-600"
                    />
                    <AlertCircle v-else class="w-5 h-5 text-orange-500" />
                    <span
                      class="text-sm font-medium"
                      :class="
                        responses[question.id]
                          ? 'text-green-600'
                          : 'text-orange-500'
                      "
                    >
                      {{ responses[question.id] ? "Completed" : "Required" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Actions -->
        <div class="border-t pt-8">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              <span v-if="!isFormComplete">
                Complete all questions to finish this ethical reflection
              </span>
              <span v-else-if="ethicsExercise.completed">
                ✅ This reflection was completed on {{ formatDate(ethicsExercise.completedAt!) }}
              </span>
              <span v-else>
                All questions completed! You can now save your reflection.
              </span>
            </div>
            
            <div class="flex items-center gap-3">
              <Button
                v-if="!ethicsExercise.completed"
                @click="handleSaveReflection"
                :disabled="!isFormComplete || isSaving"
                class="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
                <Shield v-else class="w-4 h-4 mr-2" />
                {{ isSaving ? "Saving..." : "Complete Reflection" }}
              </Button>
              
              <Button
                v-else
                @click="handleUpdateReflection"
                :disabled="!hasChanges || isSaving"
                variant="outline"
                class="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
                <Save v-else class="w-4 h-4 mr-2" />
                {{ isSaving ? "Saving..." : "Update Reflection" }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Network,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Sparkles,
  History,
  AlertTriangle,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEthicsExercises } from "@/composables/useEthicsExercises";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import type { SelectedPinInfo, EthicsExercise } from "@/types/exercise";

const props = defineProps<{
  exercise: SelectedPinInfo;
  allExercises: SelectedPinInfo[];
  currentExerciseIndex: number;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "navigate-to-exercise", exerciseIndex: number): void;
}>();

const { 
  updateEthicsExercise, 
  setEthicsExerciseQuestions, 
  ethicsExercises 
} = useEthicsExercises();
const { calculatePipelineProgress, isExerciseCompleted } = usePipelineProgress();

// Local state
const responses = ref<Record<string, any>>({});
const originalResponses = ref<Record<string, any>>({});
const isSaving = ref(false);
const isGenerating = ref(false);
const customContext = ref("");

// USE a computed property to reactively get data from the central store
const ethicsExercise = computed((): EthicsExercise => {
  const exerciseId = props.exercise.ethicsExerciseData?.id;
  if (exerciseId && ethicsExercises.value[exerciseId]) {
    return ethicsExercises.value[exerciseId];
  }
  return props.exercise.ethicsExerciseData!; // Fallback
});

// Computed properties
const totalQuestions = computed(() => ethicsExercise.value.questions.length);

const answeredQuestions = computed(() => {
  if (!ethicsExercise.value.questions || ethicsExercise.value.questions.length === 0) {
    return 0;
  }
  return Object.keys(responses.value).filter((key) => {
    const value = responses.value[key];
    return value !== undefined && value !== null && value !== "";
  }).length;
});

const isFormComplete = computed(() => {
  if (!ethicsExercise.value.questions || ethicsExercise.value.questions.length === 0) {
    return false; // Cannot be complete if there are no questions to answer
  }
  return ethicsExercise.value.questions.every((q) => {
    const value = responses.value[q.id];
    return q.required
      ? value !== undefined && value !== null && value !== ""
      : true;
  });
});

const hasChanges = computed(() => {
  return Object.keys(responses.value).some((key) => {
    return originalResponses.value[key] !== responses.value[key];
  });
});

const canGoPrevious = computed(() => props.currentExerciseIndex > 0);
const canGoNext = computed(
  () => props.currentExerciseIndex < props.allExercises.length - 1
);

// Calculate pipeline context
const pipelineContext = computed(() => {
  const regularExercises = props.allExercises.filter(ex => !ex.isEthicsExercise);
  const completedRegularExercises = regularExercises.filter(ex => 
    isExerciseCompleted(ex.name)
  ).length;
  
  // Get current phase based on completed exercises
  const phases = ["Discover", "Define", "Develop", "Deliver"];
  const currentPhaseIndex = Math.floor((completedRegularExercises / regularExercises.length) * phases.length);
  const currentPhase = phases[Math.min(currentPhaseIndex, phases.length - 1)];

  return {
    totalExercises: regularExercises.length,
    completedExercises: completedRegularExercises,
    currentPhase,
    allPhases: phases
  };
});

const isCustomAndNeedsGeneration = computed(() => {
    return ethicsExercise.value.type === 'custom' && (!ethicsExercise.value.questions || ethicsExercise.value.questions.length === 0);
});

const previousExercise = computed(() => {
    if (props.currentExerciseIndex > 0) {
        return props.allExercises[props.currentExerciseIndex - 1];
    }
    return null;
});

// Helper functions
const formatDate = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

// Navigation functions
const goBack = () => {
  emit("back");
};

const goToPreviousExercise = () => {
  if (canGoPrevious.value) {
    emit("navigate-to-exercise", props.currentExerciseIndex - 1);
  }
};

const goToNextExercise = () => {
  if (canGoNext.value) {
    emit("navigate-to-exercise", props.currentExerciseIndex + 1);
  }
};

// Save functions
const handleSaveReflection = async () => {
  if (!isFormComplete.value || isSaving.value) return;

  isSaving.value = true;
  try {
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateEthicsExercise(ethicsExercise.value.id, responses.value);
    originalResponses.value = { ...responses.value };
    
  } catch (error) {
    console.error("Error saving ethics reflection:", error);
  } finally {
    isSaving.value = false;
  }
};

const handleUpdateReflection = async () => {
  if (!hasChanges.value || isSaving.value) return;

  isSaving.value = true;
  try {
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateEthicsExercise(ethicsExercise.value.id, responses.value);
    originalResponses.value = { ...responses.value };
    
  } catch (error) {
    console.error("Error updating ethics reflection:", error);
  } finally {
    isSaving.value = false;
  }
};

const generateCustomQuestions = async () => {
  isGenerating.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const context = previousExercise.value
      ? `based on the previous exercise "${previousExercise.value.name}"`
      : 'for a general pipeline checkpoint';
    
    const additionalContextInfo = customContext.value ? `\n\nAdditional user context: "${customContext.value}"` : "";

    const newQuestions = [
      { id: `${ethicsExercise.value.id}-q1`, question: `What are the immediate ethical implications of the work done in the previous step?${additionalContextInfo}`, type: 'text' as const, required: true },
      { id: `${ethicsExercise.value.id}-q2`, question: `How does the outcome of the last exercise align with the project's overall ethical goals ${context}?`, type: 'text' as const, required: true },
      { id: `${ethicsExercise.value.id}-q3`, question: `Are there any new stakeholders or affected groups to consider now ${context}?`, type: 'text' as const, required: true },
    ];
    
    setEthicsExerciseQuestions(ethicsExercise.value.id, newQuestions);
  } finally {
    isGenerating.value = false;
  }
};

// Initialize component
const initializeEthicsExercise = () => {
  if (ethicsExercise.value.responses) {
    responses.value = { ...ethicsExercise.value.responses };
    originalResponses.value = { ...ethicsExercise.value.responses };
  } else {
    responses.value = {};
    originalResponses.value = {};
  }
};

onMounted(() => {
  initializeEthicsExercise();
});

watch(
  () => props.exercise,
  () => {
    initializeEthicsExercise();
  }
);
</script> 