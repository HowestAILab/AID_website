<template>
  <div
    class="p-4 border border-[#E5E7EB] rounded-lg shadow-sm h-full flex flex-col"
  >
    <div class="flex items-center justify-between mb-1">
      <p class="text-lg font-medium mb-1">{{ title }}</p>
      <div
        class="flex items-center gap-2 rounded-sm px-2 py-0.5"
        :class="[driveTypeConfig.bgColor, driveTypeConfig.textColor]"
      >
        <UserRound v-if="props.driveType === 'human'" :size="20" />
        <Bot v-else-if="props.driveType === 'ai'" :size="20" />
        <UserCog v-else-if="props.driveType === 'human-ai'" :size="20" />
        <p>{{ driveTypeConfig.text }}</p>
      </div>
    </div>
    <p class="text-[#4B5563] mb-4 flex-grow">{{ description }}</p>
    <button
      class="flex items-center gap-2 mt-auto cursor-pointer"
      :class="props.isInPipeline ? 'text-red-500' : 'text-[#F59E0C]'"
      @click="$emit('togglePipeline', originalIndex)"
    >
      <CirclePlus v-if="!props.isInPipeline" />
      <CircleMinus v-else />
      <p>
        {{ props.isInPipeline ? "Remove from pipeline" : "Add to pipeline" }}
      </p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  UserRound,
  Bot,
  UserCog,
  CirclePlus,
  CircleMinus,
} from "lucide-vue-next";
import type { DriveType } from "@/types/exercise";

const props = defineProps<{
  title: string;
  description: string;
  driveType: DriveType;
  isInPipeline?: boolean;
  originalIndex: number;
}>();

defineEmits<{
  (e: "togglePipeline", index: number): void;
}>();

interface DriveTypeConfig {
  text: string;
  bgColor: string;
  textColor: string;
}

const driveTypeConfig = computed<DriveTypeConfig>(() => {
  switch (props.driveType) {
    case "human-ai":
      return {
        text: "Human+AI Collaboration",
        bgColor: "bg-[#F3E8FF]",
        textColor: "text-[#6B21A8]",
      };
    case "ai":
      return {
        text: "AI-driven",
        bgColor: "bg-[#D1FAE5]",
        textColor: "text-[#076046]",
      };
    case "human":
    default:
      return {
        text: "Human-driven",
        bgColor: "bg-[#DBE9FE]",
        textColor: "text-[#1D40AE]",
      };
  }
});
</script>
