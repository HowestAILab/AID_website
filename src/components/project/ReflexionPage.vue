<template>
  <div class="flex-1 bg-white flex flex-col">
    <div class="flex items-center p-4">
      <button
        @click="$emit('close')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft />
        <h1 class="ml-2 text-lg font-medium">Back to diamond</h1>
      </button>
    </div>

    <div class="px-6 py-4">
      <p class="text-sm text-gray-500">Process Visualization</p>
      <h3 class="text-3xl font-semibold text-gray-900 mb-4">
        Human-AI Balance
      </h3>
      <HumanAiBalanceChart :selected-exercises="selectedExercises" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import HumanAiBalanceChart from "./HumanAiBalanceChart.vue";

interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

const props = defineProps<{
  selectedExercises?: Exercise[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>
