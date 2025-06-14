<template>
  <div
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
              'bg-blue-100 border-blue-500': dragOverIndex === index && draggedIndex !== index 
            }"
          >
            <span class="text-black text-xs transform -rotate-45">
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
          class="flex items-center justify-center w-full text-gray-400 text-sm"
        >
          No exercises added to pipeline
        </div>
      </div>
    </div>
    <button
      @click="$emit('expandPipeline')"
      class="border border-[#A1824A] p-2 ml-20 rounded-xs bg-light cursor-pointer hover:bg-light/80 transition-colors"
    >
      <ChevronUp class="w-5 h-5 text-on-light-accent" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Network, ChevronUp, X } from "lucide-vue-next";
import type { SelectedPinInfo } from "@/types/exercise";

defineProps<{
  allRenderingLineOffsets?: any;
  mainContentScreenLeft?: number;
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "unselectPinRequested", originalIndex: number): void;
  (e: "expandPipeline"): void;
  (e: "reorderPins", fromIndex: number, toIndex: number): void;
}>();

// Drag and drop state
const isDragging = ref(false);
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

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
