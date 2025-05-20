<template>
  <Toaster />
  <div class="flex flex-col h-screen">
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main
        ref="mainElementRef"
        class="flex-1 flex flex-col overflow-y-auto relative"
      >
        <template v-if="!showExercisesPage">
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

          <Tabs 
            :tabs="tabs"
            :active-tab="activeTab"
            @update:active-tab="setActiveTab"
            @button-refs-updated="handleButtonRefsUpdate"
          />
          <div ref="labelBarRef" class="relative h-10 border-t border-[#A1824A]">
            <template v-for="(label) in sectionLabels" :key="'label-' + index">
              <div
                class="pt-1 absolute flex items-center justify-center text-center text-sm font-medium text-[#1C170D]"
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

          <KonvaCanvas
            ref="konvaCanvasRef"
            :config-konva="configKonva"
            :config-image="configImage"
            :image-obj="imageObj"
            @selected-pins-change="handleSelectedPinsChange"
          />

          <AddExercisesButtons 
            :add-exercises-button-center-offsets="addExercisesButtonCenterOffsets" 
            @exercise-button-click="handleExerciseButtonClick"
          />
        </template>
        <ExercisesPage
          v-else
          :phase="currentPhase"
          @close="handleExercisesClose"
          @update:phase="phase => currentPhase = phase"
        />
      </main>
    </div>
    <CurrentPipelineSection
      :all-rendering-line-offsets="allRenderingLineOffsets"
      :main-content-screen-left="mainContentScreenLeft"
      :selected-pins="selectedPins"
      @unselectPinRequested="handleUnselectPin"
    />
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import CurrentPipelineSection from "./components/CurrentPipelineSection.vue";
import Tabs from "./components/Tabs.vue";
import KonvaCanvas from "./components/KonvaCanvas.vue";
import AddExercisesButtons from "./components/AddExercisesButtons.vue";
import ExercisesPage from "./components/ExercisesPage.vue";
import {
  ref,
  onMounted,
  nextTick,
  shallowRef,
  onUnmounted,
  computed,
} from "vue";
import DoubleDiamond from "./assets/DoubleDiamond.svg";
import { Toaster } from '@/components/ui/sonner'

interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number; 
}

const konvaCanvasRef = ref<InstanceType<typeof KonvaCanvas> | null>(null);

const tabs = ["Discover", "Define", "Develop", "Deliver"];
const activeTab = ref("Discover");

const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
  nextTick(() => updateLayout());
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
  x: 0,
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

const buttonRefs = {
  Discover: shallowRef<HTMLButtonElement | null>(null),
  Define: shallowRef<HTMLButtonElement | null>(null),
  Develop: shallowRef<HTMLButtonElement | null>(null),
  Deliver: shallowRef<HTMLButtonElement | null>(null),
};

const handleButtonRefsUpdate = (refs: Record<string, HTMLButtonElement | null>) => {
  buttonRefs.Discover.value = refs.Discover;
  buttonRefs.Define.value = refs.Define;
  buttonRefs.Develop.value = refs.Develop;
  buttonRefs.Deliver.value = refs.Deliver;
  nextTick(() => {
    updateLayout(); // Update layout once button refs are available
  });
};

const mainContentScreenLeft = ref(0);

const addExercisesButtonCenterOffsets = computed(() => {
  if (
    allRenderingLineOffsets.value &&
    allRenderingLineOffsets.value.length >= 8
  ) {
    // These correspond to the midpoints of the Discover, Define, Develop, and Deliver tab sections
    return [
      allRenderingLineOffsets.value[1],
      allRenderingLineOffsets.value[3],
      allRenderingLineOffsets.value[5],
      allRenderingLineOffsets.value[7],
    ];
  }
  return [];
});

const selectedPins = ref<SelectedPinInfo[]>([]);

const handleSelectedPinsChange = (pins: SelectedPinInfo[]) => {
  selectedPins.value = pins;
};

const handleUnselectPin = (originalPinIndex: number) => {
  if (konvaCanvasRef.value) {
    konvaCanvasRef.value.togglePinSelected(originalPinIndex);
  }
};

const showExercisesPage = ref(false);
const currentPhase = ref('');

const handleExerciseButtonClick = (phase: string) => {
  showExercisesPage.value = true;
  currentPhase.value = phase;
};

const handleExercisesClose = () => {
  showExercisesPage.value = false;
  currentPhase.value = '';
};

