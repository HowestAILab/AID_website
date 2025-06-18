<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Progress Bar -->
    <div class="px-4 py-3 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-sm font-medium text-on-light-default"
          >Overall Progress</span
        >
        <span class="text-sm text-on-light-accent"
          >{{ completedCount }} of {{ totalCount }} exercises</span
        >
      </div>
      <div
        class="w-full bg-white/50 rounded-full h-2 border border-on-light-accent/20"
      >
        <div
          class="bg-primary-accent h-2 rounded-full transition-all duration-300"
          :style="{ width: overallProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Exercises - Conditional Layout Based on Mode -->
    <div v-if="mode === 'compact'" class="flex-1 p-4">
      <!-- Horizontal Scroll Layout for CurrentPipelineSection -->
      <div
        class="flex gap-4 overflow-x-auto pb-4"
        style="scroll-behavior: smooth"
      >
        <UnifiedExerciseCard
          v-for="(exercise, index) in chronologicallyOrderedPins"
          :key="exercise.originalIndex"
          :title="exercise.name"
          :description="exercise.description"
          :originalIndex="exercise.originalIndex"
          :phase="exercise.location.phase"
          :step="exercise.location.step"
          :humanAiScale="exercise.location.human_ai_scale"
          :isCompleted="isExerciseCompleted(exercise.name)"
          :isCurrentExercise="isCurrentExercise(exercise)"
          :hasEthics="exerciseHasEthics(exercise)"
          :ethicsCompleted="exerciseEthicsCompleted(exercise)"
          :chatMessageCount="getChatHistoryCount(exercise.name)"
          :completionDate="formatCompletionDate(exercise.name)"
          mode="compact"
          @click="openExercise(exercise, index)"
          @ethics-click="handleEthicsClick(exercise)"
        />

        <!-- Add more exercises prompt -->
        <div
          v-if="selectedPins.length === 0"
          class="flex-shrink-0 w-80 border-2 border-dashed border-on-light-accent/30 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-on-light-accent/40 mb-2" />
          <p class="text-on-light-accent font-medium mb-1">
            No exercises in pipeline
          </p>
          <p class="text-sm text-on-light-accent/70">
            Add exercises from the diamond to get started
          </p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 p-4 overflow-y-auto min-h-0">
      <!-- Grid Layout for PipelinePage -->
      <div class="grid gap-4 auto-fit-minmax">
        <UnifiedExerciseCard
          v-for="(exercise, index) in chronologicallyOrderedPins"
          :key="exercise.originalIndex"
          :title="exercise.name"
          :description="exercise.description"
          :originalIndex="exercise.originalIndex"
          :phase="exercise.location.phase"
          :step="exercise.location.step"
          :humanAiScale="exercise.location.human_ai_scale"
          :isCompleted="isExerciseCompleted(exercise.name)"
          :isCurrentExercise="isCurrentExercise(exercise)"
          :hasEthics="exerciseHasEthics(exercise)"
          :ethicsCompleted="exerciseEthicsCompleted(exercise)"
          :chatMessageCount="getChatHistoryCount(exercise.name)"
          :completionDate="formatCompletionDate(exercise.name)"
          mode="grid"
          @click="openExercise(exercise, index)"
          @ethics-click="handleEthicsClick(exercise)"
        />

        <!-- Add more exercises prompt -->
        <div
          v-if="selectedPins.length === 0"
          class="col-span-full border-2 border-dashed border-on-light-accent/30 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-on-light-accent/40 mb-2" />
          <p class="text-on-light-accent font-medium mb-1">
            No exercises in pipeline
          </p>
          <p class="text-sm text-on-light-accent/70">
            Add exercises from the diamond to get started
          </p>
        </div>
      </div>
    </div>

    <!-- Phase Summary - Only show in full mode -->
    <div v-if="mode === 'full'" class="border-t p-4 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Phase Progress</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="phase in phases" :key="phase" class="text-center">
          <div class="text-xs text-on-light-accent mb-1">{{ phase }}</div>
          <div class="text-sm font-medium text-on-light-default">
            {{ getPhaseProgress(selectedPins, phase).completed }}/{{
              getPhaseProgress(selectedPins, phase).total
            }}
          </div>
          <div
            class="w-full bg-white/50 rounded-full h-1 mt-1 border border-on-light-accent/20"
          >
            <div
              class="bg-primary-accent h-1 rounded-full transition-all duration-300"
              :style="{
                width: getPhaseProgress(selectedPins, phase).percentage + '%',
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <UnifiedEthicsModal
      v-if="ethics.unifiedEthicsModal.value"
      :open="ethics.unifiedEthicsModal.value.open"
      :mode="ethics.unifiedEthicsModal.value.mode"
      :exercise-name="ethics.unifiedEthicsModal.value.exerciseId"
      :initial-timing="ethics.unifiedEthicsModal.value.initialTiming"
      :available-timings="ethics.unifiedEthicsModal.value.availableTimings"
      :exercise-context="ethics.unifiedEthicsModal.value.exerciseContext"
      :chat-history="ethics.unifiedEthicsModal.value.chatHistory || []"
      :all-existing-ethics-data="
        ethics.unifiedEthicsModal.value.allExistingEthicsData
      "
      @update:open="handleEthicsModalOpenChange"
      @submit="handleEthicsSubmit"
      @cancel="handleEthicsCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, ref } from "vue";
