<template>
  <div class="flex flex-col h-screen">
    <Header />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main
        ref="mainElementRef"
        class="flex-1 flex flex-col overflow-y-auto relative"
      >
        <!-- Vertical Grey Lines -->
        <template
          v-for="(offset, index) in allRenderingLineOffsets"
          :key="'line-' + index"
        >
          <div
            class="absolute bottom-0 bg-gray-300 w-px"
            :style="{
              left: offset + 'px',
              top: fullHeightLineIndices.includes(index)
                ? '0px'
                : labelBarCalculatedTop + 'px',
              bottom: '0px',
            }"
          ></div>
        </template>

        <div class="border-b border-[#A1824A]">
          <nav class="flex -mb-px" aria-label="Tabs">
            <div class="flex-1"></div>
            <button
              v-for="tab in tabs"
              :key="tab"
              :ref="(el) => assignButtonRef(el, tab)"
              @click="setActiveTab(tab)"
              :class="[
                'grow-2',
                'shrink',
                'basis-0',
                'py-4',
                'px-1',
                'text-center',
                'text-sm',
                'font-bold',
                'focus:outline-none',
                activeTab === tab
                  ? ['border-b-2', 'border-b-[#A1824A]', 'text-[#A1824A]', '']
                  : ['border-b', 'border-b-[#A1824A]', '', 'text-[#1C170D]'],
              ]"
            >
              {{ tab }}
            </button>
            <div class="flex-1"></div>
          </nav>
        </div>
        <div ref="labelBarRef" class="relative h-10 border-t border-[#A1824A]">
          <template v-for="label in sectionLabels" :key="'label-' + index">
            <div
              class="absolute flex items-center justify-center text-center text-sm font-medium text-[#1C170D]"
              :style="{
                left: label.left + 'px',
                width: label.width + 'px',
                top: '0',
                height: '100%',
              }"
            >
              <span>{{ label.text }}</span>
            </div>
          </template>
        </div>

        <div class="py-6">
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
      </main>
    </div>
    <CurrentPipelineSection />
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import CurrentPipelineSection from "./components/CurrentPipelineSection.vue";
import {
  ref,
  onMounted,
  nextTick,
  shallowRef,
  onUnmounted,
  computed,
} from "vue";
import DoubleDiamond from "./assets/DoubleDiamond.svg";

const tabs = ["Discover", "Define", "Develop", "Deliver"];
const activeTab = ref("Discover");

const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
};

const configKonva = ref({
  width: 834,
  height: 420,
  x: 0,
  y: 0,
});

const imageObj = ref<HTMLImageElement | null>(null);
const configImage = ref({
  image: null as HTMLImageElement | null,
  width: 834,
  height: 420,
});

const mainElementRef = shallowRef<HTMLElement | null>(null);
const verticalLineOffsets = ref<number[]>([]);
const allRenderingLineOffsets = ref<number[]>([]);
const sectionLabels = ref<{ text: string; left: number; width: number }[]>([]);
const sectionLabelTexts = [
  "prepare",
  "discover",
  "define",
  "synthesise",
  "prepare",
  "develop",
  "deliver",
  "synthesise",
];
const labelBarRef = shallowRef<HTMLElement | null>(null);
const labelBarCalculatedTop = ref<number>(0);
const fullHeightLineIndices = [0, 2, 4, 6, 8];

const discoverButtonRef = shallowRef<HTMLButtonElement | null>(null);
const defineButtonRef = shallowRef<HTMLButtonElement | null>(null);
const developButtonRef = shallowRef<HTMLButtonElement | null>(null);
const deliverButtonRef = shallowRef<HTMLButtonElement | null>(null);

const horizontalLineYFraction1 = 1 / 4;
const horizontalLineYFraction2 = 1 / 2;
const horizontalLineYFraction3 = 3 / 4;

