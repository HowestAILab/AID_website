<template>
  <div class="max-w-128 border p-4 rounded relative"
    :class="{
      'bg-green-50 border-green-200': isCompleted,
      'bg-white': !isCompleted
    }"
  >
    <div class="absolute -top-2 -left-2 w-7 h-7 bg-[#F59E0C] rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white">
      {{ originalIndex + 1 }}
    </div>
    
    <!-- Completion Status -->
    <div v-if="isCompleted" class="absolute -top-2 -right-2">
      <CheckCircle2 class="w-6 h-6 text-green-600 bg-white rounded-full" />
    </div>
    
    <p class="text-md mb-2 mt-2">{{ title }}</p>
    <p class="text-sm text-[#4B5563] mb-1">{{ stage }}</p>
    <p class="text-sm text-[#4B5563]">
      {{ description }}
    </p>
    <div class="my-4"></div>
    
    <!-- Progress Indicators -->
    <div v-if="hasEthics || isCompleted" class="mb-3 space-y-1">
      <div v-if="hasEthics" class="flex items-center gap-2 text-xs">
        <Shield class="w-3 h-3" />
        <span class="text-gray-600">Ethics:</span>
        <span :class="ethicsCompleted ? 'text-green-600' : 'text-orange-600'">
          {{ ethicsCompleted ? 'Completed' : 'Pending' }}
        </span>
      </div>
      <div v-if="isCompleted" class="flex items-center gap-2 text-xs text-green-600">
        <CheckCircle2 class="w-3 h-3" />
        <span>Exercise Completed</span>
      </div>
    </div>
    
    <div class="flex flex-col gap-2">
      <button
        class="w-full border border-[#F59E0C] bg-[#F59E0C]/10 text-[#D97704] p-2 rounded-sm items-center flex justify-center gap-2 cursor-pointer hover:bg-[#F59E0C]/20 transition-colors"
        @click="openExercise"
      >
        <SquareArrowOutUpRight class="w-5" />
        {{ isCompleted ? 'Review Exercise' : 'Open Exercise Workspace' }}
      </button>
      <button
        v-if="hasEthics"
        class="w-full border border-[#F59E0C] bg-[#F59E0C]/10 text-[#D97704] p-2 rounded-sm items-center flex justify-center gap-2 cursor-pointer hover:bg-[#F59E0C]/20 transition-colors"
        @click="openEthics"
      >
        <Info class="w-5" />
        <span v-if="!ethicsCompleted">Perform Ethics Check</span>
        <span v-else>View Ethics Answers</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SquareArrowOutUpRight,
  Info,
  CheckCircle2,
  Shield
} from "lucide-vue-next";

const emit = defineEmits(['open-exercise', 'open-ethics']);

const props = defineProps<{
    title: string;
    stage: string;
    description: string;
    originalIndex: number;
    hasEthics: boolean;
    ethicsCompleted: boolean;
    isCompleted: boolean;
}>();

const openExercise = () => {
  emit('open-exercise');
};

const openEthics = () => {
  emit('open-ethics');
};
</script> 