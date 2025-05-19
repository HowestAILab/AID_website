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

const pins = ref<PinConfig[]>([
  {
    isSelected: false,
    config: {
      x: 200,
      y: 200,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 220,
      y: 190,
      text: "Interviews",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 320,
      y: 180,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 340,
      y: 170,
      text: "Brainstorm",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 120,
      y: 330,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 140,
      y: 320,
      text: "Insight Scraping",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 760,
      y: 400,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 780,
      y: 390,
      text: "Automated Research",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 500,
      y: 220,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 520,
      y: 210,
      text: "Data Analysis",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 650,
      y: 250,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 670,
      y: 240,
      text: "Data Synthesis",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 880,
      y: 150,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 900,
      y: 140,
      text: "Data Visualization",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 400,
      y: 550,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 420,
      y: 540,
      text: "Synthetic Personas",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 900,
      y: 600,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 920,
      y: 590,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 150,
      y: 680,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 170,
      y: 670,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 550,
      y: 300,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 570,
      y: 290,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 690,
      y: 500,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 710,
      y: 490,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 700,
      y: 350,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 720,
      y: 340,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 250,
      y: 200,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 270,
      y: 190,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 100,
      y: 50,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 120,
      y: 40,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 950,
      y: 50,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 970,
      y: 40,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 50,
      y: 290,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 70,
      y: 280,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
  {
    isSelected: false,
    config: {
      x: 950,
      y: 100,
      radius: 12,
      fill: "#F5F0E5",
      stroke: "black",
      strokeWidth: 1,
    },
    labelConfig: {
      x: 970,
      y: 90,
      text: "Placeholder",
      fontSize: 14,
      fill: "#374151",
    },
  },
]);

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