import {
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  MessageSquare,
  Target,
  Plus,
  Eye,
} from "lucide-vue-next";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { useExerciseChat } from "@/composables/useExerciseChat";
import { useEthics } from "@/composables/useEthics";
import UnifiedEthicsModal from "@/components/ethics/UnifiedEthicsModal.vue";
import UnifiedExerciseCard from "@/components/exercise/UnifiedExerciseCard.vue";
// TODO: Fix component imports - using legacy approach for now
// import UnifiedExerciseCard from "@/components/exercise/UnifiedExerciseCard.vue";
import type { SelectedPinInfo } from "@/types/exercise";

const props = withDefaults(
  defineProps<{
    selectedPins: SelectedPinInfo[];
    mode?: "full" | "compact"; // 'full' for PipelinePage, 'compact' for CurrentPipelineSection
  }>(),
  {
    mode: "full",
  }
);

const emit = defineEmits<{
  (e: "open-exercise", exercise: SelectedPinInfo, index: number): void;
  (
    e: "edit-ethics",
    exercise: SelectedPinInfo,
    timing: "before" | "after"
  ): void;
}>();

const {
  isExerciseCompleted,
  getExerciseProgress,
  calculatePipelineProgress,
  getPhaseProgress,
} = usePipelineProgress();

const { getChatStats, getExerciseMessages } = useExerciseChat();
const ethics = useEthics();

const phases = ["Discover", "Define", "Develop", "Deliver"];

// Computed properties
const overallProgress = computed(() =>
  calculatePipelineProgress(props.selectedPins)
);
const completedCount = computed(
  () => props.selectedPins.filter((pin) => isExerciseCompleted(pin.name)).length
);
const totalCount = computed(() => props.selectedPins.length);

// Sort exercises in timeline order (following phase sequence but respecting user ordering within phases)
const chronologicallyOrderedPins = computed(() => {
  const phaseOrder = ["Discover", "Define", "Develop", "Deliver"];

  // Group exercises by phase while preserving their order within each phase
  const exercisesByPhase: Record<string, SelectedPinInfo[]> = {};

  // Initialize phase groups
  phaseOrder.forEach((phase) => {
    exercisesByPhase[phase] = [];
  });

  // Group exercises by phase in the order they appear in selectedPins
  props.selectedPins.forEach((exercise) => {
    const phase = exercise.location.phase;
    if (exercisesByPhase[phase]) {
      exercisesByPhase[phase].push(exercise);
    }
  });

  // Combine phases in correct order, preserving user order within each phase
  const result: SelectedPinInfo[] = [];
  phaseOrder.forEach((phase) => {
    result.push(...exercisesByPhase[phase]);
  });

  return result;
});

