<template>
  <Toaster />
  <!-- Show login page if not authenticated -->
  <template v-if="!isLoggedIn">
    <LoginPage />
  </template>
  <!-- Show main app if authenticated -->
  <template v-else>
    <div class="flex flex-col h-screen">
      <div class="flex flex-1 overflow-hidden">
        <Sidebar @navigate="handleNavigate" :current-page="currentPage" />

        <!-- Main Layout -->
        <main ref="mainElementRef" class="flex-1 flex flex-col relative">
          <template v-if="currentPage === 'diamond'">
            <!-- Vertical Grey Lines -->
            <template
              v-for="(offset, index) in calculatedVerticalLineOffsets"
              :key="'line-' + index"
            >
              <div
                class="absolute bottom-0 bg-gray-300 w-px"
                :style="{
                  left: offset + 'px',
                  top: fullHeightLineIndices.includes(index as 0 | 2 | 4 | 6 | 8)
                    ? '0px'
                    : labelBarCalculatedTop + 'px',
                  bottom: '0px',
                }"
              ></div>
            </template>

            <Tabs
              :tabs="tabs as unknown as string[]"
              :active-tab="activeTab"
              :grid-layout="gridLayoutForTabs"
              :is-grid-mode="true"
              @update:active-tab="setActiveTab"
              @button-refs-updated="handleButtonRefsUpdate"
            />
            <div
              ref="labelBarRef"
              class="relative h-10 border-t border-primary-accent flex-shrink-0"
            >
              <template
                v-for="label in sectionLabels"
                :key="'label-' + label.text"
              >
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

            <div class="relative flex-1">
              <DiamondGrid
                ref="diamondGridRef"
                :container-width="containerWidth"
                :container-height="containerHeight"
                :image-obj="imageObj"
                @selected-pins-change="handleSelectedPinsChange"
                @layout-update="handleLayoutUpdate"
              />

              <AddExercisesButtons
                :add-exercises-button-center-offsets="
                  addExercisesButtonCenterOffsets
                "
                @exercise-button-click="handleExerciseButtonClick"
                class="absolute inset-x-0"
                style="bottom: 8%"
              />
            </div>
          </template>
          <ExercisesPage
            v-else-if="currentPage === 'exercises'"
            :phase="currentPhase"
            :selected-pins="selectedPins"
            @close="handleBackToDiamond"
            @update:phase="(phase: string) => currentPhase = phase"
            @selected-pins-change="handleSelectedPinsChange"
          />
          <OverviewPage
            v-else-if="currentPage === 'overview'"
            @navigate-to-project="handleNavigateToProject"
          />
          <PipelinePage
            v-else-if="currentPage === 'pipeline'"
            :selected-pins="selectedPins"
            @close="handleBackToDiamond"
            class="overflow-y-auto"
          />
          <ReflexionPage
            v-else-if="currentPage === 'reflexion'"
            :selected-exercises="selectedPins"
            @close="handleBackToDiamond"
          />
          <div
            v-else-if="currentPage === 'tools'"
            class="flex-1 flex items-center justify-center"
          >
            <p class="text-gray-500">Tools page</p>
            <!-- Todo tools page -->
          </div>
        </main>
      </div>

      <!-- Current Pipeline Section -->
      <CurrentPipelineSection
        :all-rendering-line-offsets="calculatedVerticalLineOffsets"
        :main-content-screen-left="mainContentScreenLeft"
        :selected-pins="selectedPins"
        @unselectPinRequested="handleUnselectPin"
        @expandPipeline="handleExpandPipeline"
        @reorderPins="handleReorderPins"
        @openExercise="handleOpenExerciseFromPipeline"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch, ref, computed } from "vue";
import Sidebar from "./components/layout/Sidebar.vue";
import CurrentPipelineSection from "./components/pipeline/CurrentPipelineSection.vue";
import Tabs from "./components/layout/Tabs.vue";
import DiamondGrid from "./components/diamond/DiamondGrid.vue";
import AddExercisesButtons from "./components/diamond/AddExercisesButtons.vue";
import ExercisesPage from "./components/exercise/ExercisesPage.vue";
import OverviewPage from "./components/project/OverviewPage.vue";
import PipelinePage from "./components/pipeline/PipelinePage.vue";
import ReflexionPage from "./components/project/ReflexionPage.vue";
import LoginPage from "./components/layout/LoginPage.vue";
import { Toaster } from "@/components/ui/sonner";
import { TABS } from "@/constants/app";

import { useAuth } from "@/composables/useAuth";
import { useNavigation } from "@/composables/useNavigation";
import { useTabs } from "@/composables/useTabs";
import { useCanvas } from "@/composables/useCanvas";
import { useLayout } from "@/composables/useLayout";
import type { SelectedPinInfo } from "@/types/exercise";

