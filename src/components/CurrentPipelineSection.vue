<template>
  <div
    class="border-t border-gray-200 bg-white px-4 py-3 h-20 flex items-center relative"
  >
    <template v-for="offset in allRenderingLineOffsets" :key="'line-' + offset">
      <div
        class="absolute bottom-0 bg-gray-300 w-px"
        :style="{
          left: calculateLineLeftPosition(offset) + 'px',
          top: '0px',
          bottom: '0px',
        }"
      ></div>
    </template>
    <div
      v-if="horizontalLineWidth > 0"
      class="absolute bg-black h-0.5"
      :style="{
        left: horizontalLineLeft + 'px',
        width: horizontalLineWidth + 'px',
        top: HORIZONTAL_LINE_TOP_STYLE,
      }"
    ></div>
    <template v-for="item in pinDisplayData" :key="item.key">
      <div
        class="relative"
        @mouseenter="hoveredPinOriginalIndex = item.originalIndex"
        @mouseleave="hoveredPinOriginalIndex = null"
      >
        <div
          class="absolute w-4 h-4 transform rotate-45 bg-[#F5F0E5] border border-black"
          :style="item.diamondStyle"
        ></div>
        <button
          v-if="hoveredPinOriginalIndex === item.originalIndex"
          @click="requestUnselect(item.originalIndex)"
          class="absolute bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold z-10"
          :style="{
            left:
              item.diamondCenterX +
              REMOVE_BUTTON_OFFSET_X_FROM_CENTER_PX +
              'px',
            top: item.diamondStyle.top,
            transform: `translateY(${REMOVE_BUTTON_TRANSLATE_Y_PX})`,
            cursor: 'pointer',
          }"
          title="Remove pin"
        >
          <X class="w-4 h-4" />
        </button>
        <div
          class="absolute transform bg-[#F5F0E5] border border-black px-2 py-0.5 rounded-sm"
          :style="item.labelStyle"
        >
          <p
            class="text-center text-xs"
            style="
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ item.pinName }}
          </p>
        </div>
      </div>
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
import { computed, ref } from "vue";
import { Network, ChevronUp, X } from "lucide-vue-next";

const DIAMOND_HALF_WIDTH_PX = 7;
const DIAMOND_TOP_STYLE = "calc(50% - 27px)";
const LABEL_TOP_STYLE = "calc(50% - 10px)";
const HORIZONTAL_LINE_TOP_STYLE = "calc(50% - 20px)";
const DEFAULT_LABEL_MAX_WIDTH_PX = 120;
const LABEL_MARGIN_BETWEEN_PX = 10;
const MIN_LABEL_WIDTH_PX = 50;
const REMOVE_BUTTON_OFFSET_X_FROM_CENTER_PX = 7;
const REMOVE_BUTTON_TRANSLATE_Y_PX = "-2px";

const emit = defineEmits(["unselectPinRequested"]);
const props = defineProps<{
  allRenderingLineOffsets: number[];
  mainContentScreenLeft: number;
  selectedPins: { name: string; originalIndex: number; order: number }[];
}>();
const hoveredPinOriginalIndex = ref<number | null>(null);
const requestUnselect = (idx: number) => emit("unselectPinRequested", idx);
const calculateLineLeftPosition = (offset: number): number =>
  props.mainContentScreenLeft + offset;

const horizontalLineLeft = computed(() =>
  props.allRenderingLineOffsets?.length
    ? calculateLineLeftPosition(props.allRenderingLineOffsets[0])
    : 0
);
const horizontalLineWidth = computed(() => {
  if (props.allRenderingLineOffsets?.length > 1) {
    const first = calculateLineLeftPosition(props.allRenderingLineOffsets[0]);
    const last = calculateLineLeftPosition(
      props.allRenderingLineOffsets[props.allRenderingLineOffsets.length - 1]
    );
    return Math.max(0, last - first);
  }
  return 0;
});

const pinDisplayData = computed(() => {
  // Return empty if no pins are selected
  if (!props.selectedPins?.length) return [];
  // Sort pins by their order for consistent display
  const pins = [...props.selectedPins].sort((a, b) => a.order - b.order);
  const numPins = pins.length;
  // Fallback: if no rendering line offsets, place all pins at mainContentScreenLeft
  if (!props.allRenderingLineOffsets?.length) {
    return pins.map((pin, i) => ({
      key: `pin-fallback-${pin.originalIndex}-${i}`,
      pinName: pin.name,
      originalIndex: pin.originalIndex,
      diamondCenterX: props.mainContentScreenLeft,
      diamondStyle: {
        left: `${props.mainContentScreenLeft - DIAMOND_HALF_WIDTH_PX}px`,
        top: DIAMOND_TOP_STYLE,
      },
      labelStyle: {
        left: `${props.mainContentScreenLeft}px`,
        top: LABEL_TOP_STYLE,
        transform: "translateX(-50%)",
        maxWidth: `${DEFAULT_LABEL_MAX_WIDTH_PX}px`,
      },
    }));
  }

  // Calculate the start and end X positions of the pipeline
  const startX = calculateLineLeftPosition(props.allRenderingLineOffsets[0]);
  const endX = calculateLineLeftPosition(
    props.allRenderingLineOffsets[props.allRenderingLineOffsets.length - 1]
  );
  const pipelineWidth = Math.max(0, endX - startX);

  let diamondCenters: number[];
  let effectiveSpacing: number;

  if (numPins === 1) {
    // Only one pin: center it at the start
    diamondCenters = [startX];
    effectiveSpacing = Math.max(DEFAULT_LABEL_MAX_WIDTH_PX, pipelineWidth);
  } else if (numPins <= props.allRenderingLineOffsets.length) {
    // Fewer pins than lines: align each pin to a line
    diamondCenters = pins.map((_, i) =>
      calculateLineLeftPosition(props.allRenderingLineOffsets[i])
    );
    // Find the minimum spacing between adjacent pins for label sizing
    let minSpacing = Infinity;
    if (diamondCenters.length > 1) {
      for (let i = 0; i < diamondCenters.length - 1; i++) {
        minSpacing = Math.min(
          minSpacing,
          diamondCenters[i + 1] - diamondCenters[i]
        );
      }
    }
    effectiveSpacing = minSpacing === Infinity ? pipelineWidth : minSpacing;
  } else {
    // More pins than lines: distribute pins evenly across the pipeline
    const spacing = pipelineWidth / (numPins - 1);
    diamondCenters = pins.map((_, i) => startX + i * spacing);
    effectiveSpacing = spacing;
  }

  return pins.map((pin, i) => {
    const center = diamondCenters[i];
    let maxWidth = DEFAULT_LABEL_MAX_WIDTH_PX;
    // Adjust label width based on available spacing
    if (numPins > 1 && effectiveSpacing > 0) {
      maxWidth = Math.min(
        DEFAULT_LABEL_MAX_WIDTH_PX,
        effectiveSpacing - LABEL_MARGIN_BETWEEN_PX
      );
    }
    const finalWidth = Math.max(MIN_LABEL_WIDTH_PX, maxWidth);
    return {
      key: `pin-display-${pin.originalIndex}-${i}`,
      pinName: pin.name,
      originalIndex: pin.originalIndex,
      diamondCenterX: center,
      diamondStyle: {
        left: `${center - DIAMOND_HALF_WIDTH_PX}px`,
        top: DIAMOND_TOP_STYLE,
      },
      labelStyle: {
        left: `${center}px`,
        top: LABEL_TOP_STYLE,
        transform: "translateX(-50%)",
        maxWidth: `${finalWidth}px`,
      },
    };
  });
});
</script>
