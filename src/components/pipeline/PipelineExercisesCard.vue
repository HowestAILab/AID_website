<template>
  <div class="max-w-128 border border-on-light-accent/20 p-4 rounded-lg relative transition-all duration-200 hover:shadow-md"
    :class="{
      'bg-green-50 border-green-200': isCompleted,
      'bg-white hover:bg-light': !isCompleted
    }"
  >
    <div class="absolute -top-2 -left-2 w-7 h-7 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white shadow-sm">
      {{ originalIndex + 1 }}
    </div>
    
    <!-- Completion Status -->
    <div v-if="isCompleted" class="absolute -top-2 -right-2">
      <CheckCircle2 class="w-6 h-6 text-green-600 bg-white rounded-full shadow-sm" />
    </div>
    
    <p class="text-md mb-2 mt-2 text-on-light-default font-medium">{{ title }}</p>
    <p class="text-sm text-on-light-accent mb-1">{{ stage }}</p>
    <p class="text-sm text-on-light-accent/80">
      {{ description }}
    </p>
    <div class="my-4"></div>
    
    <!-- Progress Indicators -->
    <div v-if="hasEthics || isCompleted || (chatMessageCount !== undefined && chatMessageCount > 0)" class="mb-3 space-y-1">
      <div v-if="hasEthics" class="flex items-center gap-2 text-xs">
        <Shield class="w-3 h-3 text-purple-600" />
        <span class="text-on-light-accent">Ethics:</span>
        <span :class="ethicsCompleted ? 'text-green-600' : 'text-primary-accent'">
          {{ ethicsCompleted ? 'Completed' : 'Pending' }}
        </span>
      </div>
      <div v-if="chatMessageCount !== undefined && chatMessageCount > 0" class="flex items-center gap-2 text-xs">
        <MessageSquare class="w-3 h-3 text-on-light-accent" />
        <span class="text-on-light-accent">Chat:</span>
        <span class="text-on-light-accent/70">{{ chatMessageCount }} user messages</span>
      </div>
      <div v-if="isCompleted" class="flex items-center gap-2 text-xs text-green-600">
        <CheckCircle2 class="w-3 h-3" />
        <span>Exercise Completed</span>
      </div>
    </div>
    
    <div class="flex flex-col gap-2">
      <button
        class="w-full border border-primary-accent bg-primary-accent/10 text-primary-accent p-2 rounded-md items-center flex justify-center gap-2 cursor-pointer hover:bg-primary-accent/20 transition-colors font-medium"
        @click="openExercise"
      >
        <SquareArrowOutUpRight class="w-4 h-4" />
        {{ isCompleted ? 'Review Exercise' : 'Open Exercise Workspace' }}
      </button>
      <button
        v-if="hasEthics"
        class="w-full border border-on-light-accent/30 bg-light text-on-light-accent p-2 rounded-md items-center flex justify-center gap-2 cursor-pointer hover:bg-on-light-accent/10 transition-colors font-medium"
        @click="openEthics"
      >
        <Info class="w-4 h-4" />
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
  Shield,
  MessageSquare
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
    chatMessageCount?: number;
}>();

const openExercise = () => {
  emit('open-exercise');
};

const openEthics = () => {
  emit('open-ethics');
};
</script> 