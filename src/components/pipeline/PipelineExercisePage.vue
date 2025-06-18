<template>
  <ResizablePanelGroup direction="horizontal" class="h-full w-full">
    <ResizablePanel>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-6 pb-4 flex justify-between border-b mb-4">
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
                    @click="handleExerciseSelection(index)"
                    class="w-full text-left hover:bg-gray-100 rounded flex items-center gap-3 p-2 cursor-pointer"
                    :class="{
                      'bg-[#F5F0E5]':
                        pipelineExercise.originalIndex ===
                        exercise.originalIndex,
                    }"
                  >
                    <span
                      class="bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5 text-sm shrink-0"
                    >
                      {{ index + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <span class="font-medium block truncate">{{
                        pipelineExercise.name
                      }}</span>
                      <span class="text-xs text-gray-500">{{
                        pipelineExercise.location.phase
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <CheckCircle2
                        v-if="isExerciseCompleted(pipelineExercise.name)"
                        class="w-4 h-4 text-green-600 flex-shrink-0"
                      />
                      <EthicsBadge
                        v-if="
                          ethics.getExerciseEthicsStatus(pipelineExercise)
                            .hasAnyRequirement
                        "
                        :exercise="pipelineExercise"
                        size="sm"
                        @click.stop="handleEthicsBadgeClick(pipelineExercise)"
                      />
                    </div>
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
          <p
            class="text-sm bg-[#F59E0C] text-white font-semibold rounded-sm px-2 py-0.5"
          >
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

          <!-- Ethics Badge -->
          <EthicsBadge
            v-if="exerciseEthicsStatus.hasAnyRequirement"
            :exercise="exercise"
            show-detailed
            @click="handleEthicsBadgeClick(exercise)"
          />

          <!-- View Ethics Button for completed ethics -->
          <Button
            v-if="
              exerciseEthicsStatus.hasAnyRequirement &&
              (exerciseEthicsStatus.beforeCompleted ||
                exerciseEthicsStatus.afterCompleted)
            "
            @click="handleViewEthicsClick()"
            variant="outline"
            size="sm"
            class="text-xs"
          >
            <Eye class="w-4 h-4 mr-2" />
            View Ethics
          </Button>

          <!-- Completion Status -->
          <div class="ml-auto flex items-center gap-2">
            <div
              v-if="isExerciseCompleted(exercise.name)"
              class="flex items-center gap-2 text-green-600"
            >
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

          <!-- Ethics blocking warning -->
          <div
            v-if="ethicsBlockingMessage"
            class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md"
          >
            <div class="flex items-center gap-2 text-purple-800">
              <Shield class="w-4 h-4" />
              <span class="font-medium">Ethics Review Required</span>
            </div>
            <p class="text-sm text-purple-700 mt-1">
              {{ ethicsBlockingMessage }}
            </p>
          </div>
        </div>

        <!-- Progress Indicators -->
        <div class="px-6 mb-4">
          <div class="flex items-center gap-6 text-sm">
            <!-- Ethics Status -->
            <div
              v-if="exerciseEthicsStatus.hasAnyRequirement"
              class="flex items-center gap-2"
            >
              <Shield class="w-4 h-4" />
              <span class="text-gray-600">Ethics:</span>
              <span
                :class="
                  exerciseEthicsStatus.allCompleted
                    ? 'text-green-600 font-medium'
                    : 'text-orange-600'
                "
              >
                {{ getEthicsStatusText() }}
              </span>
            </div>

            <!-- Chat Messages -->
            <div class="flex items-center gap-2">
              <MessageSquare class="w-4 h-4" />
              <span class="text-gray-600">Chat:</span>
              <span class="text-gray-500"
                >{{ currentChatMessageCount }} user messages</span
              >
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 min-h-0">
          <CustomCanvas
            :exercise="exercise"
            class="h-full w-full"
            @chat-updated="handleChatUpdated"
          />
        </div>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel :default-size="20" :min-size="20" :max-size="40">
      <ExerciseAIChat
        :current-exercise="exercise"
        @chat-updated="handleChatUpdated"
      />
    </ResizablePanel>
  </ResizablePanelGroup>

  <!-- Unified Ethics Modal -->
  <UnifiedEthicsModal
    v-if="ethics.unifiedEthicsModal.value"
    :open="ethics.ethicsModalOpen.value"
    :mode="ethics.unifiedEthicsModal.value.mode"
    :exercise-name="ethics.unifiedEthicsModal.value.exerciseId"
    :timing="ethics.unifiedEthicsModal.value.timing"
    :exercise-context="ethics.unifiedEthicsModal.value.exerciseContext"
    :chat-history="ethics.unifiedEthicsModal.value.chatHistory || []"
    :existing-ethics-data="ethics.unifiedEthicsModal.value.existingEthicsData"
    @update:open="handleEthicsModalOpenChange"
    @submit="handleEthicsSubmit"
    @cancel="handleEthicsCancel"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from "vue";
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
  Eye,
} from "lucide-vue-next";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ExerciseAIChat from "@/components/exercise/ExerciseAIChat.vue";
import EthicsBadge from "@/components/ethics/EthicsBadge.vue";
import UnifiedEthicsModal from "@/components/ethics/UnifiedEthicsModal.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { useEthics } from "@/composables/useEthics";
import { useExerciseChat } from "@/composables/useExerciseChat";
import type { SelectedPinInfo } from "@/types/exercise";
import CustomCanvas from "@/components/canvas/CustomCanvas.vue";

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
const { isExerciseCompleted, markExerciseCompleted, markExerciseIncomplete } =
  usePipelineProgress();

const ethics = useEthics();
const {
  currentMessages,
  getExerciseMessages,
  getChatStats,
  setCurrentExercise,
} = useExerciseChat();

// Local state
const currentChatMessageCount = ref(0);
const ethicsBlockingMessage = ref<string | null>(null);

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
const canGoNext = computed(
  () => props.currentExerciseIndex < props.allExercises.length - 1
);

const exerciseEthicsStatus = computed(() => {
  return ethics.getExerciseEthicsStatus(props.exercise);
});

// Helper functions
const convertChatMessages = (messages: any[]) => {
  return messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.timestamp || Date.now(),
    }));
};

