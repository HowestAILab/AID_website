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
    
    <!-- Selected Pin Diamonds -->
    <template v-for="(_, index) in selectedPins" :key="'diamond-' + index">
      <div
        class="absolute w-4 h-4 transform rotate-45 bg-[#F5F0E5] border border-black"
        :style="{
          left: calculateDiamondPosition(index) - 7 + 'px',
          top: 'calc(50% - 8px)',
        }"
      ></div>
    </template>

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
  selectedPins: number[];
}>();

const calculateLineLeftPosition = (offsetFromMain: number): number => {
  const lineScreenX = props.mainContentScreenLeft + offsetFromMain;
  return lineScreenX;
};

const calculateDiamondPosition = (index: number): number => {
  const startX = calculateLineLeftPosition(props.allRenderingLineOffsets[0]);
  const endX = calculateLineLeftPosition(
    props.allRenderingLineOffsets[props.allRenderingLineOffsets.length - 1]
  );
  const totalWidth = endX - startX;

  // If we have fewer or equal pins than lines, place them on the lines
  if (props.selectedPins.length <= props.allRenderingLineOffsets.length) {
    return calculateLineLeftPosition(props.allRenderingLineOffsets[index]);
  }

  // If we have more pins than lines, spread them evenly across the pipeline
  const spacing = totalWidth / (props.selectedPins.length - 1);
  return startX + spacing * index;
};
</script>
