<template>
  <div
    v-if="addExercisesButtonCenterOffsets.length > 0"
    class="relative py-4 pointer-events-none"
    style="min-height: 60px; z-index: 40"
  >
    <button
      v-for="(offset, index) in addExercisesButtonCenterOffsets"
      :key="'add-exercises-button-' + index"
      class="absolute bg-white hover:cursor-pointer text-black border font-medium py-3 px-10 rounded text-sm pointer-events-auto"
      :style="{
        left: offset + 'px',
        transform: 'translateX(-50%)',
        bottom: '16px',
      }"
      @click="handleClick(getPhaseForIndex(index))"
    >
      Add Exercises
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  addExercisesButtonCenterOffsets: number[];
}>();

const emit = defineEmits<{
  (e: "exercise-button-click", phase: string): void;
}>();

const getPhaseForIndex = (index: number): string => {
  const phases = ["Discover", "Define", "Develop", "Deliver"];
  return phases[index];
};

const handleClick = (phase: string) => {
  emit("exercise-button-click", phase);
};
</script> 