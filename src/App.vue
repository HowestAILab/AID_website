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

        <!-- Normal Layout -->
        <template v-if="!isPipelineExpanded">
          <main ref="mainElementRef" class="flex-1 flex flex-col relative">
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
              <div
                ref="labelBarRef"
                class="relative h-10 border-t border-[#A1824A] flex-shrink-0"
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
                <KonvaCanvas
                  ref="konvaCanvasRef"
                  :config-konva="configKonva"
                  :config-image="configImage"
                  :image-obj="imageObj"
                  @selected-pins-change="handleSelectedPinsChange"
                />

                <AddExercisesButtons
                  :add-exercises-button-center-offsets="
                    addExercisesButtonCenterOffsets
                  "
                  @exercise-button-click="handleExerciseButtonClick"
                  class="absolute inset-x-0 pointer-events-none"
                  style="bottom: 145px"
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
              :showBackButton="true"
              @close="handlePipelineClose"
              @open-exercise-detail="handleOpenExerciseDetail"
              class="overflow-y-auto"
            />
            <ExerciseDetail
              v-if="currentPage === 'exerciseDetail' && currentExercise"
              :exercise="currentExercise"
              @back="handleBackToPipeline"
            />
            <div
              v-else-if="currentPage === 'tools'"
              class="flex-1 flex items-center justify-center"
            >
              <p class="text-gray-500">Tools page</p>
              <!-- Todo tools page -->
            </div>
          </main>
        </template>

        <!-- Expanded Pipeline Layout -->
        <template v-else>
          <ResizablePanelGroup direction="vertical" class="flex-1">
            <ResizablePanel :default-size="70" :min-size="30" class="bg-white">
              <!-- Main content area when pipeline is expanded -->
              <main
                ref="mainElementRef"
                class="flex-1 flex flex-col relative h-full"
                :class="{ 'overflow-y-auto': currentPage === 'pipeline' }"
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
                  <div
                    ref="labelBarRef"
                    class="relative h-10 border-t border-[#A1824A] flex-shrink-0"
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
                    <KonvaCanvas
                      ref="konvaCanvasRef"
                      :config-konva="configKonva"
                      :config-image="configImage"
                      :image-obj="imageObj"
                      @selected-pins-change="handleSelectedPinsChange"
                    />

                    <AddExercisesButtons
                      :add-exercises-button-center-offsets="
                        addExercisesButtonCenterOffsets
                      "
                      @exercise-button-click="handleExerciseButtonClick"
                      class="absolute inset-x-0 pointer-events-none"
                      style="bottom: 10px"
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
                  :showBackButton="true"
                  @close="handlePipelineClose"
                  @open-exercise-detail="handleOpenExerciseDetail"
                />
                <ExerciseDetail
                  v-if="currentPage === 'exerciseDetail' && currentExercise"
                  :exercise="currentExercise"
                  @back="handleBackToPipeline"
                />
                <div
                  v-else-if="currentPage === 'tools'"
                  class="flex-1 flex items-center justify-center"
                >
                  <p class="text-gray-500">Tools page</p>
                  <!-- Todo tools page -->
                </div>
              </main>
            </ResizablePanel>
            <ResizableHandle with-handle />
            <ResizablePanel
              :default-size="30"
              :min-size="20"
              :max-size="70"
              class="bg-white relative"
            >
              <PipelinePage
                :selected-pins="selectedPins"
                :showBackButton="false"
                @open-exercise-detail="handleOpenExerciseDetail"
                class="overflow-y-auto h-full"
              />
              <div class="absolute bottom-4 right-4">
                <button
                  @click="handleCollapsePipeline"
                  class="border border-[#A1824A] p-2 rounded-xs bg-[#F5F0E5] cursor-pointer hover:bg-[#F5F0E5]/80 transition-colors"
                >
                  <ChevronDown class="w-5 h-5 text-[#A1824A]" />
                </button>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </template>
      </div>

      <!-- Current Pipeline Section (only shown when not expanded) -->
      <CurrentPipelineSection
        v-if="!isPipelineExpanded"
        :all-rendering-line-offsets="allRenderingLineOffsets"
        :main-content-screen-left="mainContentScreenLeft"
        :selected-pins="selectedPins"
        @unselectPinRequested="handleUnselectPin"
        @expandPipeline="handleExpandPipeline"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch, ref } from "vue";
import Sidebar from "./components/layout/Sidebar.vue";
import CurrentPipelineSection from "./components/pipeline/CurrentPipelineSection.vue";
import Tabs from "./components/layout/Tabs.vue";
import KonvaCanvas from "./components/diamond/KonvaCanvas.vue";
import AddExercisesButtons from "./components/diamond/AddExercisesButtons.vue";
import ExercisesPage from "./components/exercise/ExercisesPage.vue";
import OverviewPage from "./components/project/OverviewPage.vue";
import PipelinePage from "./components/pipeline/PipelinePage.vue";
import ExerciseDetail from "./components/exercise/ExerciseDetail.vue";
import LoginPage from "./components/layout/LoginPage.vue";
import { Toaster } from "@/components/ui/sonner";
import { ChevronDown } from "lucide-vue-next";
import { TABS } from "@/constants/app";

import { useAuth } from "@/composables/useAuth";
import { useNavigation } from "@/composables/useNavigation";
import { useTabs } from "@/composables/useTabs";
import { useCanvas } from "@/composables/useCanvas";
import { useLayout } from "@/composables/useLayout";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const { isLoggedIn, initializeAuth } = useAuth();

const {
  currentPage,
  currentPhase,
  currentExercise,
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

const isPipelineExpanded = ref(false);

const handleExpandPipeline = () => {
  isPipelineExpanded.value = true;
};

const handleCollapsePipeline = () => {
  isPipelineExpanded.value = false;
};

// Wrapper functions that include layout updates
const updateLayoutWithConfigs = () => {
  updateLayout(buttonRefs, configKonva, configImage);
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
