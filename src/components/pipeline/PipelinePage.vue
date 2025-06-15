<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Exercise Detail View -->
    <template v-if="currentExercise">
      <PipelineExercisePage
        :exercise="currentExercise"
        :all-exercises="selectedPins"
        :current-exercise-index="currentExerciseIndex"
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
          <div class="flex bg-white/50 rounded-lg p-1 border border-on-light-accent/20">
            <button
              @click="setCurrentView('overview')"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                currentView === 'overview' 
                  ? 'bg-white text-on-light-default shadow-sm border border-on-light-accent/20' 
                  : 'text-on-light-accent hover:text-on-light-default hover:bg-white/50'
              ]"
            >
              <List class="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              @click="setCurrentView('phases')"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                currentView === 'phases' 
                  ? 'bg-white text-on-light-default shadow-sm border border-on-light-accent/20' 
                  : 'text-on-light-accent hover:text-on-light-default hover:bg-white/50'
              ]"
            >
              <Grid3X3 class="w-4 h-4 mr-2 inline" />
              Phases
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
        :selected-pins="selectedPins"
        :mode="'full'"
        @open-exercise="handleOpenExerciseFromOverview"
      />

      <!-- Phases View -->
      <PipelinePhasesView
        v-else-if="currentView === 'phases'"
        :selected-pins="selectedPins"
        @open-exercise="openExercise"
        @open-ethics="openEthicsForExercise"
        @go-to-diamond="$emit('close')"
      />
    </template>
    
    <!-- Ethics Dialog -->
    <EthicsCheckDialog
      v-if="ethicsDialogCheck"
      :exercise-id="ethicsDialogCheck.exerciseId"
      :timing="ethicsDialogCheck.timing"
      v-model:open="ethicsDialogOpen"
      @completed="handleEthicsCompleted"
      :default-questions="ethicsDialogCheck.questions"
      :settings="ethicsDialogCheck.settings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { 
  ArrowLeft, 
  List, 
  Grid3X3, 
  Play
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import PipelineOverviewView from "./PipelineOverviewView.vue";
import PipelinePhasesView from "./PipelinePhasesView.vue";
import PipelineExercisePage from "./PipelineExercisePage.vue";
import EthicsCheckDialog from "@/components/ethics/EthicsCheckDialog.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { useEthics } from "@/composables/useEthics";
import { usePipelineNavigation } from "@/composables/usePipelineNavigation";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Composables
const { 
  getCurrentExercise
} = usePipelineProgress();

const { 
  ensureEthicalCheckFromExercise 
} = useEthics();

const { getPendingExerciseOpen } = usePipelineNavigation();

// View state
const currentView = ref<'overview' | 'phases'>('overview');

// Exercise detail state
const currentExercise = ref<SelectedPinInfo | null>(null);
const currentExerciseIndex = ref<number>(0);

// Ethics state
const ethicsDialogOpen = ref(false);
const ethicsDialogCheck = ref<any>(null);

// View preference key
const VIEW_PREFERENCE_KEY = 'pipelineViewPreference';

onMounted(() => {
  // Load user preference if it exists
  const savedView = localStorage.getItem(VIEW_PREFERENCE_KEY);
  if (savedView === 'overview' || savedView === 'phases') {
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

// Computed properties
const currentExerciseToWork = computed(() => getCurrentExercise(props.selectedPins));

// Helper functions
const setCurrentView = (view: 'overview' | 'phases') => {
  currentView.value = view;
  localStorage.setItem(VIEW_PREFERENCE_KEY, view);
};

// Exercise navigation
const openExercise = (exercise: SelectedPinInfo) => {
  const index = props.selectedPins.findIndex(pin => pin.originalIndex === exercise.originalIndex);
  if (index >= 0) {
    currentExercise.value = exercise;
    currentExerciseIndex.value = index;
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
};

const handleNavigateToExercise = (exerciseIndex: number) => {
  if (exerciseIndex >= 0 && exerciseIndex < props.selectedPins.length) {
    currentExerciseIndex.value = exerciseIndex;
    currentExercise.value = props.selectedPins[exerciseIndex];
  }
};

const handleOpenExerciseFromOverview = (exercise: SelectedPinInfo) => {
  openExercise(exercise);
};

// Ethics handling
const openEthicsForExercise = (exercise: SelectedPinInfo) => {
  ethicsDialogCheck.value = ensureEthicalCheckFromExercise(exercise, 'before');
  ethicsDialogOpen.value = true;
};

const handleEthicsCompleted = () => {
  ethicsDialogOpen.value = false;
};
</script>
