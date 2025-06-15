<template>
  <ResizablePanelGroup direction="horizontal" class="h-full w-full">
    <ResizablePanel>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-6 pb-4 flex justify-between border-b">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft />
            <h1 class="ml-2 text-lg font-medium">Back to Pipeline</h1>
          </button>
          
          <div class="flex items-center gap-2">
            <!-- Exercise Navigation -->
            <Popover>
              <PopoverTrigger as-child>
                <button
                  class="text-sm py-2 px-4 bg-white border rounded cursor-pointer flex items-center gap-2"
                >
                  {{ exercise.name }}
                  <ChevronDown class="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    v-for="(pipelineExercise, index) in allExercises"
                    :key="pipelineExercise.originalIndex"
                    @click="goToExercise(index)"
                    class="w-full text-left hover:bg-gray-100 rounded flex items-center gap-3 p-2 cursor-pointer"
                    :class="{ 'bg-[#F5F0E5]': pipelineExercise.originalIndex === exercise.originalIndex }"
                  >
                    <span class="bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5 text-sm shrink-0">
                      {{ index + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <span class="font-medium block truncate">{{ pipelineExercise.name }}</span>
                      <span class="text-xs text-gray-500">{{ pipelineExercise.location.phase }}</span>
                    </div>
                    <CheckCircle2 
                      v-if="isExerciseCompleted(pipelineExercise.name)"
                      class="w-4 h-4 text-green-600 flex-shrink-0"
                    />
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            <!-- Navigation Buttons -->
            <button 
              @click="goToPreviousExercise"
              :disabled="!canGoPrevious"
              class="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button 
              @click="goToNextExercise"
              :disabled="!canGoNext"
              class="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Exercise Info -->
        <div class="px-6 flex items-center gap-4 mb-2">
          <p class="text-sm bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5">
            {{ currentExerciseIndex + 1 }} of {{ allExercises.length }}
          </p>
          <h2 class="text-2xl font-semibold">{{ exercise.name }}</h2>
          
          <!-- Drive Type Badge -->
          <div
            v-if="derivedDriveTypeConfig"
            class="flex items-center gap-2 rounded-sm px-2 py-0.5 text-sm"
            :class="[
              derivedDriveTypeConfig.bgColor,
              derivedDriveTypeConfig.textColor,
            ]"
          >
            <UserRound v-if="derivedDriveType === 'human'" />
            <Bot v-else-if="derivedDriveType === 'ai'" />
            <UserCog v-else-if="derivedDriveType === 'human-ai'" />
            <p>{{ derivedDriveTypeConfig.text }}</p>
          </div>
          
          <!-- Phase/Step Info -->
          <div class="text-sm text-gray-600">
            {{ exercise.location.phase }} / {{ exercise.location.step }}
          </div>

          <!-- Completion Status -->
          <div class="ml-auto flex items-center gap-2">
            <div v-if="isExerciseCompleted(exercise.name)" class="flex items-center gap-2 text-green-600">
              <CheckCircle2 class="w-5 h-5" />
              <span class="text-sm font-medium">Completed</span>
            </div>
            <Button
              v-if="!isExerciseCompleted(exercise.name)"
              @click="markAsCompleted"
              class="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Check class="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
            <Button
              v-else
              @click="markAsIncomplete"
              variant="outline"
              size="sm"
            >
              <RotateCcw class="w-4 h-4 mr-2" />
              Mark Incomplete
            </Button>
          </div>
        </div>

        <!-- Exercise Description -->
        <div class="px-6 text-gray-600 mb-4">
          <p>{{ exercise.description }}</p>
        </div>

        <!-- Progress Indicators -->
        <div class="px-6 mb-4">
          <div class="flex items-center gap-6 text-sm">
            <!-- Ethics Status -->
            <div v-if="exerciseHasEthics(exercise)" class="flex items-center gap-2">
              <Shield class="w-4 h-4" />
              <span class="text-gray-600">Ethics:</span>
              <span 
                :class="exerciseEthicsCompleted(exercise) ? 'text-green-600 font-medium' : 'text-orange-600'"
              >
                {{ exerciseEthicsCompleted(exercise) ? 'Completed' : 'Pending' }}
              </span>
            </div>

            <!-- Chat Messages -->
            <div class="flex items-center gap-2">
              <MessageSquare class="w-4 h-4" />
              <span class="text-gray-600">Chat:</span>
              <span class="text-gray-500">{{ getChatHistoryCount(exercise.name) }} messages</span>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 min-h-0">
          <div class="bg-gray-200 h-full flex items-center justify-center">
            <div class="text-center">
              <p class="text-gray-600 mb-2">Miro Board Integration</p>
              <p class="text-sm text-gray-500">Exercise workspace will be embedded here</p>
            </div>
          </div>
        </div>
      </div>
    </ResizablePanel>
    
    <ResizableHandle />
    
    <ResizablePanel :default-size="20" :min-size="20" :max-size="40">
      <ExerciseAIChat />
    </ResizablePanel>
  </ResizablePanelGroup>

  <!-- Ethics Dialog -->
  <EthicsCheckDialog
    v-if="ethicsDialogCheck"
    v-model:open="ethicsDialogOpen"
    :exercise-id="ethicsDialogCheck.exerciseId"
    :timing="ethicsDialogCheck.timing"
    :default-questions="ethicsDialogCheck.questions"
    :settings="ethicsDialogCheck.settings"
    @completed="handleEthicsCompleted"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import {
  ArrowLeft,
  UserRound,
  Bot,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Check,
  RotateCcw,
  Shield,
  MessageSquare,
} from "lucide-vue-next";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ExerciseAIChat from "@/components/exercise/ExerciseAIChat.vue";
import EthicsCheckDialog from "@/components/ethics/EthicsCheckDialog.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { useEthics } from "@/composables/useEthics";
import type { SelectedPinInfo } from "@/types/exercise";

type DriveType = "human" | "human-ai" | "ai";

const props = defineProps<{
  exercise: SelectedPinInfo;
  allExercises: SelectedPinInfo[];
  currentExerciseIndex: number;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "navigate-to-exercise", exerciseIndex: number): void;
}>();