const updateLayout = () => {
  // Use the mainElement's width for the canvas
  if (mainElementRef.value) {
    const mainWidth = mainElementRef.value.clientWidth;
    configKonva.value.x = 0; // Start from the left edge
    configKonva.value.width = mainWidth; // Use full container width
    const aspectRatio = 420 / 834; // Original SVG aspect ratio
    configKonva.value.height = mainWidth * aspectRatio;

    configImage.value.width = mainWidth;
    configImage.value.height = mainWidth * aspectRatio;
    configImage.value.x = 0; // Image should also start at x=0 by default

    // Proceed to calculate overlays if other refs are available
    if (
      buttonRefs.Discover.value &&
      buttonRefs.Define.value &&
      buttonRefs.Develop.value &&
      buttonRefs.Deliver.value
    ) {
      const mainRect = mainElementRef.value.getBoundingClientRect();
      mainContentScreenLeft.value = mainRect.left;

      const discoverRect = buttonRefs.Discover.value.getBoundingClientRect();
      const defineRect = buttonRefs.Define.value.getBoundingClientRect();
      const developRect = buttonRefs.Develop.value.getBoundingClientRect();
      const deliverRect = buttonRefs.Deliver.value.getBoundingClientRect();

      const offsets: number[] = [];
      // Ensure rects are valid before calculating offsets from them
      if (discoverRect && mainRect) {
        // mainRect is implied by mainElementRef.value but good to be explicit if using its properties
        offsets.push(discoverRect.left - mainRect.left);
        offsets.push(discoverRect.right - mainRect.left);
      }
      if (defineRect && mainRect) {
        offsets.push(defineRect.right - mainRect.left);
      }
      if (developRect && mainRect) {
        offsets.push(developRect.right - mainRect.left);
      }
      if (deliverRect && mainRect) {
        offsets.push(deliverRect.right - mainRect.left);
      }
      verticalLineOffsets.value = offsets;

      if (verticalLineOffsets.value.length === 5) {
        const o = verticalLineOffsets.value;

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

        // Use the full width between the first and last rendering lines
        if (
          allRenderingLineOffsets.value &&
          allRenderingLineOffsets.value.length >= 9
        ) {
          const canvasStartX = allRenderingLineOffsets.value[0];
          const newCanvasWidth = mainWidth - canvasStartX; // Extends from first line to edge of main container

          if (newCanvasWidth > 0) {
            configKonva.value.x = canvasStartX;
            configKonva.value.width = newCanvasWidth;
            configKonva.value.height = newCanvasWidth * (420 / 834); // Konva stage height

            // ADJUST THIS FACTOR (e.g., 0.95 for 95%, 1.0 for 100%) to scale the image
            const imageWidthScaleFactor = 0.892; // Example: Image uses 98% of the Konva stage width

            configImage.value.width =
              configKonva.value.width * imageWidthScaleFactor;
            configImage.value.height = configImage.value.width * (420 / 834); // Maintain image's aspect ratio

            // Align the image to the left of the Konva stage
            configImage.value.x = 0;
            // configImage.value.y could be similarly centered if needed:
            // (configKonva.value.height - configImage.value.height) / 2;
            // It defaults to 0 if not set, which is usually fine for y.

            const labelsData: { text: string; left: number; width: number }[] =
              [];
            const sectionPoints = allRenderingLineOffsets.value;

            for (let i = 0; i < 8; i++) {
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
          } else {
            console.warn(
              "Calculated newCanvasWidth (mainWidth - canvasStartX) is not positive. " +
                "Canvas will use full mainWidth starting at x=0."
            );
            // Fallback to canvas filling the entire main element, as set at the start of updateLayout
            configKonva.value.x = 0;
            configKonva.value.width = mainWidth;
            configKonva.value.height = mainWidth * (420 / 834);
            configImage.value.width = mainWidth;
            configImage.value.height = mainWidth * (420 / 834);
            configImage.value.x = 0;
          }
        } else {
          console.warn(
            "allRenderingLineOffsets not populated sufficiently. Canvas will use mainWidth-based size or previous valid size."
          );
          // If offsets are not sufficient, the Konva/Image dimensions set earlier (from mainWidth) will remain.
        }
      } else {
        console.warn(
          "Base vertical line offsets not fully calculated (expected 5). Visual line/label rendering might be incomplete."
        );
        allRenderingLineOffsets.value = [];
        sectionLabels.value = [];
        // Konva settings already handled by user's logic if mainElementRef.value is true
      }
    } else {
      // mainElementRef.value is true, but one or more button refs are missing.
      console.warn(
        "One or more button elements (Discover, Define, Develop, Deliver) not found. Vertical lines/labels will not be rendered or will be cleared."
      );
      verticalLineOffsets.value = [];
      allRenderingLineOffsets.value = [];
      sectionLabels.value = [];
      labelBarCalculatedTop.value = 0;
      // Konva settings already handled by user's logic
    }
  } else {
    // mainElementRef.value is null. This is the original fallback logic.
    console.warn(
      "Main element not found for layout calculation. Using default dimensions for Konva and no vertical lines/labels."
    );
    verticalLineOffsets.value = [];
    allRenderingLineOffsets.value = [];
    sectionLabels.value = [];
    labelBarCalculatedTop.value = 0;
    // Clear button refs as they are not valid if main element is not found or other issues occur
    buttonRefs.Discover.value = null;
    buttonRefs.Define.value = null;
    buttonRefs.Develop.value = null;
    buttonRefs.Deliver.value = null;

    configKonva.value.x = 0;
    configKonva.value.width = 834;
    configKonva.value.height = 420;
    configImage.value.width = 834;
    configImage.value.height = 420;
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
