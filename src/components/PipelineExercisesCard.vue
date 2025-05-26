<template>
  <div class="max-w-128 border p-4 rounded relative">
    <div class="absolute -top-2 -left-2 w-7 h-7 bg-[#F59E0C] rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white">
      {{ originalIndex + 1 }}
    </div>
    <p class="text-md mb-2 mt-2">{{ title }}</p>
    <p class="text-sm text-[#4B5563] mb-1">{{ stage }}</p>
    <p class="text-sm text-[#4B5563]">
      {{ description }}
    </p>
    <div class="my-4"></div>
    <div class="flex flex-col gap-2">
      <button
        class="w-full border border-[#F59E0C] bg-[#F59E0C]/10 text-[#D97704] p-2 rounded-sm items-center flex justify-center gap-2"
        @click="openExercise"
      >
        <SquareArrowOutUpRight class="w-5" />
        Open Exercise Workspace
      </button>
      <button
        class="w-full border border-[#F59E0C] bg-[#F59E0C]/10 text-[#D97704] p-2 rounded-sm items-center flex justify-center gap-2"
      >
        <Info class="w-5" />
        Perform Ethics Check
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SquareArrowOutUpRight,
  Info
} from "lucide-vue-next";

const emit = defineEmits(['open-exercise']);

const props = defineProps<{
    title: string;
    stage: string;
    description: string;
    originalIndex: number;
}>();

const openExercise = () => {
  emit('open-exercise');
};

</script>