const { isLoggedIn, initializeAuth } = useAuth();

const {
  currentPage,
  currentPhase,
  handleNavigate,
  handleNavigateToProject,
  handleExerciseButtonClick,
  handleBackToDiamond,
} = useNavigation();

const {
  tabs,
  activeTab,
  buttonRefs,
  setActiveTab: setActiveTabBase,
  handleButtonRefsUpdate: handleButtonRefsUpdateBase,
} = useTabs();

const {
  containerWidth,
  containerHeight,
  imageObj,
  selectedPins,
  diamondGridRef,
  handleSelectedPinsChange,
  handleUnselectPin,
  loadImage,
  updateContainerDimensions,
} = useCanvas();

const {
  mainElementRef,
  labelBarRef,
  allRenderingLineOffsets,
  labelBarCalculatedTop,
  mainContentScreenLeft,
  fullHeightLineIndices,
  updateLayout,
  setupResizeListener,
} = useLayout();

// Layout data from DiamondGrid
const sectionLabels = ref<{ text: string; left: number; width: number }[]>([]);
const addExercisesButtonCenterOffsets = ref<number[]>([]);
const svgBounds = ref({ left: 0, top: 0, width: 0, height: 0 });

// Calculate vertical line offsets based on section labels
const calculatedVerticalLineOffsets = computed(() => {
  if (sectionLabels.value.length === 0) return [];
  
  const offsets: number[] = [];
  
  // Add vertical lines at section boundaries
  for (let i = 0; i < sectionLabels.value.length; i++) {
    const section = sectionLabels.value[i];
    if (i === 0) {
      offsets.push(section.left); // First line at start
    }
    offsets.push(section.left + section.width); // Line at end of each section
  }
  
  return offsets;
});

// Compute grid layout data for tabs
const gridLayoutForTabs = computed(() => {
  if (sectionLabels.value.length === 0 || !svgBounds.value.width) return null;
  
  return {
    sectionLabels: sectionLabels.value,
    svgBounds: svgBounds.value,
  };
});

const handleExpandPipeline = () => {
  // Pipeline expansion is now handled by CurrentPipelineSection
};

// Handle reordering of pins in the pipeline
const handleReorderPins = (fromIndex: number, toIndex: number) => {
  const updatedPins = [...selectedPins.value];
  const [movedPin] = updatedPins.splice(fromIndex, 1);
  updatedPins.splice(toIndex, 0, movedPin);
  
  handleSelectedPinsChange(updatedPins);
};

// Handle opening exercise from pipeline
const handleOpenExerciseFromPipeline = (exercise: SelectedPinInfo, index: number) => {
  // Navigate to pipeline page and open the exercise
  handleNavigate('pipeline');
  // The PipelinePage will handle opening the specific exercise
};

// Handle layout updates from DiamondGrid
const handleLayoutUpdate = (layout: {
  sectionLabels: { text: string; left: number; width: number }[];
  addExercisesButtonCenterOffsets: number[];
  svgBounds: { left: number; top: number; width: number; height: number };
}) => {
  sectionLabels.value = layout.sectionLabels;
  addExercisesButtonCenterOffsets.value = layout.addExercisesButtonCenterOffsets;
  svgBounds.value = layout.svgBounds;
};

// Wrapper functions that include layout updates
const updateLayoutWithConfigs = () => {
  updateLayout(buttonRefs);
  
  // Calculate actual available dimensions from the main element
  if (mainElementRef.value) {
    const mainWidth = mainElementRef.value.clientWidth;
    const mainHeight = mainElementRef.value.clientHeight;
    
    // Account for the tabs height (approximately 40px) and label bar (40px)
    const availableHeight = mainHeight - 80;
    
    updateContainerDimensions(mainWidth, Math.max(availableHeight, 400));
  } else {
    // Fallback to default dimensions
    updateContainerDimensions(containerWidth.value, containerHeight.value);
  }
};

const setActiveTab = (tabName: string) => {
  if (TABS.includes(tabName as any)) {
    setActiveTabBase(tabName as (typeof TABS)[number], updateLayoutWithConfigs);
  }
};

const handleButtonRefsUpdate = (
  refs: Record<string, HTMLButtonElement | null>
) => {
  handleButtonRefsUpdateBase(refs, updateLayoutWithConfigs);
};

// Setup resize listener
setupResizeListener(updateLayoutWithConfigs);

// Watch for authentication state changes
watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    loadImage().then(() => {
      nextTick(() => {
        updateLayoutWithConfigs();
      });
    });
  }
});

onMounted(() => {
  initializeAuth();

  // Load image and setup initial layout only if authenticated
  if (isLoggedIn.value) {
    loadImage().then(() => {
      nextTick(() => {
        updateLayoutWithConfigs();
      });
    });
  }
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
