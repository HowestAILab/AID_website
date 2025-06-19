<template>
  <div class="flex-1 relative w-full h-full">
    <!-- Popover for pin details -->
    <Popover v-model:open="selectedPinPopover" :key="selectedPinIndex ?? -1">
      <PopoverTrigger as-child>
        <div
          ref="pinTriggerRef"
          class="absolute"
          :style="{
            left: selectedPinPosition.x + 'px',
            top: selectedPinPosition.y + 'px',
          }"
        />
      </PopoverTrigger>
      <PopoverContent v-if="selectedPin" class="w-80">
        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-start justify-between">
              <h4 class="font-medium leading-none flex-1">
                {{ selectedPin.labelConfig.text }}
              </h4>
              <button
                @click="openExerciseModal"
                class="p-1 rounded-full hover:bg-gray-100 transition-colors ml-2"
                title="View exercise details"
              >
                <Info class="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ selectedPin.description }}
            </p>
          </div>
          <div class="flex justify-end">
            <Button
              class="cursor-pointer"
              :variant="selectedPin.isSelected ? 'destructive' : 'default'"
              @click="togglePinSelection(selectedPinIndex)"
            >
              {{
                selectedPin.isSelected
                  ? "Remove from pipeline"
                  : "Add to pipeline"
              }}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Exercise Specific Modal -->
    <Suspense>
      <component
        :is="ExerciseSpecificModal"
        v-model:open="exerciseModalOpen"
        :exercise="selectedExercise"
      />
    </Suspense>

    <!-- Diamond Grid Container -->
    <div
      ref="gridContainerRef"
      class="relative w-full h-full"
      :style="{
        minHeight: '0',
        width: '100%',
      }"
    >
      <!-- Background SVG - positioned and scaled based on actual SVG dimensions -->
      <div
        class="absolute"
        :style="{
          left: svgScale.left + 'px',
          top: svgScale.top + 'px',
          width: svgScale.width + 'px',
          height: svgScale.height + 'px',
          zIndex: 1,
        }"
      >
        <img
          v-if="imageObj"
          :src="imageObj.src"
          alt="Double Diamond"
          class="w-full h-full pointer-events-none"
          :style="{
            width: '100%',
            height: '100%',
          }"
        />
      </div>

      <!-- Horizontal Lines - aligned with the SVG -->
      <div class="absolute inset-0" style="z-index: 2">
        <div
          class="absolute border-t border-gray-300"
          :style="{
            top: svgScale.top + humanLineY + 'px',
            left: svgScale.left + 'px',
            width: svgScale.width + 'px',
          }"
        ></div>
        <div
          class="absolute border-t border-gray-300"
          :style="{
            top: svgScale.top + humanAiLineY + 'px',
            left: svgScale.left + 'px',
            width: svgScale.width + 'px',
          }"
        ></div>
        <div
          class="absolute border-t border-gray-300"
          :style="{
            top: svgScale.top + aiLineY + 'px',
            left: svgScale.left + 'px',
            width: svgScale.width + 'px',
          }"
        ></div>
      </div>

      <!-- Axis Labels -->
      <div
        class="absolute text-xs text-gray-600 font-medium"
        style="z-index: 3"
        :style="{
          left: svgScale.left - 10 + 'px',
          top: svgScale.top - 10 + 'px',
        }"
      >
        <div
          class="absolute whitespace-nowrap -translate-x-full pr-4"
          :style="{ top: humanLineY + 'px' }"
        >
          human axis
        </div>
        <div
          class="absolute whitespace-nowrap -translate-x-full pr-4"
          :style="{ top: humanAiLineY + 'px' }"
        >
          human+ai axis
        </div>
        <div
          class="absolute whitespace-nowrap -translate-x-full pr-4"
          :style="{ top: aiLineY + 'px' }"
        >
          ai axis
        </div>
      </div>

      <!-- Exercise Pins -->
      <div class="absolute inset-0">
        <template v-for="(pin, i) in pins" :key="i">
          <div
            v-if="pin.isAddedToDiamond"
            class="absolute flex items-center transition-opacity duration-200"
            :class="{
              'opacity-50':
                hoveredColumnIndex !== null &&
                !isPinInColumn(i, hoveredColumnIndex),
            }"
            :style="{
              left: pin.config.x + 'px',
              top: pin.config.y + 'px',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
            }"
          >
            <!-- Pin Circle/Diamond -->
            <div
              class="relative cursor-pointer transition-all duration-200 hover:scale-110"
              @click="handlePinClick(i)"
            >
              <!-- Selected state: diamond shape -->
              <div
                v-if="pin.isSelected"
                class="w-7 h-7 bg-[#F5F0E5] border-2 border-black transform rotate-45 flex items-center justify-center relative"
                :style="{
                  backgroundColor: pin.config.fill,
                  borderColor: pin.config.stroke,
                  borderWidth: pin.config.strokeWidth + 'px',
                }"
              >
                <span
                  class="text-sm font-medium text-gray-700 transform -rotate-45"
                >
                  {{ i + 1 }}
                </span>
                <!-- Ethics indicator -->
                <span
                  v-if="pin.hasEthicsBefore || pin.hasEthicsAfter"
                  class="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  :class="
                    pin.hasEthicsBefore && pin.hasEthicsAfter
                      ? 'bg-purple-600'
                      : pin.hasEthicsBefore
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  "
                />
              </div>
              <!-- Unselected state: circle -->
              <div
                v-else
                class="w-6 h-6 rounded-full border flex items-center justify-center relative"
                :style="{
                  backgroundColor: pin.config.fill,
                  borderColor: pin.config.stroke,
                  borderWidth: pin.config.strokeWidth + 'px',
                  width: pin.config.radius * 2 + 'px',
                  height: pin.config.radius * 2 + 'px',
                }"
              >
                <span class="text-sm font-medium text-gray-700">
                  {{ i + 1 }}
                </span>
                <!-- Ethics indicator for unselected -->
                <span
                  v-if="pin.hasEthicsBefore || pin.hasEthicsAfter"
                  class="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  :class="
                    pin.hasEthicsBefore && pin.hasEthicsAfter
                      ? 'bg-purple-600'
                      : pin.hasEthicsBefore
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  "
                />
              </div>
            </div>

            <!-- Hover Label -->
            <div
              v-if="
                hoveredColumnIndex !== null &&
                isPinInColumn(i, hoveredColumnIndex)
              "
              class="absolute left-full ml-2 bg-white px-2 py-1 rounded shadow-lg border text-sm whitespace-nowrap z-10"
              :style="{
                top: '50%',
                transform: 'translateY(-50%)',
              }"
            >
              {{ pin.labelConfig.text }}
            </div>
          </div>
        </template>
      </div>

      <!-- Ethics Exercise Position Lines -->
      <div class="absolute inset-0" style="z-index: 4">
        <div
          v-for="ethicsPosition in getEthicsExercisePositions()"
          :key="ethicsPosition.type"
          class="absolute border-l-2 border-purple-500 border-dashed opacity-60"
          :style="{
            left: calculateEthicsLinePosition(ethicsPosition.position) + 'px',
            top: svgScale.top + 'px',
            height: svgScale.height + 'px',
          }"
        >
          <!-- Ethics Line Label -->
          <div
            class="absolute -top-6 -left-8 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium border border-purple-300 whitespace-nowrap"
            :class="{ 'bg-purple-200 border-purple-400': ethicsPosition.completed }"
            :title="ethicsPosition.description"
          >
            <Shield class="w-3 h-3 inline mr-1" />
            {{ ethicsPosition.name }}
            <CheckCircle2 v-if="ethicsPosition.completed" class="w-3 h-3 inline ml-1 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Add invisible column hover areas -->
      <div class="absolute inset-0 pointer-events-none" style="z-index: 25">
        <div
          v-for="(section, index) in sectionLabels"
          :key="'section-' + index"
          class="absolute top-0 bottom-0 pointer-events-auto"
          :style="{
            left: section.left + 'px',
            width: section.width + 'px',
          }"
          @mouseenter="hoveredColumnIndex = index"
          @mouseleave="hoveredColumnIndex = null"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  defineEmits,
  ref,
  onMounted,
  defineExpose,
  watch,
  nextTick,
  defineAsyncComponent,
} from "vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info, Shield, CheckCircle2 } from "lucide-vue-next";
import { SECTION_LABEL_TEXTS } from "@/constants/app";
import { useEthics } from "@/composables/useEthics";
import { useExercises } from "@/composables/useExercises";
import { useEthicsExercises } from "@/composables/useEthicsExercises";
import type { SelectedPinInfo } from "@/types/exercise";
import type { Exercise } from "@/types/exercise";

