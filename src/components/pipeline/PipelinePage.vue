<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Exercise Detail View -->
    <template v-if="currentExercise">
      <PipelineExercisePage
        :exercise="currentExercise"
        :all-exercises="chronologicallyOrderedPins"
        :current-exercise-index="currentExerciseIndex"
        :pending-ethics-viewer="pendingEthicsViewerOpen"
        @back="handleBackToPipeline"
        @navigate-to-exercise="handleNavigateToExercise"
      />
    </template>

    <!-- Pipeline Views -->
    <template v-else>
      <!-- Header with Controls -->
      <div class="flex items-center justify-between p-4 border-b">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('close')"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft />
            <span class="text-lg font-medium">Back to diamond</span>
          </button>
        </div>

        <!-- View Toggle and Actions -->
        <div class="flex items-center gap-2">
          <div
            class="flex bg-white/50 rounded-lg p-1 border border-on-light-accent/20"
          >
            <button
              @click="setCurrentView('phases')"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                currentView === 'phases'
                  ? 'bg-white text-on-light-default shadow-sm border border-on-light-accent/20'
                  : 'text-on-light-accent hover:text-on-light-default hover:bg-white/50',
              ]"
            >
              <Grid3X3 class="w-4 h-4 mr-2 inline" />
              Phases
            </button>
            <button
              @click="setCurrentView('overview')"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                currentView === 'overview'
                  ? 'bg-white text-on-light-default shadow-sm border border-on-light-accent/20'
                  : 'text-on-light-accent hover:text-on-light-default hover:bg-white/50',
              ]"
            >
              <List class="w-4 h-4 mr-2 inline" />
              Overview
            </button>
          </div>

          <!-- Continue Current Exercise Button -->
          <Button
            v-if="currentExerciseToWork && selectedPins.length > 0"
            @click="openCurrentExercise"
            class="bg-primary-accent hover:bg-primary-accent/90 text-white border-0"
          >
            <Play class="w-4 h-4 mr-2" />
            Continue Current
          </Button>
        </div>
      </div>

      <!-- Overview View -->
      <PipelineOverviewView
        v-if="currentView === 'overview'"
        :selected-pins="chronologicallyOrderedPins"
        :mode="'full'"
        @open-exercise="handleOpenExerciseFromOverview"
        @edit-ethics="handleEditEthicsFromOverview"
      />

      <!-- Phases View -->
      <PipelinePhasesView
        v-else-if="currentView === 'phases'"
        :selected-pins="chronologicallyOrderedPins"
        @open-exercise="openExercise"
        @open-ethics="openEthicsForExercise"
        @go-to-diamond="$emit('close')"
      />
    </template>

    <!-- Ethics handling is now done in PipelineExercisePage -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { ArrowLeft, List, Grid3X3, Play } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import PipelineOverviewView from "./PipelineOverviewView.vue";
import PipelinePhasesView from "./PipelinePhasesView.vue";
import PipelineExercisePage from "./PipelineExercisePage.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { usePipelineNavigation } from "@/composables/usePipelineNavigation";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Composables
const { getCurrentExercise } = usePipelineProgress();

// Ethics handling is now done in PipelineExercisePage

const { getPendingExerciseOpen, setCurrentActiveExercise } =
  usePipelineNavigation();

// View state
const currentView = ref<"overview" | "phases">("phases");

// Exercise detail state
const currentExercise = ref<SelectedPinInfo | null>(null);
const currentExerciseIndex = ref<number>(0);
const pendingEthicsViewerOpen = ref<{ timing: "before" | "after" } | null>(
  null
);

// View preference key
const VIEW_PREFERENCE_KEY = "pipelineViewPreference";

onMounted(() => {
  // Load user preference if it exists
  const savedView = localStorage.getItem(VIEW_PREFERENCE_KEY);
  if (savedView === "overview" || savedView === "phases") {
    currentView.value = savedView;
  }

  // Check for pending exercise open
  nextTick(() => {
    const pendingOpen = getPendingExerciseOpen();
    if (pendingOpen) {
      openExercise(pendingOpen.exercise);
    }
  });
});

// Watch for pending exercise changes, even if the component is already mounted
watch(getPendingExerciseOpen, (pendingOpen) => {
  if (pendingOpen) {
    openExercise(pendingOpen.exercise);
  }
});

// Computed properties
const currentExerciseToWork = computed(() =>
  getCurrentExercise(props.selectedPins)
);

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

// Helper functions
const setCurrentView = (view: "overview" | "phases") => {
  currentView.value = view;
  localStorage.setItem(VIEW_PREFERENCE_KEY, view);
};

// Exercise navigation
const openExercise = (exercise: SelectedPinInfo) => {
  const index = chronologicallyOrderedPins.value.findIndex(
    (pin) => pin.originalIndex === exercise.originalIndex
  );
  if (index >= 0) {
    currentExercise.value = exercise;
    currentExerciseIndex.value = index;
    setCurrentActiveExercise(exercise);
  }
};

const openCurrentExercise = () => {
  if (currentExerciseToWork.value) {
    openExercise(currentExerciseToWork.value);
  }
};

const handleBackToPipeline = () => {
  currentExercise.value = null;
  currentExerciseIndex.value = 0;
  setCurrentActiveExercise(null);
};

const handleNavigateToExercise = (exerciseIndex: number) => {
  if (
    exerciseIndex >= 0 &&
    exerciseIndex < chronologicallyOrderedPins.value.length
  ) {
    currentExerciseIndex.value = exerciseIndex;
    currentExercise.value = chronologicallyOrderedPins.value[exerciseIndex];
    setCurrentActiveExercise(chronologicallyOrderedPins.value[exerciseIndex]);
  }
};

const handleOpenExerciseFromOverview = (exercise: SelectedPinInfo) => {
  openExercise(exercise);
};

const handleEditEthicsFromOverview = (
  exercise: SelectedPinInfo,
  timing: "before" | "after"
) => {
  // Navigate to exercise and mark that we want to open the ethics viewer
  pendingEthicsViewerOpen.value = { timing };
  openExercise(exercise);

  // Clear the pending state after a brief delay to allow the exercise page to load
  nextTick(() => {
    setTimeout(() => {
      pendingEthicsViewerOpen.value = null;
    }, 100);
  });
};

// Ethics handling
const openEthicsForExercise = (exercise: SelectedPinInfo) => {
  // Since PipelinePhasesView now handles ethics directly with UnifiedEthicsModal,
  // this function should not be called. However, if it is called, open the exercise.
  console.warn(
    "openEthicsForExercise called in PipelinePage - this should be handled in PipelinePhasesView directly"
  );
  openExercise(exercise);
};
</script>
