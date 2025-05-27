<template>
  <div class="py-6 flex-1">
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
            <h4 class="font-medium leading-none">
              {{ selectedPin.labelConfig.text }}
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ selectedPin.description }}
            </p>
          </div>
          <div class="flex justify-end">
            <Button
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
    <v-stage :config="configKonva" ref="stageRef">
      <v-layer>
        <v-image :config="configImage" />
        <v-line :config="configHorizontalLine1" />
        <v-line :config="configHorizontalLine2" />
        <v-line :config="configHorizontalLine3" />
        <v-text :config="configHumanAxisLabel" />
        <v-text :config="configHumanAiAxisLabel" />
        <v-text :config="configAiAxisLabel" />

        <template v-for="(pin, i) in pins" :key="i">
          <template v-if="pin.isAddedToDiamond">
            <v-regular-polygon
              v-if="pin.isSelected"
              :config="{
                ...pin.config,
                sides: 4,
                radius: pin.config.radius + 2,
              }"
              @click="handlePinClick(i)"
              @mouseenter="() => handleMouseEnter(i)"
              @mouseleave="handleMouseLeave"
            />
            <v-circle
              v-else
              :config="pin.config"
              @click="handlePinClick(i)"
              @mouseenter="() => handleMouseEnter(i)"
              @mouseleave="handleMouseLeave"
            />
            <v-text
              :config="{
                x: pin.config.x - 4,
                y: pin.config.y - 7,
                text: String(i + 1),
                fontSize: 16,
                fill: '#374151',
                align: 'center',
                verticalAlign: 'middle',
              }"
              :listening="false"
            />
            <v-text 
              v-if="hoveredPinIndex === i"
              :config="pin.labelConfig" 
            />
          </template>
        </template>
      </v-layer>
    </v-stage>
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
} from "vue";
import Konva from "konva";
import pinsData from "@/../dummy.json";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const LOCAL_STORAGE_KEY_DIAMOND_EXERCISES = "diamondExercises";

interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

const emit = defineEmits<{
  (e: "selectedPinsChange", selectedPins: SelectedPinInfo[]): void;
}>();

const props = defineProps<{
  configKonva: any;
  configImage: any;
  imageObj: HTMLImageElement | null;
}>();

const stageRef = ref<Konva.Stage | null>(null);

interface PinConfig {
  isSelected: boolean;
  isAddedToDiamond: boolean;
  order: number;
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

// Transform the exercise data into PinConfig format
const transformExerciseToPin = (exercise: any, index: number): PinConfig => {
  // Adjusting the spacing between pins based on the scale of the exercise
  const x = 200 + index * 120;
  const y =
    200 +
    (exercise.location.human_ai_scale === 3
      ? 0
      : exercise.location.human_ai_scale === 2
      ? 100
      : 200);

  return {
    isSelected: false,
    isAddedToDiamond: false,
    order: index,
    config: {
      x,
      y,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: x + 20,
      y: y - 10,
      text: exercise.name,
      fontSize: 14,
      fill: "#374151",
    },
    description: exercise.description,
    location: exercise.location,
  };
};

const pins = ref<PinConfig[]>(
  (pinsData.exercise || []).map((exercise, index) =>
    transformExerciseToPin(exercise, index)
  )
);

const selectedPinPopover = ref(false);
const selectedPin = ref<PinConfig | null>(null);
const selectedPinIndex = ref<number | null>(null);
const pinTriggerRef = ref<HTMLElement | null>(null);
const selectedPinPosition = ref({ x: 0, y: 0 });
const hoveredPinIndex = ref<number | null>(null);

function handlePinClick(index: number) {
  selectedPin.value = pins.value[index];
  selectedPinIndex.value = index;

  if (stageRef.value) {
    const stage = stageRef.value.getStage();
    const stageContainer = stage.container();
    const containerRect = stageContainer.getBoundingClientRect();

    selectedPinPosition.value = {
      x: containerRect.left + pins.value[index].config.x,
      y: containerRect.top + pins.value[index].config.y,
    };
  }

  selectedPinPopover.value = true;
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
  const selectedPinData = selectedIndices.map((idx) => ({
    name: pins.value[idx].labelConfig.text,
    originalIndex: idx,
    order: pins.value[idx].order,
    description: pins.value[idx].description,
    location: pins.value[idx].location,
  }));

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

// Expose the togglePinSelected method for external use
defineExpose({
  togglePinSelected: togglePinSelection,
  loadSelectedPins: (projectSelectedPins: SelectedPinInfo[]) => {
    // Clear current selections
    pins.value.forEach(pin => {
      pin.isSelected = false;
    });
    
    // Set selected pins based on project state
    const projectSelectedIndices: number[] = [];
    projectSelectedPins.forEach(pinInfo => {
      if (pinInfo.originalIndex >= 0 && pinInfo.originalIndex < pins.value.length) {
        pins.value[pinInfo.originalIndex].isSelected = true;
        projectSelectedIndices.push(pinInfo.originalIndex);
      }
    });
    
    selectedIndices = projectSelectedIndices;
  }
});

const handleMouseEnter = (index: number) => {
  hoveredPinIndex.value = index;
  if (stageRef.value) {
    const stage = stageRef.value.getStage();
    if (stage && stage.container()) {
      stage.container().style.cursor = "pointer";
    }
  }
};

const handleMouseLeave = () => {
  hoveredPinIndex.value = null;
  if (stageRef.value) {
    const stage = stageRef.value.getStage();
    if (stage && stage.container()) {
      stage.container().style.cursor = "default";
    }
  }
};

const horizontalLineYFraction1 = 9 / 40;
const horizontalLineYFraction2 = 17.9 / 40;
const horizontalLineYFraction3 = 26.7 / 40;

const configHorizontalLine1 = computed(() => ({
  points: [
    0,
    props.configKonva.height * horizontalLineYFraction1,
    props.configKonva.width,
    props.configKonva.height * horizontalLineYFraction1,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHorizontalLine2 = computed(() => ({
  points: [
    0,
    props.configKonva.height * horizontalLineYFraction2,
    props.configKonva.width,
    props.configKonva.height * horizontalLineYFraction2,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHorizontalLine3 = computed(() => ({
  points: [
    0,
    props.configKonva.height * horizontalLineYFraction3,
    props.configKonva.width,
    props.configKonva.height * horizontalLineYFraction3,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHumanAxisLabel = computed(() => ({
  x: -100,
  y: props.configKonva.height * horizontalLineYFraction1,
  text: "human axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

const configHumanAiAxisLabel = computed(() => ({
  x: -100,
  y: props.configKonva.height * horizontalLineYFraction2,
  text: "human+ai axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

const configAiAxisLabel = computed(() => ({
  x: -100,
  y: props.configKonva.height * horizontalLineYFraction3,
  text: "ai axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

onMounted(() => {
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
});
</script> 