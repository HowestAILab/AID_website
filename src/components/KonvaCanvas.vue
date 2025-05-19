<template>
  <div class="py-6 flex-1">
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
            @click="togglePinSelected(i)"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          />
          <v-circle
            v-else
            :config="pin.config"
            @click="togglePinSelected(i)"
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
import { computed, defineProps, defineEmits, ref, watch, onMounted } from "vue";
import Konva from "konva";
import pinsData from "@/../dummy.json";

const SELECTED_PINS_STORAGE_KEY = 'selected-pins';

const emit = defineEmits<{
  (e: "selectedPinsChange", selectedPins: number[]): void;
}>();

const props = defineProps<{
  configKonva: any;
  configImage: any;
  imageObj: HTMLImageElement | null;
}>();

const stageRef = ref<Konva.Stage | null>(null);

interface PinConfig {
  isSelected: boolean;
  config: Record<string, any>;
  labelConfig: Record<string, any>;
}

const pins = ref<PinConfig[]>(pinsData);

function togglePinSelected(index: number) {
  pins.value[index].isSelected = !pins.value[index].isSelected;
  const selectedIndices = pins.value
    .map((pin, idx) => (pin.isSelected ? idx : -1))
    .filter((idx) => idx !== -1);
  emit("selectedPinsChange", selectedIndices);
  
  // Save to localStorage
  localStorage.setItem(SELECTED_PINS_STORAGE_KEY, JSON.stringify(selectedIndices));
}

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
  // Load selected pins from localStorage
  const savedPins = localStorage.getItem(SELECTED_PINS_STORAGE_KEY);
  if (savedPins) {
    const selectedIndices = JSON.parse(savedPins);
    selectedIndices.forEach((index: number) => {
      if (index >= 0 && index < pins.value.length) {
        pins.value[index].isSelected = true;
      }
    });
    emit("selectedPinsChange", selectedIndices);
  }
});
</script>
