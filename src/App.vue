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
        <main
          ref="mainElementRef"
          class="flex-1 flex flex-col overflow-y-auto relative"
        >
          <template v-if="currentPage === 'diamond'">
            <!-- Vertical Grey Lines -->
            <template
              v-for="(offset, index) in allRenderingLineOffsets"
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
              @update:active-tab="setActiveTab"
              @button-refs-updated="handleButtonRefsUpdate"
            />
            <div ref="labelBarRef" class="relative h-10 border-t border-[#A1824A]">
              <template v-for="(label) in sectionLabels" :key="'label-' + label.text">
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
                class="absolute inset-x-0 pointer-events-none"
                style="bottom: 145px;"
              />
            </div>
          </template>
          <ExercisesPage
            v-else-if="currentPage === 'exercises'"
            :phase="currentPhase"
            :selected-pins="selectedPins"
            @close="handleExercisesClose"
            @update:phase="(phase: string) => currentPhase = phase"
            @selected-pins-change="handleSelectedPinsChange"
            @open-exercise-detail="handleOpenExerciseDetail"
          />
          <OverviewPage
            v-else-if="currentPage === 'overview'"
            @navigate-to-project="handleNavigateToProject"
          />
          <PipelinePage
            v-else-if="currentPage === 'pipeline'"
            :selected-pins="selectedPins"
            @close="handlePipelineClose"
            @open-exercise-detail="handleOpenExerciseDetail"
          />
          <ExerciseDetail 
            v-else-if="currentPage === 'exerciseDetail'"
            :exercise-title="currentExerciseTitle" 
            @back="handleBackToPipeline" 
          />
          <div v-else-if="currentPage === 'tools'" class="flex-1 flex items-center justify-center">
            <p class="text-gray-500">Tools page</p> <!-- Todo tools page -->
          </div>
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
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch } from "vue";
import Sidebar from "./components/Sidebar.vue";
import CurrentPipelineSection from "./components/CurrentPipelineSection.vue";
import Tabs from "./components/Tabs.vue";
import KonvaCanvas from "./components/KonvaCanvas.vue";
import AddExercisesButtons from "./components/AddExercisesButtons.vue";
import ExercisesPage from "./components/ExercisesPage.vue";
import OverviewPage from "./components/OverviewPage.vue";
import PipelinePage from "./components/PipelinePage.vue";
import ExerciseDetail from "./components/ExerciseDetail.vue";
import LoginPage from "./components/LoginPage.vue";
import { Toaster } from '@/components/ui/sonner';
import { TABS } from "@/constants/app";

import { useAuth } from "@/composables/useAuth";
import { useNavigation } from "@/composables/useNavigation";
import { useTabs } from "@/composables/useTabs";
import { useCanvas } from "@/composables/useCanvas";
import { useLayout } from "@/composables/useLayout";

const { isLoggedIn, initializeAuth } = useAuth();

const {
  currentPage,
  currentPhase,
  currentExerciseTitle,
  handleNavigate,
  handleNavigateToProject,
  handleExerciseButtonClick,
  handleExercisesClose,
  handlePipelineClose,
  handleOpenExerciseDetail,
  handleBackToPipeline,
} = useNavigation();

const {
  tabs,
  activeTab,
  buttonRefs,
  setActiveTab: setActiveTabBase,
  handleButtonRefsUpdate: handleButtonRefsUpdateBase,
} = useTabs();

const {
  configKonva,
  imageObj,
  configImage,
  selectedPins,
  konvaCanvasRef,
  handleSelectedPinsChange,
  handleUnselectPin,
  loadImage,
} = useCanvas();

const {
  mainElementRef,
  labelBarRef,
  allRenderingLineOffsets,
  sectionLabels,
  labelBarCalculatedTop,
  mainContentScreenLeft,
  addExercisesButtonCenterOffsets,
  fullHeightLineIndices,
  updateLayout,
  setupResizeListener,
} = useLayout();

// Wrapper functions that include layout updates
const updateLayoutWithConfigs = () => {
  updateLayout(buttonRefs, configKonva, configImage);
};

const setActiveTab = (tabName: string) => {
  if (TABS.includes(tabName as any)) {
    setActiveTabBase(tabName as typeof TABS[number], updateLayoutWithConfigs);
  }
};

const handleButtonRefsUpdate = (refs: Record<string, HTMLButtonElement | null>) => {
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
