<template>
  <ResizablePanelGroup direction="horizontal" class="h-screen w-full">
    <ResizablePanel>
      <div class="flex flex-col h-full">
        <div class="p-6 pb-4 flex justify-between">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft />
            <h1 class="ml-2 text-lg font-medium">Back to Pipeline</h1>
          </button>
          <div class="flex items-center gap-2">
            <Popover>
              <PopoverTrigger as-child>
                <button
                  class="text-sm py-2 px-4 bg-white border rounded cursor-pointer"
                >
                  {{ exercise.name }}
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <div class="space-y-2">
                  <button
                    v-for="(pipelineExercise, index) in allExercises"
                    :key="pipelineExercise.originalIndex"
                    @click="goToExercise(index)"
                    class="w-full text-left hover:bg-gray-100 rounded flex items-center gap-3 p-2 cursor-pointer"
                    :class="{ 'bg-[#F5F0E5]': pipelineExercise.originalIndex === exercise.originalIndex }"
                  >
                    <span class="bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5 text-sm shrink-0">
                      {{ (pipelineExercise.originalIndex ?? 0) + 1 }}
                    </span>
                    <span class="font-medium">
                      {{ pipelineExercise.name }}
                    </span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <button 
              @click="goToPreviousExercise"
              :disabled="!canGoPrevious"
              class="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
            <button 
              @click="goToNextExercise"
              :disabled="!canGoNext"
              class="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div class="px-6 flex items-center gap-4 mb-2">
          <p
            class="text-sm bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5"
          >
            {{ (exercise.originalIndex ?? 0) + 1 }}
          </p>
          <h2 class="text-2xl font-semibold">{{ exercise.name }}</h2>
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
          <div>
            <p>{{ exercise.location.phase }} / {{ exercise.location.step }}</p>
          </div>
        </div>
        <div class="px-6 text-gray-600">
          <p>{{ exercise.description }}</p>
        </div>
        <div class="flex-1 min-h-0">
          <div class="bg-gray-200 h-full flex items-center justify-center">
            <p>Miro Board Area</p>
          </div>
        </div>
      </div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="20" :min-size="20" :max-size="40">
      <ExerciseAIChat />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowLeft,
  UserRound,
  Bot,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ExerciseAIChat from "./ExerciseAIChat.vue";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ExerciseLocation {
  phase: string;
  step: string;
  human_ai_scale: number;
}

interface Exercise {
  name: string;
  description: string;
  location: ExerciseLocation;
  prompt_example?: string[];
  ethical?: {
    before: string[];
    after: string[];
  };
  miro_board?: string;
  originalIndex?: number;
}

type DriveType = "human" | "human-ai" | "ai";

const props = defineProps<{
  exercise: Exercise;
  allExercises: Exercise[];
  currentExerciseIndex: number;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "navigate-to-exercise", exerciseIndex: number): void;
}>();

const derivedDriveType = computed<DriveType>(() => {
  const scale = props.exercise.location.human_ai_scale;
  if (scale <= 2) return "human";
  if (scale >= 3 && scale <= 6) return "human-ai";
  return "ai";
});

const derivedDriveTypeConfig = computed(() => {
  if (!props.exercise) return null;
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

const canGoPrevious = computed(() => {
  return props.currentExerciseIndex > 0;
});

const canGoNext = computed(() => {
  return props.currentExerciseIndex < props.allExercises.length - 1;
});

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

const goToExercise = (exerciseIndex: number) => {
  emit("navigate-to-exercise", exerciseIndex);
};
</script>