const getEthicsStatusText = (): string => {
  const status = exerciseEthicsStatus.value;
  if (status.allCompleted) return "All Complete";

  let parts: string[] = [];
  if (status.beforeRequired) {
    parts.push(`Before: ${status.beforeCompleted ? "Complete" : "Pending"}`);
  }
  if (status.afterRequired) {
    parts.push(`After: ${status.afterCompleted ? "Complete" : "Pending"}`);
  }
  return parts.join(", ");
};

// Navigation functions
const goBack = () => {
  emit("back");
};

const handleExerciseSelection = (exerciseIndex: number) => {
  requestExerciseChange(exerciseIndex);
};

const goToPreviousExercise = () => {
  if (canGoPrevious.value) {
    requestExerciseChange(props.currentExerciseIndex - 1);
  }
};

const goToNextExercise = () => {
  if (canGoNext.value) {
    requestExerciseChange(props.currentExerciseIndex + 1);
  }
};

const requestExerciseChange = (targetIndex: number) => {
  const targetExercise = props.allExercises[targetIndex];
  const currentChatHistory = convertChatMessages(currentMessages.value || []);

  const blockingMessage = ethics.checkNavigationBlock(targetExercise.name);

  if (!blockingMessage) {
    emit("navigate-to-exercise", targetIndex);
    ethicsBlockingMessage.value = null;
  } else {
    ethicsBlockingMessage.value = blockingMessage;
  }
};

// Completion functions
const markAsCompleted = () => {
  markExerciseCompleted(props.exercise.name, props.exercise.originalIndex);
};

const markAsIncomplete = () => {
  markExerciseIncomplete(props.exercise.name);
};

// Ethics event handlers
const handleEthicsSubmit = (data: any) => {
  const pendingNav = ethics.handleEthicsSubmit(data);
  ethicsBlockingMessage.value = null;

  if (pendingNav?.type === "exercise-change") {
    emit("navigate-to-exercise", pendingNav.targetIndex);
  }
};

const handleEthicsCancel = () => {
  ethics.handleEthicsCancel();
  ethicsBlockingMessage.value = null;
};

const handleEthicsModalOpenChange = (open: boolean) => {
  if (!open) {
    ethics.handleEthicsCancel();
  }
};

const handleEthicsBadgeClick = (exercise: SelectedPinInfo) => {
  const status = ethics.getExerciseEthicsStatus(exercise);
  const rawChatHistory =
    exercise.name === props.exercise.name
      ? currentMessages.value || []
      : getExerciseMessages(exercise.name) || [];
  const currentChatHistory = convertChatMessages(rawChatHistory);

  if (status.beforeCompleted || status.afterCompleted) {
    const timing = status.beforeCompleted ? "before" : "after";
    ethics.openEthicsModal(exercise, timing, "view", currentChatHistory);
  } else if (status.beforeRequired && !status.beforeCompleted) {
    ethics.openEthicsModal(exercise, "before", "new", currentChatHistory);
  } else if (status.afterRequired && !status.afterCompleted) {
    ethics.openEthicsModal(exercise, "after", "new", currentChatHistory);
  }
};

const handleViewEthicsClick = () => {
  const status = exerciseEthicsStatus.value;
  const timing = status.beforeCompleted ? "before" : "after";
  const currentChatHistory = convertChatMessages(currentMessages.value || []);
  ethics.openEthicsModal(props.exercise, timing, "view", currentChatHistory);
};

const handleChatUpdated = (messageCount: number) => {
  const stats = getChatStats(props.exercise.name);
  currentChatMessageCount.value = stats.userMessages || 0;
};

// Initialize on mount and exercise changes
onMounted(() => {
  if (setCurrentExercise) {
    setCurrentExercise(props.exercise);
  }
  currentChatMessageCount.value = (currentMessages.value || []).length;
});

watch(
  () => props.exercise,
  (newExercise) => {
    if (setCurrentExercise) {
      setCurrentExercise(newExercise);
    }

    nextTick(() => {
      currentChatMessageCount.value = (currentMessages.value || []).length;
    });

    ethicsBlockingMessage.value = null;
  }
);
</script>