// Get current exercise (first uncompleted or last one) from chronologically ordered pins
const getCurrentExercise = (pins: SelectedPinInfo[]) => {
  const orderedPins = chronologicallyOrderedPins.value;
  const uncompletedExercise = orderedPins.find(
    (pin) => !isExerciseCompleted(pin.name)
  );
  return uncompletedExercise || orderedPins[orderedPins.length - 1];
};

const currentExercise = computed(() => getCurrentExercise(props.selectedPins));

// Local state for ethics modal
const ethicsModalOpen = ref(false);
const selectedEthicsExercise = ref<SelectedPinInfo | null>(null);

// Helper functions - simplified
const isCurrentExercise = (exercise: SelectedPinInfo): boolean => {
  return currentExercise.value?.originalIndex === exercise.originalIndex;
};

const exerciseHasEthics = (exercise: SelectedPinInfo): boolean => {
  return (
    ethics.hasEthicsRequirement(exercise, "before") ||
    ethics.hasEthicsRequirement(exercise, "after")
  );
};

const exerciseEthicsCompleted = (exercise: SelectedPinInfo): boolean => {
  const status = ethics.getExerciseEthicsStatus(exercise);
  return status.allCompleted || false;
};

const getChatHistoryCount = (exerciseName: string) => {
  return getChatStats(exerciseName).messageCount;
};

const formatCompletionDate = (exerciseId: string): string => {
  const progress = getExerciseProgress(exerciseId);
  if (!progress?.completedAt) return "";

  const date = new Date(progress.completedAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openExercise = (exercise: SelectedPinInfo, originalIndex: number) => {
  emit("open-exercise", exercise, originalIndex);
};

const handleEthicsClick = (exercise: SelectedPinInfo) => {
  const { beforeRequired, afterRequired, beforeCompleted, afterCompleted } =
    ethics.getExerciseEthicsStatus(exercise);
  
  const rawChatHistory = getExerciseMessages(exercise.name);
  const currentChatHistory = rawChatHistory.filter(
    (msg) => msg.role !== "system"
  ) as { role: "user" | "assistant"; content: string; timestamp?: number }[];

  const availableTimings: ("before" | "after")[] = [];
  if (beforeRequired) availableTimings.push("before");
  if (afterRequired) availableTimings.push("after");

  // Determine which timing to view
  let timingToView: "before" | "after" | null = null;
  if (beforeCompleted) timingToView = "before";
  if (afterCompleted) timingToView = "after"; // 'after' takes precedence if both are done

  // If there's something to view, open in view mode
  if (timingToView) {
    ethics.openEthicsModal(
      exercise,
      timingToView,
      "view",
      currentChatHistory,
      availableTimings
    );
    return;
  }

  // If not completed, open in new mode
  if (beforeRequired && !beforeCompleted) {
    ethics.openEthicsModal(
      exercise,
      "before",
      "new",
      currentChatHistory,
      availableTimings
    );
  } else if (afterRequired && !afterCompleted) {
    ethics.openEthicsModal(
      exercise,
      "after",
      "new",
      currentChatHistory,
      availableTimings
    );
  }
};

// This function needs to be simple because the v-if on the modal
// removes it from the DOM, so we can't rely on its internal state.
const handleEthicsModalOpenChange = (isOpen: boolean) => {
  if (!isOpen && ethics.unifiedEthicsModal.value) {
    ethics.unifiedEthicsModal.value.open = false;
  }
};

const handleEthicsSubmit = (data: any) => {
  ethics.handleEthicsSubmit(data);
};

const handleEthicsCancel = () => {
  ethics.handleEthicsCancel();
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.auto-fit-minmax {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Ensure responsive behavior for smaller screens */
@media (max-width: 640px) {
  .auto-fit-minmax {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .auto-fit-minmax {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 1025px) {
  .auto-fit-minmax {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

/* Ensures the content area can scroll independently */
.min-h-0 {
  min-height: 0;
}

/* For grid layout */
.auto-fit-minmax {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