const LOCAL_STORAGE_KEY_DIAMOND_EXERCISES = "diamondExercises";

const emit = defineEmits<{
  (e: "selectedPinsChange", selectedPins: SelectedPinInfo[]): void;
  (
    e: "layoutUpdate",
    layout: {
      sectionLabels: { text: string; left: number; width: number }[];
      addExercisesButtonCenterOffsets: number[];
      svgBounds: { left: number; top: number; width: number; height: number };
    }
  ): void;
}>();

const props = defineProps<{
  containerWidth: number;
  containerHeight: number;
  imageObj: HTMLImageElement | null;
}>();

const gridContainerRef = ref<HTMLElement | null>(null);

// SVG dimensions from the original file
const SVG_WIDTH = 834;
const SVG_HEIGHT = 420;

// Computed properties for SVG scaling and positioning
const svgScale = computed(() => {
  if (!props.containerWidth || !props.containerHeight)
    return { width: SVG_WIDTH, height: SVG_HEIGHT, left: 0, top: 0 };

  // Calculate available space (with 10% padding on each side)
  const paddingPercent = 0.08;
  const availableWidth = props.containerWidth * (1 - 2 * paddingPercent);
  const availableHeight = props.containerHeight * 0.95; // Use 95% of total height

  // Calculate scale to fit SVG within available space while maintaining aspect ratio
  const scaleX = availableWidth / SVG_WIDTH;
  const scaleY = availableHeight / SVG_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  // Calculate actual rendered SVG dimensions
  const renderedWidth = SVG_WIDTH * scale;
  const renderedHeight = SVG_HEIGHT * scale;

  // Center horizontally and position with minimal top margin
  const leftOffset =
    props.containerWidth * paddingPercent +
    (availableWidth - renderedWidth) / 2;
  const topOffset = props.containerHeight * 0.025; // 2.5% from top (smaller margin)

  return {
    width: renderedWidth,
    height: renderedHeight,
    left: leftOffset,
    top: topOffset,
    scale,
  };
});

