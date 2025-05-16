<template>
  <div class="py-6 flex-1">
    <v-stage :config="configKonva">
      <v-layer>
        <v-image :config="configImage" />
        <v-line :config="configHorizontalLine1" />
        <v-line :config="configHorizontalLine2" />
        <v-line :config="configHorizontalLine3" />
        <v-text :config="configHumanAxisLabel" />
        <v-text :config="configHumanAiAxisLabel" />
        <v-text :config="configAiAxisLabel" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

const props = defineProps<{
  configKonva: any; // Consider defining a more specific type
  configImage: any; // Consider defining a more specific type
  imageObj: HTMLImageElement | null;
}>();

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
  x: -100, // Move further left into the empty column
  y: props.configKonva.height * horizontalLineYFraction1,
  text: "human axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

const configHumanAiAxisLabel = computed(() => ({
  x: -100, // Move further left into the empty column
  y: props.configKonva.height * horizontalLineYFraction2,
  text: "human+ai axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

const configAiAxisLabel = computed(() => ({
  x: -100, // Move further left into the empty column
  y: props.configKonva.height * horizontalLineYFraction3,
  text: "ai axis",
  fontSize: 12,
  fill: "#374151",
  align: "right",
}));

</script> 