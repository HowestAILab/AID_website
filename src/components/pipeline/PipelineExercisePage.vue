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
                      {{ pipelineExercise.originalIndex + 1 }}
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
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-semibold">{{ exercise.name }}</h2>
            <!-- Info icon for exercise details -->
            <button
              @click="openExerciseDetails"
              class="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="View exercise details"
            >
              <Info class="w-4 h-4 text-gray-600" />
            </button>
          </div>

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
    :initial-timing="ethics.unifiedEthicsModal.value.initialTiming"
    :available-timings="ethics.unifiedEthicsModal.value.availableTimings"
    :exercise-context="ethics.unifiedEthicsModal.value.exerciseContext"
    :chat-history="ethics.unifiedEthicsModal.value.chatHistory || []"
    :all-existing-ethics-data="
      ethics.unifiedEthicsModal.value.allExistingEthicsData
    "
    :previous-exercise-context="
      ethics.unifiedEthicsModal.value.previousExerciseContext
    "
    @update:open="handleEthicsModalOpenChange"
    @submit="handleEthicsSubmit"
    @cancel="handleCancel"
  />

  <!-- Exercise Specific Modal -->
  <component
    v-if="showExerciseModal && exerciseData"
    :is="ExerciseSpecificModal"
    :open="showExerciseModal"
    :exercise="exerciseData"
    @update:open="showExerciseModal = $event"
  />
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  watch,
  nextTick,
  defineAsyncComponent,
} from "vue";
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
  Info,
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
import { useExercises } from "@/composables/useExercises";
import type { SelectedPinInfo } from "@/types/exercise";
import CustomCanvas from "@/components/canvas/CustomCanvas.vue";

// Lazy load the modal component
const ExerciseSpecificModal = defineAsyncComponent(
  () => import("@/components/exercise/ExerciseSpecificModal.vue")
);

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

const { getExerciseByIndex } = useExercises();

// Local state
const currentChatMessageCount = ref(0);
const ethicsBlockingMessage = ref<string | null>(null);
const pendingNavigationIndex = ref<number | null>(null);
const showExerciseModal = ref(false);

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

// Get exercise data for the modal
const exerciseData = computed(() => {
  // Try to get exercise from useExercises composable first
  const exerciseFromComposable = getExerciseByIndex(
    props.exercise.originalIndex
  );

  if (exerciseFromComposable) {
    return exerciseFromComposable;
  }

  // Fallback: construct exercise object from available props
  return {
    name: props.exercise.name,
    description: props.exercise.description,
    location: props.exercise.location,
    prompt_example: ["Information not available for this exercise"],
    ethical: props.exercise.ethical || { before: [], after: [] },
    miro_board: "",
    how_to_run: ["Information not available for this exercise"],
    expected_outcomes: ["Information not available for this exercise"],
    human_ai_collaboration: {
      human_role: "Information not available for this exercise",
      ai_role: "Information not available for this exercise",
      collaboration_notes: "Information not available for this exercise",
    },
    originalIndex: props.exercise.originalIndex,
  };
});

// Exercise Modal Functions
const openExerciseDetails = () => {
  showExerciseModal.value = true;
};

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
  // Check for post-ethics on the CURRENT exercise before navigating away.
  const currentStatus = ethics.getExerciseEthicsStatus(props.exercise);
  if (currentStatus.afterRequired && !currentStatus.afterCompleted) {
    pendingNavigationIndex.value = targetIndex;
    openEthicsModalForExercise(props.exercise);
    return;
  }

  // If no post-ethics block, navigate immediately.
  // The pre-ethics check for the target exercise will be handled by the watcher.
  emit("navigate-to-exercise", targetIndex);
};

// Completion functions
const markAsCompleted = () => {
  markExerciseCompleted(props.exercise.name, props.exercise.originalIndex);
};

const markAsIncomplete = () => {
  markExerciseIncomplete(props.exercise.name);
};

// Modal Close Handler for Pending Navigation
const handleModalClose = () => {
  if (pendingNavigationIndex.value !== null) {
    // A navigation was pending. Check if the requirement is now met.
    const currentStatus = ethics.getExerciseEthicsStatus(props.exercise);
    if (!currentStatus.afterRequired || currentStatus.afterCompleted) {
      // Requirement met, proceed with navigation.
      emit("navigate-to-exercise", pendingNavigationIndex.value);
    }
    // Whether it was met or not, we clear the pending navigation.
    // If not met, the navigation is simply cancelled.
    pendingNavigationIndex.value = null;
  }
  ethics.handleEthicsCancel();
};

// Ethics event handlers
const handleEthicsSubmit = (data: any) => {
  ethics.handleEthicsSubmit(data);
  // The check for pending navigation will happen when the modal closes.
  ethicsBlockingMessage.value = null;
};

const handleCancel = () => {
  handleModalClose();
};

const handleEthicsModalOpenChange = (open: boolean) => {
  if (!open) {
    handleModalClose();
  }
};

const openEthicsModalForExercise = (exercise: SelectedPinInfo) => {
  const status = ethics.getExerciseEthicsStatus(exercise);
  const rawChatHistory =
    exercise.name === props.exercise.name
      ? currentMessages.value || []
      : getExerciseMessages(exercise.name) || [];
  const currentChatHistory = convertChatMessages(rawChatHistory);

  const availableTimings: ("before" | "after")[] = [];
  if (status.beforeRequired) availableTimings.push("before");
  if (status.afterRequired) availableTimings.push("after");

  if (availableTimings.length === 0) {
    return;
  }

  // Determine which timing to open first.
  // Priority: incomplete 'before', incomplete 'after', completed 'before'.
  let initialTiming: "before" | "after" = availableTimings[0];
  if (availableTimings.includes("before") && !status.beforeCompleted) {
    initialTiming = "before";
  } else if (availableTimings.includes("after") && !status.afterCompleted) {
    initialTiming = "after";
  } else if (availableTimings.includes("before")) {
    initialTiming = "before";
  }

  const mode =
    (initialTiming === "before" && status.beforeCompleted) ||
    (initialTiming === "after" && status.afterCompleted)
      ? "view"
      : "new";

  ethics.openEthicsModal(
    exercise,
    initialTiming,
    mode,
    currentChatHistory,
    availableTimings
  );
};

const handleEthicsBadgeClick = (exercise: SelectedPinInfo) => {
  openEthicsModalForExercise(exercise);
};

const handleViewEthicsClick = () => {
  openEthicsModalForExercise(props.exercise);
};

const handleChatUpdated = (messageCount: number) => {
  const stats = getChatStats(props.exercise.name);
  currentChatMessageCount.value = stats.userMessages || 0;
};

const initializeAndCheckEthics = (exercise: SelectedPinInfo) => {
  if (setCurrentExercise) {
    setCurrentExercise(exercise);
  }
  nextTick(() => {
    const stats = getChatStats(exercise.name);
    currentChatMessageCount.value = stats.userMessages || 0;
  });
  ethicsBlockingMessage.value = null;
  pendingNavigationIndex.value = null; // Reset pending navigation on new page.

  // Check for pre-ethics requirement on the newly loaded exercise
  const status = ethics.getExerciseEthicsStatus(exercise);
  if (status.beforeRequired && !status.beforeCompleted) {
    nextTick(() => {
      openEthicsModalForExercise(exercise);
    });
  }
};

// Initialize on mount and exercise changes
onMounted(() => {
  initializeAndCheckEthics(props.exercise);
});

watch(
  () => props.exercise,
  (newExercise) => {
    initializeAndCheckEthics(newExercise);
  }
);
</script>
