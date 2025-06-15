<template>
  <!-- Collapsed State -->
  <div
    v-if="!isExpanded"
    class="border-t border-gray-200 bg-white px-4 py-3 h-20 flex items-center relative"
  >
    <div class="flex items-center mr-10">
      <Network class="w-5 h-5 mr-3" />
      <p>Current Pipeline</p>
    </div>
    <div class="flex-grow relative flex items-center">
      <div class="h-px bg-gray-400 w-full absolute"></div>
      <!-- Exercise spreading currently at 10px between each -->
      <div class="flex gap-10 w-full px-4 relative z-10">
        <div
          v-for="(exercise, index) in selectedPins"
          :key="exercise.originalIndex"
          class="relative group"
          :class="{ 'opacity-50': draggedIndex === index, 'cursor-move': !isDragging }"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @drop="handleDrop($event, index)"
          @dragenter.prevent="handleDragEnter(index)"
          @dragleave="handleDragLeave"
        >
          <div
            class="w-6 h-6 bg-light border border-black transform rotate-45 flex items-center justify-center transition-all duration-200"
            :class="{ 
              'scale-110 shadow-lg': dragOverIndex === index && draggedIndex !== index,
              'bg-primary-accent/20 border-primary-accent': dragOverIndex === index && draggedIndex !== index 
            }"
          >
            <span class="text-on-light-default text-xs transform -rotate-45 font-medium">
              {{ exercise.originalIndex + 1 }}
            </span>
          </div>
          <button
            @click="$emit('unselectPinRequested', exercise.originalIndex)"
            class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            :class="{ 'pointer-events-none': isDragging }"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
        <div
          v-if="selectedPins.length === 0"
          class="flex items-center justify-center w-full text-on-light-accent/60 text-sm"
        >
          No exercises added to pipeline
        </div>
      </div>
    </div>
    <button
      @click="handleExpand"
      class="border border-on-light-accent p-2 ml-20 rounded-sm bg-white cursor-pointer hover:bg-light transition-colors shadow-sm"
    >
      <ChevronUp class="w-5 h-5 text-on-light-accent" />
    </button>
  </div>

  <!-- Expanded State -->
  <div
    v-else
    class="border-t border-gray-200 bg-white flex flex-col h-96"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-3">
        <Network class="w-5 h-5 text-primary-accent" />
        <h1 class="text-lg font-medium text-on-light-default">Pipeline Overview</h1>
        <div class="bg-primary-accent/10 text-primary-accent px-2 py-1 rounded-sm text-sm font-medium border border-primary-accent/20">
          {{ overallProgress }}% Complete
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <Button
          v-if="currentExercise && selectedPins.length > 0"
          @click="openCurrentExercise"
          class="bg-primary-accent hover:bg-primary-accent/90 text-white border-0"
        >
          <Play class="w-4 h-4 mr-2" />
          Continue Current Exercise
        </Button>
        <button
          @click="handleCollapse"
          class="border border-on-light-accent p-2 rounded-sm bg-white cursor-pointer hover:bg-light transition-colors shadow-sm"
        >
          <ChevronDown class="w-5 h-5 text-on-light-accent" />
        </button>
      </div>
    </div>

    <!-- Pipeline Overview Content -->
    <PipelineOverviewView
      :selected-pins="selectedPins"
      :mode="'compact'"
      @open-exercise="handleOpenExercise"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Network, ChevronUp, ChevronDown, X, Play } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import PipelineOverviewView from "./PipelineOverviewView.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  allRenderingLineOffsets?: any;
  mainContentScreenLeft?: number;
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "unselectPinRequested", originalIndex: number): void;
  (e: "expandPipeline"): void;
  (e: "reorderPins", fromIndex: number, toIndex: number): void;
  (e: "openExercise", exercise: SelectedPinInfo, index: number): void;
}>();

// Composables
const { 
  calculatePipelineProgress,
  getCurrentExercise
} = usePipelineProgress();

// State
const isExpanded = ref(false);

// Drag and drop state
const isDragging = ref(false);
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// Computed properties
const overallProgress = computed(() => calculatePipelineProgress(props.selectedPins));
const currentExercise = computed(() => getCurrentExercise(props.selectedPins));

// Expand/Collapse handlers
const handleExpand = () => {
  isExpanded.value = true;
  emit('expandPipeline');
};

const handleCollapse = () => {
  isExpanded.value = false;
};

// Exercise handlers
const openCurrentExercise = () => {
  if (currentExercise.value) {
    const index = props.selectedPins.findIndex(pin => 
      pin.originalIndex === currentExercise.value!.originalIndex
    );
    if (index >= 0) {
      handleOpenExercise(currentExercise.value, index);
    }
  }
};

const handleOpenExercise = (exercise: SelectedPinInfo, index: number) => {
  emit('openExercise', exercise, index);
};

// Drag and drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  isDragging.value = true;
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnter = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDragLeave = () => {
  // Only clear dragOverIndex after a small delay to prevent flickering
  setTimeout(() => {
    dragOverIndex.value = null;
  }, 50);
};

const handleDrop = (event: DragEvent, toIndex: number) => {
  event.preventDefault();
  
  if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
    emit('reorderPins', draggedIndex.value, toIndex);
  }
  
  handleDragEnd();
};
</script>
