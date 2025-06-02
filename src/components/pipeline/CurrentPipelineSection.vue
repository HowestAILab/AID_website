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
          v-for="exercise in selectedPins"
          :key="exercise.originalIndex"
          class="w-6 h-6 bg-[#F5F0E5] border border-black transform rotate-45 flex items-center justify-center"
        >
          <span class="text-black text-xs transform -rotate-45">
            {{ exercise.originalIndex + 1 }}
          </span>
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
      class="border border-[#A1824A] p-2 ml-20 rounded-xs bg-[#F5F0E5] cursor-pointer hover:bg-[#F5F0E5]/80 transition-colors"
    >
      <ChevronUp class="w-5 h-5 text-[#A1824A]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Network, ChevronUp } from "lucide-vue-next";
import type { SelectedPinInfo } from "@/types/exercise";

defineProps<{
  allRenderingLineOffsets?: any;
  mainContentScreenLeft?: number;
  selectedPins: SelectedPinInfo[];
}>();

defineEmits<{
  (e: "unselectExerciseRequested", originalIndex: number): void;
  (e: "expandPipeline"): void;
}>();
</script>