// Composables
const { 
  isExerciseCompleted, 
  markExerciseCompleted, 
  markExerciseIncomplete,
  getExerciseProgress 
} = usePipelineProgress();

const { 
  hasEthics, 
  isCompleted: isEthicsCompleted, 
  ensureEthicalCheckFromExercise,
  setContextData 
} = useEthics();

// Computed properties
const derivedDriveType = computed<DriveType>(() => {
  const scale = props.exercise.location.human_ai_scale;
  if (scale <= 2) return "human";
  if (scale >= 3 && scale <= 6) return "human-ai";
  return "ai";
});

const derivedDriveTypeConfig = computed(() => {
  switch (derivedDriveType.value) {
    case "human-ai":
      return {
        text: "Human+AI Collaboration",
        bgColor: "bg-[#F3E8FF]",
        textColor: "text-[#6B21A8]",
      };
    case "ai":
      return {
        text: "AI-driven",
        bgColor: "bg-[#D1FAE5]",
        textColor: "text-[#076046]",
      };
    case "human":
    default:
      return {
        text: "Human-driven",
        bgColor: "bg-[#DBE9FE]",
        textColor: "text-[#1D40AE]",
      };
  }
});

const canGoPrevious = computed(() => props.currentExerciseIndex > 0);
const canGoNext = computed(() => props.currentExerciseIndex < props.allExercises.length - 1);

// Ethics state
const ethicsDialogOpen = ref(false);
const ethicsDialogCheck = ref<any>(null);

const showEthicsDialog = (timing: 'before' | 'after', contextData?: Record<string, any>) => {
  const check = ensureEthicalCheckFromExercise(props.exercise, timing, contextData);
  if (check) {
    ethicsDialogCheck.value = check;
    ethicsDialogOpen.value = true;
  }
};

// Helper functions
const exerciseHasEthics = (exercise: SelectedPinInfo): boolean => {
  return Boolean(hasEthics(exercise, 'before') || hasEthics(exercise, 'after'));
};

const exerciseEthicsCompleted = (exercise: SelectedPinInfo): boolean => {
  let completed = true;
  if (hasEthics(exercise, 'before'))
    completed = completed && isEthicsCompleted(exercise.name, 'before');
  if (hasEthics(exercise, 'after'))
    completed = completed && isEthicsCompleted(exercise.name, 'after');
  return completed;
};

const getChatHistoryCount = (exerciseId: string): number => {
  const progress = getExerciseProgress(exerciseId);
  return progress?.chatHistory?.length || 0;
};

// Navigation functions
const goBack = () => {
  emit("back");
};

const goToPreviousExercise = () => {
  // Block leaving current exercise if after ethics not completed
  if (hasEthics(props.exercise, 'after') && !isEthicsCompleted(props.exercise.name, 'after')) {
    const contextData = {
      exerciseResults: 'Results from current exercise',
      timestamp: new Date().toISOString()
    };
    showEthicsDialog('after', contextData);
    return;
  }
  
  if (canGoPrevious.value) {
    emit("navigate-to-exercise", props.currentExerciseIndex - 1);
  }
};

const goToNextExercise = () => {
  // Block if after ethics not completed
  if (hasEthics(props.exercise, 'after') && !isEthicsCompleted(props.exercise.name, 'after')) {
    const contextData = {
      exerciseResults: 'Results from current exercise',
      timestamp: new Date().toISOString()
    };
    showEthicsDialog('after', contextData);
    return;
  }
  
  if (canGoNext.value) {
    emit("navigate-to-exercise", props.currentExerciseIndex + 1);
  }
};

const goToExercise = (exerciseIndex: number) => {
  emit("navigate-to-exercise", exerciseIndex);
};

// Completion functions
const markAsCompleted = () => {
  markExerciseCompleted(props.exercise.name, props.exercise.originalIndex);
};

const markAsIncomplete = () => {
  markExerciseIncomplete(props.exercise.name);
};

const handleEthicsCompleted = () => {
  // Ethics completed, can proceed with navigation if needed
  ethicsDialogOpen.value = false;
};

// Watch for exercise changes to trigger before ethics
watch(
  () => props.exercise,
  (newExercise) => {
    if (hasEthics(newExercise, 'before') && !isEthicsCompleted(newExercise.name, 'before')) {
      showEthicsDialog('before');
    }
  },
  { immediate: false }
);

onMounted(() => {
  if (hasEthics(props.exercise, 'before') && !isEthicsCompleted(props.exercise.name, 'before')) {
    showEthicsDialog('before');
  }
});
</script> 