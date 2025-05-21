<template>
  <div class="py-6 flex-1">
    <Popover v-model:open="selectedPinPopover">
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
          <v-regular-polygon
            v-if="pin.isSelected"
            :config="{ ...pin.config, sides: 4, radius: pin.config.radius + 2 }"
            @click="handlePinClick(i)"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          />
          <v-circle
            v-else
            :config="pin.config"
            @click="handlePinClick(i)"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          />
          <v-text :config="pin.labelConfig" />
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

const SELECTED_PINS_STORAGE_KEY = "selected-pins";

interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
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
  driveType: string;
  phase: string;
  category: string;
}

const pins = ref<PinConfig[]>(pinsData as PinConfig[]);

const selectedPinPopover = ref(false);
const selectedPin = ref<PinConfig | null>(null);
const selectedPinIndex = ref<number | null>(null);
const pinTriggerRef = ref<HTMLElement | null>(null);
const selectedPinPosition = ref({ x: 0, y: 0 });

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

function togglePinSelection(index: number | null) {
  if (index === null) return;

  // Toggle pin selection
  pins.value[index].isSelected = !pins.value[index].isSelected;

  // Update selected pins data for parent
  const selectedPinData: SelectedPinInfo[] = pins.value
    .map((pin, idx) =>
      pin.isSelected
        ? { name: pin.labelConfig.text, originalIndex: idx, order: pin.order }
        : null
    )
    .filter((pinInfo): pinInfo is SelectedPinInfo => pinInfo !== null);
  emit("selectedPinsChange", selectedPinData);

  // Save selected indices to localStorage
  const selectedIndices = selectedPinData.map((p) => p.originalIndex);
  localStorage.setItem(
    SELECTED_PINS_STORAGE_KEY,
    JSON.stringify(selectedIndices)
  );

  // Update the selectedPin ref to reflect the new state
  if (selectedPin.value) {
    selectedPin.value = {
      ...selectedPin.value,
      isSelected: pins.value[index].isSelected,
    };
  }
}

// Expose the togglePinSelected method for external use
defineExpose({
  togglePinSelected: togglePinSelection,
});

const handleMouseEnter = () => {
  if (stageRef.value) {
    const stage = stageRef.value.getStage();
    if (stage && stage.container()) {
      stage.container().style.cursor = "pointer";
    }
  }
};

const handleMouseLeave = () => {
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
  // Load selected pins from localStorage (still stores indices)
  const savedPinIndices = localStorage.getItem(SELECTED_PINS_STORAGE_KEY);
  if (savedPinIndices) {
    const selectedIndices: number[] = JSON.parse(savedPinIndices);
    const currentSelectedPinData: SelectedPinInfo[] = [];
    selectedIndices.forEach((index: number) => {
      if (index >= 0 && index < pins.value.length) {
        pins.value[index].isSelected = true;
        currentSelectedPinData.push({
          name: pins.value[index].labelConfig.text,
          originalIndex: index,
          order: pins.value[index].order,
        });
      }
    });
    emit("selectedPinsChange", currentSelectedPinData);
  }
});
</script>
