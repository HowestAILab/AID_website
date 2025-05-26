<template>
  <div class="max-w-128 border p-4 rounded">
    <p class="text-md mb-2">{{ title }}</p>
    <p class="text-sm text-[#4B5563] mb-1">{{ stage }}</p>
    <p class="text-sm text-[#4B5563]">
      {{ description }}
    </p>
    <div class="my-4"></div>
    <div class="flex flex-col gap-2">
      <button
        class="w-full border border-[#F59E0C] bg-[#F59E0C]/10 text-[#D97704] p-2 rounded-sm items-center flex justify-center gap-2"
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
const props = defineProps<{
    title: string;
    stage: string;
    description: string;
}>();

</script>