interface PinConfig {
  isSelected: boolean;
  isAddedToDiamond: boolean;
  order: number;
  hasEthicsBefore: boolean;
  hasEthicsAfter: boolean;
  config: {
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  labelConfig: {
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fill: string;
  };
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

// Initialize pins ref with static data
const { hasEthicsRequirement } = useEthics();
const { getAllExercises, loadExercises } = useExercises();
const { getEthicsExercisePositions } = useEthicsExercises();

// Load exercises data
loadExercises();

const pins = ref<PinConfig[]>([]);

// Initialize pins from useExercises data
const initializePins = () => {
  const exercises = getAllExercises.value;
  pins.value = exercises.map((exercise: any, index: number): PinConfig => {
    // Calculate initial X position based on phase and step
    const x = calculatePhaseXPosition(
      exercise.location.phase,
      exercise.location.step,
      index
    );
    const initialY = 200;

    const hasEthicsBefore = Boolean(hasEthicsRequirement(exercise, "before"));
    const hasEthicsAfter = Boolean(hasEthicsRequirement(exercise, "after"));

    return {
      isSelected: false,
      isAddedToDiamond: false,
      order: index,
      hasEthicsBefore,
      hasEthicsAfter,
      config: {
        x,
        y: initialY,
        radius: 12,
        fill: "#F5F0E5",
        stroke: "black",
        strokeWidth: 1,
      },
      labelConfig: {
        x: x + 20,
        y: initialY - 10,
        text: exercise.name,
        fontSize: 14,
        fill: "#374151",
      },
      description: exercise.description,
      location: exercise.location,
    };
  });
};

const selectedPinPopover = ref(false);
const selectedPin = ref<PinConfig | null>(null);
const selectedPinIndex = ref<number | null>(null);
const pinTriggerRef = ref<HTMLElement | null>(null);
const selectedPinPosition = ref({ x: 0, y: 0 });
const hoveredColumnIndex = ref<number | null>(null);

// Exercise modal state
const exerciseModalOpen = ref(false);
const selectedExercise = ref<Exercise | null>(null);

// Dynamic component import
const ExerciseSpecificModal = defineAsyncComponent(
  () => import("@/components/exercise/ExerciseSpecificModal.vue")
);

// Line Y positions - repositioned to top, center, bottom
const horizontalLineYFraction1 = 0.25; // Top (human axis, moved closer to center)
const horizontalLineYFraction2 = 0.5; // Center (human+ai axis)
const horizontalLineYFraction3 = 0.75; // Bottom (ai axis, moved closer to center)

const humanLineY = computed(
  () => svgScale.value.height * horizontalLineYFraction1
);
const humanAiLineY = computed(
  () => svgScale.value.height * horizontalLineYFraction2
);
const aiLineY = computed(
  () => svgScale.value.height * horizontalLineYFraction3
);

// Section labels based on SVG scaling - 8 sections total (4 phases × 2 steps)
const sectionLabels = computed(() => {
  const svgLeft = svgScale.value.left;
  const svgWidth = svgScale.value.width;
  const sectionWidth = svgWidth / 8; // 8 equal sections

  const labels: { text: string; left: number; width: number }[] = [];

  // Create 8 sections based on the section label texts
  for (let i = 0; i < SECTION_LABEL_TEXTS.length; i++) {
    labels.push({
      text: SECTION_LABEL_TEXTS[i],
      left: svgLeft + i * sectionWidth,
      width: sectionWidth,
    });
  }

  return labels;
});

// Add exercise button positions - center of each phase (4 buttons total)
const addExercisesButtonCenterOffsets = computed(() => {
  const svgLeft = svgScale.value.left;
  const svgWidth = svgScale.value.width;
  const phaseWidth = svgWidth / 4;

  return [
    svgLeft + phaseWidth * 0.5, // Discover center
    svgLeft + phaseWidth * 1.5, // Define center
    svgLeft + phaseWidth * 2.5, // Develop center
    svgLeft + phaseWidth * 3.5, // Deliver center
  ];
});

function handlePinClick(index: number) {
  selectedPin.value = pins.value[index];
  selectedPinIndex.value = index;

  selectedPinPosition.value = {
    x: pins.value[index].config.x,
    y: pins.value[index].config.y,
  };

  selectedPinPopover.value = true;
}

function openExerciseModal() {
  if (selectedPinIndex.value !== null) {
    const exercise = getAllExercises.value[selectedPinIndex.value];
    selectedExercise.value = exercise;
    exerciseModalOpen.value = true;
  }
}

let selectedIndices: number[] = [];
function togglePinSelection(index: number | null) {
  if (index === null) return;

  // Toggle pin selection
  pins.value[index].isSelected = !pins.value[index].isSelected;

  if (pins.value[index].isSelected) {
    // Add to end if selected
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
  } else {
    // Remove if deselected
    selectedIndices = selectedIndices.filter((i) => i !== index);
  }

  // Build selectedPinData in the order of selectedIndices
  const selectedPinData = selectedIndices
    .map((idx) => {
      const exercise = getAllExercises.value[idx];
      if (!exercise) {
        console.warn(`Exercise not found at index ${idx}`);
        return null;
      }

      // Debug logging for ethics data
      if (
        exercise.name === "AI-Powered Trend Analysis" ||
        exercise.name === "AI-Assisted Technical Architecture Planning"
      ) {
        console.log("🔧 DiamondGrid Exercise Debug:", {
          name: exercise.name,
          idx,
          hasEthical: !!exercise.ethical,
          ethicalData: exercise.ethical,
          exerciseKeys: Object.keys(exercise),
        });
      }

      return {
        name: exercise.name,
        originalIndex: idx,
        order: idx, // Use the index as order
        description: exercise.description,
        location: exercise.location,
        ethical: exercise.ethical, // Include full ethics data from original source
      };
    })
    .filter(Boolean) as SelectedPinInfo[];

  emit("selectedPinsChange", selectedPinData);

  // Update the selectedPin ref to reflect the new state
  if (selectedPin.value) {
    selectedPin.value = {
      ...selectedPin.value,
      isSelected: pins.value[index].isSelected,
    };
  }

  selectedPinPopover.value = false;
}

// Expose methods for external use
defineExpose({
  togglePinSelected: togglePinSelection,
  loadSelectedPins: (projectSelectedPins: SelectedPinInfo[]) => {
    // Clear current selections
    pins.value.forEach((pin) => {
      pin.isSelected = false;
    });

    // Set selected pins based on project state
    const projectSelectedIndices: number[] = [];
    projectSelectedPins.forEach((pinInfo) => {
      if (
        pinInfo.originalIndex >= 0 &&
        pinInfo.originalIndex < pins.value.length
      ) {
        pins.value[pinInfo.originalIndex].isSelected = true;
        projectSelectedIndices.push(pinInfo.originalIndex);
      }
    });

    selectedIndices = projectSelectedIndices;
  },
});

// Emit layout update to parent components
const emitLayoutUpdate = () => {
  emit("layoutUpdate", {
    sectionLabels: sectionLabels.value,
    addExercisesButtonCenterOffsets: addExercisesButtonCenterOffsets.value,
    svgBounds: {
      left: svgScale.value.left,
      top: svgScale.value.top,
      width: svgScale.value.width,
      height: svgScale.value.height,
    },
  });
};

// Helper function to check if a pin is in a specific column
const isPinInColumn = (pinIndex: number, columnIndex: number) => {
  const pin = pins.value[pinIndex];
  const section = sectionLabels.value[columnIndex];
  const pinX = pin.config.x;
  return pinX >= section.left && pinX <= section.left + section.width;
};

// Calculate pin positions based on human_ai_scale and phase
const calculatePinPositions = () => {
  if (props.containerHeight <= 0 || props.containerWidth <= 0) return;

  const svgTop = svgScale.value.top;
  const svgHeight = svgScale.value.height;
  const svgBottom = svgTop + svgHeight;

  // Define number of levels (e.g., 10)
  const NUM_LEVELS = 10;
  // The vertical range for pins: full SVG height
  const yMin = svgTop;
  const yMax = svgBottom;

  // 1. Group pins by cell (phase, step, quantized scale)
  const cellMap = new Map<string, number[]>(); // key -> array of pin indices
  const quantizeScale = (scale: number) =>
    Math.round((scale * (NUM_LEVELS - 1)) / 10) / ((NUM_LEVELS - 1) / 10); // quantize to NUM_LEVELS

  pins.value.forEach((pin, idx) => {
    const key = `${pin.location.phase}-${pin.location.step}-${quantizeScale(
      pin.location.human_ai_scale
    )}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key)!.push(idx);
  });

  // 2. For each cell, space pins in a grid if needed to avoid overlap
  cellMap.forEach((indices, key) => {
    // Parse key
    const [phase, step, scaleStr] = key.split("-");
    const scale = parseFloat(scaleStr);
    // Map scale (0-10) to level (0-9)
    const level = Math.round((scale * (NUM_LEVELS - 1)) / 10);
    // Calculate Y for this level (spread across full SVG height)
    const frac = level / (NUM_LEVELS - 1); // 0 to 1
    const baseY = yMin + frac * (yMax - yMin);
    // Y band for spacing (±2.5% of svg height)
    const yBand = svgHeight * 0.05;
    const yStart = baseY - yBand / 2;
    const yEnd = baseY + yBand / 2;
    // X section info
    const { sectionStart, sectionEnd, padding } = getSectionBounds(phase, step);
    const xStart = sectionStart + padding;
    const xEnd = sectionEnd - padding;
    const cellWidth = xEnd - xStart;
    const cellHeight = yEnd - yStart;
    // How many pins in this cell?
    const n = indices.length;
    if (n === 1) {
      // Center the single pin
      const pinIdx = indices[0];
      const newPinX = xStart + cellWidth / 2;
      const newPinY = yStart + cellHeight / 2;
      const pin = pins.value[pinIdx];
      pin.config.x = newPinX;
      pin.config.y = newPinY;
      pin.labelConfig.x = newPinX + 20;
      pin.labelConfig.y = newPinY - 10;
      return;
    }
    // Calculate grid size
    const MIN_PIN_DISTANCE = 28;
    const maxCols = Math.max(1, Math.floor(cellWidth / MIN_PIN_DISTANCE));
    const rows = Math.ceil(n / maxCols);
    const cols = Math.min(n, maxCols);
    const rowSpacing = rows > 1 ? cellHeight / (rows - 1) : 0;
    const colSpacing = cols > 1 ? cellWidth / (cols - 1) : 0;
    indices.forEach((pinIdx, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const newPinX = xStart + (cols === 1 ? cellWidth / 2 : col * colSpacing);
      const newPinY = yStart + (rows === 1 ? cellHeight / 2 : row * rowSpacing);
      const pin = pins.value[pinIdx];
      pin.config.x = newPinX;
      pin.config.y = newPinY;
      pin.labelConfig.x = newPinX + 20;
      pin.labelConfig.y = newPinY - 10;
    });
  });
};

// Helper to get section bounds for a phase+step
function getSectionBounds(phase: string, step: string) {
  const gridMapping: Record<string, Record<string, number>> = {
    Discover: {
      Prepare: 0,
      Discover: 1,
    },
    Define: {
      Define: 2,
      Synthesise: 3,
    },
    Develop: {
      Prepare: 4,
      Develop: 5,
    },
    Deliver: {
      Deliver: 6,
      Synthesise: 7,
    },
  };
  const sectionIndex = gridMapping[phase]?.[step];
  if (sectionIndex === undefined) {
    console.warn(`Unknown phase/step combination: ${phase}/${step}`);
    // fallback
    const svgLeft = svgScale.value.left;
    return {
      sectionStart: svgLeft + 100,
      sectionEnd: svgLeft + 200,
      padding: 0,
    };
  }
  const svgLeft = svgScale.value.left;
  const svgWidth = svgScale.value.width;
  const sectionWidth = svgWidth / 8;
  const sectionStart = svgLeft + sectionIndex * sectionWidth;
  const sectionEnd = sectionStart + sectionWidth;
  const padding = sectionWidth * 0.1;
  return { sectionStart, sectionEnd, padding };
}

// Calculate ethics line position based on position (0-1)
function calculateEthicsLinePosition(position: number): number {
  const svgLeft = svgScale.value.left;
  const svgWidth = svgScale.value.width;
  
  // Position 0 = beginning, 0.5 = middle, 1 = end
  return svgLeft + (svgWidth * position);
}

// calculatePhaseXPosition is now only used for initial dummy positions
function calculatePhaseXPosition(
  phase: string,
  step: string,
  exerciseIndex: number
): number {
  // Map phase+step combinations to grid sections (0-7)
  const gridMapping: Record<string, Record<string, number>> = {
    Discover: {
      Prepare: 0, // prepare
      Discover: 1, // discover
    },
    Define: {
      Define: 2, // define
      Synthesise: 3, // synthesise
    },
    Develop: {
      Prepare: 4, // prepare
      Develop: 5, // develop
    },
    Deliver: {
      Deliver: 6, // deliver
      Synthesise: 7, // synthesise
    },
  };

  // Get the grid section index
  const sectionIndex = gridMapping[phase]?.[step];
  if (sectionIndex === undefined) {
    console.warn(`Unknown phase/step combination: ${phase}/${step}`);
    return svgScale.value.left + 100; // Fallback position
  }

  // Get SVG positioning and dimensions
  const svgLeft = svgScale.value.left;
  const svgWidth = svgScale.value.width;
  const sectionWidth = svgWidth / 8; // 8 equal grid sections

  // Calculate the grid cell boundaries
  const sectionStart = svgLeft + sectionIndex * sectionWidth;
  const sectionEnd = sectionStart + sectionWidth;

  // Add random positioning within the grid cell (with padding from edges)
  const padding = sectionWidth * 0.1; // 10% padding on each side
  const randomPosition =
    sectionStart + padding + Math.random() * (sectionWidth - 2 * padding);

  // Ensure the position stays within bounds
  const minX = sectionStart + padding;
  const maxX = sectionEnd - padding;

  return Math.max(minX, Math.min(maxX, randomPosition));
}

// Watch for container dimension changes and recalculate positions
watch(
  [() => props.containerWidth, () => props.containerHeight],
  () => {
    nextTick(() => {
      calculatePinPositions();
      emitLayoutUpdate();
    });
  },
  { immediate: true }
);

// Watch for exercises data changes and re-initialize pins
watch(
  getAllExercises,
  () => {
    if (getAllExercises.value.length > 0) {
      initializePins();
      nextTick(() => {
        calculatePinPositions();
        emitLayoutUpdate();
      });
    }
  },
  { immediate: true }
);

// Watch for SVG scaling changes and emit layout updates
watch(
  [sectionLabels, addExercisesButtonCenterOffsets],
  () => {
    emitLayoutUpdate();
  },
  { immediate: true }
);

onMounted(() => {
  // Initialize pins first
  initializePins();

  // Debug: Check if exercises are loaded with ethics data
  console.log("🔧 DiamondGrid Mount Debug - Exercises loaded:", {
    totalExercises: getAllExercises.value.length,
    firstFewExercises: getAllExercises.value.slice(0, 3).map((ex) => ({
      name: ex.name,
      hasEthical: !!ex.ethical,
      ethicalKeys: ex.ethical ? Object.keys(ex.ethical) : "none",
    })),
    trendAnalysis: getAllExercises.value.find(
      (ex) => ex.name === "AI-Powered Trend Analysis"
    ),
    techArchitecture: getAllExercises.value.find(
      (ex) => ex.name === "AI-Assisted Technical Architecture Planning"
    ),
  });

  // Load diamond exercises state from local storage to determine visibility
  const savedDiamondExercises = localStorage.getItem(
    LOCAL_STORAGE_KEY_DIAMOND_EXERCISES
  );
  const diamondExercisesMap = savedDiamondExercises
    ? JSON.parse(savedDiamondExercises)
    : {};

  pins.value.forEach((pin) => {
    // If the value is undefined or not explicitly false, make it true (so default is visible)
    pin.isAddedToDiamond = diamondExercisesMap[pin.labelConfig.text] !== false;
  });

  calculatePinPositions();
});
</script>
