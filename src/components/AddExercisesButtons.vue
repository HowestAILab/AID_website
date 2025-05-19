<template>
  <div
    v-if="addExercisesButtonCenterOffsets.length > 0"
    class="relative py-4"
    style="min-height: 60px"
  >
    <button
      v-for="(offset, index) in addExercisesButtonCenterOffsets"
      :key="'add-exercises-button-' + index"
      class="absolute bg-white hover:cursor-pointer text-black border font-medium py-3 px-10 rounded text-sm"
      :style="{
        left: offset + 'px',
        transform: 'translateX(-50%)',
        bottom: '16px',
      }"
    >
      Add Exercises
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  addExercisesButtonCenterOffsets: number[];
}>();
</script> 