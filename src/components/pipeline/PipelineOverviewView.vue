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
          v-for="(exercise, index) in selectedPins"
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
          v-for="(exercise, index) in selectedPins"
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

    <!-- Ethics Viewer Modal -->
    <EthicsViewerModal
      v-if="selectedEthicsExercise"
      :open="ethicsModalOpen"
      :exercise="selectedEthicsExercise"
      @update:open="ethicsModalOpen = $event"
      @edit-ethics="handleEthicsEdit"
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
import EthicsViewerModal from "@/components/ethics/EthicsViewerModal.vue";
import UnifiedExerciseCard from "@/components/exercise/UnifiedExerciseCard.vue";
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

const { getChatStats } = useExerciseChat();
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

// Get current exercise (first uncompleted or last one)
const getCurrentExercise = (pins: SelectedPinInfo[]) => {
  const uncompletedExercise = pins.find(
    (pin) => !isExerciseCompleted(pin.name)
  );
  return uncompletedExercise || pins[pins.length - 1];
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

const getChatHistoryCount = (exerciseId: string): number => {
  const stats = getChatStats(exerciseId);
  return stats.userMessages;
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

const openExercise = (exercise: SelectedPinInfo, index: number) => {
  emit("open-exercise", exercise, index);
};

const handleEthicsClick = (exercise: SelectedPinInfo) => {
  const status = ethics.getExerciseEthicsStatus(exercise);

  if (status.beforeCompleted || status.afterCompleted) {
    // Show viewer modal for completed ethics
    selectedEthicsExercise.value = exercise;
    ethicsModalOpen.value = true;
  } else {
    // Navigate to exercise for pending ethics
    const index = props.selectedPins.findIndex(
      (p) => p.originalIndex === exercise.originalIndex
    );
    openExercise(exercise, index);
  }
};

const handleEthicsEdit = (
  exercise: SelectedPinInfo,
  timing: "before" | "after"
) => {
  emit("edit-ethics", exercise, timing);
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
</style>
