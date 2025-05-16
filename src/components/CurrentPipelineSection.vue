<template>
  <div
    class="border-t border-gray-200 bg-white px-4 py-3 h-20 flex items-center relative"
  >
    <!-- Vertical Grey Lines -->
    <template v-for="offset in allRenderingLineOffsets" :key="'line-' + index">
      <div
        class="absolute bottom-0 bg-gray-300 w-px"
        :style="{
          left: calculateLineLeftPosition(offset) + 'px',
          top: '0px',
          bottom: '0px',
        }"
      ></div>
    </template>

    <!-- Horizontal Line -->
    <div
      v-if="allRenderingLineOffsets && allRenderingLineOffsets.length > 0"
      class="absolute bg-black h-0.5"
      :style="{
        left: calculateLineLeftPosition(allRenderingLineOffsets[0]) + 'px',
        width:
          (allRenderingLineOffsets.length > 1
            ? calculateLineLeftPosition(
                allRenderingLineOffsets[allRenderingLineOffsets.length - 1]
              ) - calculateLineLeftPosition(allRenderingLineOffsets[0])
            : 0) + 'px',
        top: 'calc(50% - 1px)',
      }"
    ></div>

    <Network class="w-5 h-5 mr-3 text-gray-500" />
    <span class="text-sm font-medium text-gray-700">Current pipeline</span>
    <div class="flex-grow"></div>
    <div class="border p-2 rounded-xs">
      <ChevronUp class="w-5 h-5 text-[#336AFF]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Network, ChevronUp } from "lucide-vue-next";

const props = defineProps<{
  allRenderingLineOffsets: number[];
  mainContentScreenLeft: number;
}>();

const calculateLineLeftPosition = (offsetFromMain: number): number => {
  const lineScreenX = props.mainContentScreenLeft + offsetFromMain;
  return lineScreenX;
};
</script>