const configHorizontalLine1 = computed(() => ({
  points: [
    0,
    configKonva.value.height * horizontalLineYFraction1,
    configKonva.value.width,
    configKonva.value.height * horizontalLineYFraction1,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHorizontalLine2 = computed(() => ({
  points: [
    0,
    configKonva.value.height * horizontalLineYFraction2,
    configKonva.value.width,
    configKonva.value.height * horizontalLineYFraction2,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHorizontalLine3 = computed(() => ({
  points: [
    0,
    configKonva.value.height * horizontalLineYFraction3,
    configKonva.value.width,
    configKonva.value.height * horizontalLineYFraction3,
  ],
  stroke: "#D1D5DB",
  strokeWidth: 1,
}));

const configHumanAxisLabel = computed(() => ({
  x: 10,
  y: configKonva.value.height * horizontalLineYFraction1 - 15,
  text: "human axis",
  fontSize: 12,
  fill: "#374151",
}));

const configHumanAiAxisLabel = computed(() => ({
  x: 10,
  y: configKonva.value.height * horizontalLineYFraction2 - 15,
  text: "human+ai axis",
  fontSize: 12,
  fill: "#374151",
}));

const configAiAxisLabel = computed(() => ({
  x: 10,
  y: configKonva.value.height * horizontalLineYFraction3 - 15,
  text: "ai axis",
  fontSize: 12,
  fill: "#374151",
}));

const updateLayout = () => {
  if (
    mainElementRef.value &&
    discoverButtonRef.value &&
    defineButtonRef.value &&
    developButtonRef.value &&
    deliverButtonRef.value
  ) {
    const mainRect = mainElementRef.value.getBoundingClientRect();
    const discoverRect = discoverButtonRef.value.getBoundingClientRect();
    const defineRect = defineButtonRef.value.getBoundingClientRect();
    const developRect = developButtonRef.value.getBoundingClientRect();
    const deliverRect = deliverButtonRef.value.getBoundingClientRect();

    const offsets: number[] = [];
    if (mainRect && discoverRect) {
      offsets.push(discoverRect.left - mainRect.left); // Line 1: Left of Discover
      offsets.push(discoverRect.right - mainRect.left); // Line 2: Right of Discover / Left of Define
    }
    if (mainRect && defineRect) {
      offsets.push(defineRect.right - mainRect.left); // Line 3: Right of Define / Left of Develop
    }
    if (mainRect && developRect) {
      offsets.push(developRect.right - mainRect.left); // Line 4: Right of Develop / Left of Deliver
    }
    if (mainRect && deliverRect) {
      offsets.push(deliverRect.right - mainRect.left); // Line 5: Right of Deliver
    }
    verticalLineOffsets.value = offsets; // These are the 5 key tab boundary offsets

    if (verticalLineOffsets.value.length === 5) {
      const o = verticalLineOffsets.value; // o[0] to o[4]

      const m: number[] = [];
      m[0] = (o[0] + o[1]) / 2;
      m[1] = (o[1] + o[2]) / 2;
      m[2] = (o[2] + o[3]) / 2;
      m[3] = (o[3] + o[4]) / 2;

      allRenderingLineOffsets.value = [
        o[0],
        m[0],
        o[1],
        m[1],
        o[2],
        m[2],
        o[3],
        m[3],
        o[4],
      ];

      const labelsData: { text: string; left: number; width: number }[] = [];
      const sectionPoints = allRenderingLineOffsets.value;

      for (let i = 0; i < 8; i++) {
        // 8 sections
        const sectionStart = sectionPoints[i];
        const sectionEnd = sectionPoints[i + 1];
        labelsData.push({
          text: sectionLabelTexts[i],
          left: sectionStart,
          width: sectionEnd - sectionStart,
        });
      }
      sectionLabels.value = labelsData;

      if (labelBarRef.value) {
        labelBarCalculatedTop.value = labelBarRef.value.offsetTop;
      }

      const konvaTargetX = verticalLineOffsets.value[0];
      const konvaTargetWidth =
        verticalLineOffsets.value[4] - verticalLineOffsets.value[0];

      if (konvaTargetWidth > 0) {
        configKonva.value.x = konvaTargetX;
        configKonva.value.width = konvaTargetWidth;
        const aspectRatio = 420 / 834; // Original SVG aspect ratio
        configKonva.value.height = konvaTargetWidth * aspectRatio;

        configImage.value.width = konvaTargetWidth;
        configImage.value.height = konvaTargetWidth * aspectRatio;
      } else {
        console.warn(
          "Calculated width for Konva canvas is not positive. Using default dimensions and position."
        );
        configKonva.value.x = 0;
        configKonva.value.width = 834;
        configKonva.value.height = 420;
        configImage.value.width = 834;
        configImage.value.height = 420;
      }
    } else {
      console.warn(
        "Base vertical line offsets not fully calculated (need 5). Konva stage position and size might be based on incomplete data or fallbacks."
      );
      allRenderingLineOffsets.value = [];
      sectionLabels.value = [];
      // This part is complex and depends on which rects are available.
      const fallbackWidth =
        deliverButtonRef.value &&
        discoverButtonRef.value &&
        deliverRect &&
        discoverRect
          ? deliverRect.right - discoverRect.left
          : 0;
      if (fallbackWidth > 0) {
        configKonva.value.width = fallbackWidth;
        const aspectRatio = 420 / 834;
        configKonva.value.height = fallbackWidth * aspectRatio;
        configImage.value.width = fallbackWidth;
        configImage.value.height = fallbackWidth * aspectRatio;
      } else {
        // If even fallbackWidth cannot be calculated, use defaults for Konva
        configKonva.value.x = 0;
        configKonva.value.width = 834;
        configKonva.value.height = 420;
        configImage.value.width = 834;
        configImage.value.height = 420;
      }
    }
  } else {
    console.warn(
      "One or more critical elements (Main element, or any of Discover, Define, Develop, Deliver buttons) not found for layout calculation. Using default dimensions for Konva and no vertical lines/labels."
    );
    verticalLineOffsets.value = []; // Clear original offsets
    allRenderingLineOffsets.value = []; // Clear rendering lines
    sectionLabels.value = []; // Clear labels
    labelBarCalculatedTop.value = 0; // Reset top offset if layout fails

    configKonva.value.x = 0;
    configKonva.value.width = 834;
    configKonva.value.height = 420;
    configImage.value.width = 834;
    configImage.value.height = 420;
  }
};

const assignButtonRef = (el: any, tabName: string) => {
  if (tabName === "Discover") {
    discoverButtonRef.value = el as HTMLButtonElement;
  } else if (tabName === "Define") {
    defineButtonRef.value = el as HTMLButtonElement;
  } else if (tabName === "Develop") {
    developButtonRef.value = el as HTMLButtonElement;
  } else if (tabName === "Deliver") {
    deliverButtonRef.value = el as HTMLButtonElement;
  }
};

onMounted(() => {
  const img = new Image();
  img.src = DoubleDiamond;
  img.onload = () => {
    imageObj.value = img;
    configImage.value.image = img;

    nextTick(() => {
      updateLayout();
    });
  };
  window.addEventListener("resize", updateLayout);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateLayout);
});
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
