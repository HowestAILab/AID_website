<!--
  CurrentPipelineSection Component
  
  This component displays the current pipeline exercises with phase-aware organization and restrictions:
  - Exercises are visually grouped by phase (Discover, Define, Develop, Deliver)
  - Each phase has a distinct color for easy identification
  - Drag and drop reordering is only allowed within the same phase
  - Visual feedback shows valid/invalid drop targets during dragging
  - Phase order is enforced: Discover → Define → Develop → Deliver
-->
<template>
  <!-- Collapsed State -->
  <div
    v-if="!isExpanded"
    class="border-t border-gray-200 bg-white px-4 py-3 h-20 flex items-center relative"
  >
    <div class="flex items-center mr-10">
      <Network class="w-5 h-5 mr-3" />
      <p>Current Pipeline</p>
    </div>

    <!-- Phase restriction message -->
    <div
      v-if="phaseRestrictionMessage"
      class="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm mr-4"
    >
      {{ phaseRestrictionMessage }}
    </div>

    <div class="flex-grow relative flex items-center">
      <div class="h-px bg-gray-400 w-full absolute"></div>
      <div class="flex items-center w-full px-4 relative z-10">
        <!-- Add button for the start -->
        <div
          class="relative flex-shrink-0 items-center justify-center h-7 w-2 group transition-all duration-200 ease-in-out hover:w-6"
        >
          <button
            @click.stop="$emit('addCustomEthics', 0)"
            class="bg-purple-200 text-purple-700 rounded-full flex items-center justify-center w-5 h-5 shadow-sm transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>

        <template v-for="(item, index) in renderablePipeline" :key="index">
          <!-- Phase Block -->
          <div v-if="!item.isEthics" class="flex items-center gap-3 p-2 rounded-lg transition-all duration-200" :class="{
            'bg-gray-50 border-2 border-dashed border-gray-300':
              isDragging &&
              item.exercises && item.exercises.length > 0 &&
              draggedIndex !== null &&
              item.phase === selectedPins[draggedIndex]?.location.phase,
            'opacity-30':
              isDragging &&
              item.exercises && item.exercises.length > 0 &&
              draggedIndex !== null &&
              item.phase !== selectedPins[draggedIndex]?.location.phase,
          }">
            <!-- Phase label with colored background - positioned in front -->
            <div
              class="text-xs font-semibold px-3 py-1 rounded-full border-2 bg-white"
              :class="getPhaseColor(item.phase || '')"
            >
              {{ item.phase }}
            </div>

            <!-- Exercises within this phase -->
            <div v-if="item.exercises" class="flex gap-2 items-center">
              <!-- Loop through exercises and place an add button BEFORE each one -->
              <template v-for="exercise in item.exercises" :key="exercise.isEthicsExercise ? exercise.ethicsExerciseData!.id : exercise.originalIndex">
                <div class="relative group h-7 flex items-center">
                  <button
                    @click.stop="$emit('addCustomEthics', findExerciseIndexInPipeline(exercise))"
                    class="w-5 h-5 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-200 shadow-sm z-10"
                    title="Add Ethics Reflection">
                    <Plus class="w-3 h-3" />
                  </button>
                </div>
                <!-- Exercise rendering (div with v-if/v-else for ethics/regular) -->
                <div draggable="true"
                  @dragstart="handleDragStart($event, findExerciseIndexInPipeline(exercise))"
                  @dragend="handleDragEnd" @dragover.prevent
                  @drop="handleDrop($event, findExerciseIndexInPipeline(exercise))"
                  @dragenter.prevent="handleDragEnter(findExerciseIndexInPipeline(exercise))"
                  @dragleave="handleDragLeave"
                  class="relative group"
                  :class="{
                    'opacity-50': draggedIndex === findExerciseIndexInPipeline(exercise),
                    'cursor-move': !isDragging,
                  }">
                  <!-- Purple circle for ethics exercises -->
                  <div
                    v-if="exercise.isEthicsExercise"
                    class="w-7 h-7 bg-purple-500 border-2 border-purple-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer"
                    :class="{
                      'scale-110 shadow-md':
                        dragOverIndex ===
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ),
                      'bg-purple-200 border-purple-500':
                        dragOverIndex ===
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ),
                      'bg-purple-600 border-purple-800 ring-2 ring-purple-500/50':
                        currentActiveExercise?.originalIndex ===
                        exercise.originalIndex,
                      'opacity-30':
                        draggedIndex !== null &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        !canDropAtIndex(
                          draggedIndex,
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          )
                        ),
                      'hover:bg-purple-400 hover:border-purple-600': !isDragging,
                    }"
                    @click="handleExerciseClick(exercise, $event)"
                    @mousedown="handleMouseDown"
                  >
                    <Shield
                      class="w-4 h-4 text-white pointer-events-none"
                    />
                  </div>
                  <!-- Diamond shape for regular exercises -->
                  <div
                    v-else
                    class="w-7 h-7 bg-light border-2 border-gray-700 transform rotate-45 flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer"
                    :class="{
                      'scale-110 shadow-md':
                        dragOverIndex ===
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ),
                      'bg-primary-accent/20 border-primary-accent':
                        dragOverIndex ===
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ),
                      'bg-primary-accent border-primary-accent ring-2 ring-primary-accent/50':
                        currentActiveExercise?.originalIndex ===
                        exercise.originalIndex,
                      'opacity-30':
                        draggedIndex !== null &&
                        draggedIndex !==
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          ) &&
                        !canDropAtIndex(
                          draggedIndex,
                          selectedPins.findIndex(
                            (p) => p.originalIndex === exercise.originalIndex
                          )
                        ),
                      'hover:bg-primary-accent/10 hover:border-primary-accent/60': !isDragging,
                    }"
                    @click="handleExerciseClick(exercise, $event)"
                    @mousedown="handleMouseDown"
                  >
                    <span
                      class="text-xs transform -rotate-45 font-bold pointer-events-none"
                      :class="
                        currentActiveExercise?.originalIndex ===
                        exercise.originalIndex
                          ? 'text-white'
                          : 'text-gray-800'
                      "
                    >
                      {{ exercise.originalIndex + 1 }}
                    </span>
                  </div>
                  <!-- Show remove button only for regular exercises or CUSTOM ethics exercises -->
                  <button
                    v-if="!exercise.isEthicsExercise || exercise.ethicsExerciseData?.type === 'custom'"
                    @click.stop="$emit('unselectPinRequested', exercise.isEthicsExercise ? exercise.ethicsExerciseData!.id : exercise.originalIndex, exercise.isEthicsExercise || false)"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm z-10"
                    :class="{ 'pointer-events-none': isDragging }">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </template>
            </div>
          </div>
          <!-- Ethics Dot -->
          <div v-else class="relative group flex items-center gap-3 p-2 rounded-lg">
            <div
              class="w-7 h-7 bg-purple-600 border-2 border-purple-800 rounded-full flex items-center justify-center cursor-pointer"
              @click="item.exercise && handleExerciseClick(item.exercise, $event)"
              @mousedown="handleMouseDown"
            >
              <Shield class="w-4 h-4 text-white" />
            </div>
            <!-- Remove button for CUSTOM ethics exercises -->
            <button
              v-if="item.exercise?.ethicsExerciseData?.type === 'custom'"
              @click.stop="$emit('unselectPinRequested', item.exercise!.ethicsExerciseData!.id, true)"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm z-10"
              :class="{ 'pointer-events-none': isDragging }"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
          <!-- Separator with Add button -->
          <div
            class="relative flex-shrink-0 items-center justify-center h-7 w-2 group transition-all duration-200 ease-in-out hover:w-6"
          >
            <button
              @click.stop="$emit('addCustomEthics', getPinInsertionIndex(index))"
              class="bg-purple-200 text-purple-700 rounded-full flex items-center justify-center w-5 h-5 shadow-sm transition-opacity duration-200 opacity-0 group-hover:opacity-100"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>
        </template>

        <div
          v-if="selectedPins.length === 0"
          class="flex items-center justify-center w-full text-on-light-accent/60 text-sm"
        >
          No exercises added to pipeline
        </div>
      </div>
    </div>
    <button
      @click="handleExpand"
      class="border border-on-light-accent p-2 ml-20 rounded-sm bg-white cursor-pointer hover:bg-light transition-colors shadow-sm"
    >
      <ChevronUp class="w-5 h-5 text-on-light-accent" />
    </button>
  </div>

  <!-- Expanded State -->
  <div v-else class="border-t border-gray-200 bg-white flex flex-col h-96">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-3">
        <Network class="w-5 h-5 text-primary-accent" />
        <h1 class="text-lg font-medium text-on-light-default">
          Pipeline Overview
        </h1>
        <div
          class="bg-primary-accent/10 text-primary-accent px-2 py-1 rounded-sm text-sm font-medium border border-primary-accent/20"
        >
          {{ overallProgress }}% Complete
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="currentExercise && selectedPins.length > 0"
          @click="openCurrentExercise"
          class="bg-primary-accent hover:bg-primary-accent/90 text-white border-0"
        >
          <Play class="w-4 h-4 mr-2" />
          Continue Current Exercise
        </Button>
        <button
          @click="handleCollapse"
          class="border border-on-light-accent p-2 rounded-sm bg-white cursor-pointer hover:bg-light transition-colors shadow-sm"
        >
          <ChevronDown class="w-5 h-5 text-on-light-accent" />
        </button>
      </div>
    </div>

    <!-- Pipeline Overview Content -->
    <div class="flex-1 p-4 overflow-y-auto min-h-0">
      <!-- Horizontal scroll layout for compact view -->
      <div
        v-if="selectedPins.length > 0"
        class="flex gap-4 overflow-x-auto pb-4"
        style="scroll-behavior: smooth"
      >
        <div
          v-for="(exercise, index) in chronologicallyOrderedPins"
          :key="exercise.originalIndex"
          class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex-shrink-0 w-80 min-w-0"
          :class="getCardStateClasses(exercise)"
          @click="openExercise(exercise, index)"
        >
          <!-- Exercise Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Exercise Number / Ethics Icon -->
              <div
                v-if="exercise.isEthicsExercise"
                class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              >
                <Shield class="w-4 h-4" />
              </div>
              <div
                v-else
                class="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              >
                {{ exercise.originalIndex + 1 }}
              </div>

              <div class="min-w-0">
                <h3 class="font-medium text-on-light-default text-sm truncate">
                  {{ exercise.name }}
                </h3>
                <!-- Phase and Step info -->
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs text-on-light-accent truncate">
                    {{ exercise.location.phase }} • {{ exercise.location.step }}
                  </p>
                  <div
                    :class="
                      getHumanAiScaleStyle(exercise.location.human_ai_scale)
                    "
                    class="text-xs px-1.5 py-0.5 rounded-sm font-medium"
                  >
                    {{ getHumanAiScaleText(exercise.location.human_ai_scale) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Icon -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <CheckCircle2
                v-if="isExerciseCompleted(exercise.name)"
                class="w-5 h-5 text-green-600"
              />
              <Clock
                v-else-if="isCurrentExercise(exercise)"
                class="w-5 h-5 text-primary-accent"
              />
              <Circle v-else class="w-5 h-5 text-on-light-accent/40" />
            </div>
          </div>

          <!-- Exercise Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">
            {{ exercise.description }}
          </p>

          <!-- Progress Indicators -->
          <div class="space-y-2 mb-4">
            <!-- Ethics Status -->
            <div
              v-if="exerciseHasEthics(exercise)"
              class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
              @click.stop="handleEthicsClick(exercise)"
            >
              <Shield class="w-3 h-3 flex-shrink-0 text-purple-600" />
              <span class="text-on-light-accent">Ethics:</span>
              <span
                :class="
                  exerciseEthicsCompleted(exercise)
                    ? 'text-green-600'
                    : 'text-primary-accent'
                "
              >
                {{
                  exerciseEthicsCompleted(exercise) ? "Completed" : "Pending"
                }}
              </span>
            </div>

            <!-- Chat History -->
            <div class="flex items-center gap-2 text-xs">
              <MessageSquare
                class="w-3 h-3 flex-shrink-0 text-on-light-accent"
              />
              <span class="text-on-light-accent">Chat:</span>
              <span class="text-on-light-accent/70">
                {{ getChatHistoryCount(exercise.name) }} user messages
              </span>
            </div>

            <!-- Completion Status -->
            <div class="flex items-center gap-2 text-xs">
              <Target class="w-3 h-3 flex-shrink-0 text-on-light-accent" />
              <span class="text-on-light-accent">Status:</span>
              <span
                :class="
                  isExerciseCompleted(exercise.name)
                    ? 'text-green-600 font-medium'
                    : 'text-on-light-accent/70'
                "
              >
                {{
                  isExerciseCompleted(exercise.name)
                    ? "Completed"
                    : "Not Started"
                }}
              </span>
            </div>
          </div>

          <!-- Completion Date -->
          <div
            v-if="
              isExerciseCompleted(exercise.name) &&
              formatCompletionDate(exercise.name)
            "
            class="mt-3 pt-3 border-t border-on-light-accent/20"
          >
            <p class="text-xs text-on-light-accent/70">
              Completed {{ formatCompletionDate(exercise.name) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex-shrink-0 w-full border-2 border-dashed border-on-light-accent/30 rounded-lg p-8 flex flex-col items-center justify-center text-center"
      >
        <Plus class="w-8 h-8 text-on-light-accent/40 mb-2" />
        <p class="text-on-light-accent font-medium mb-1">
          No exercises in pipeline
        </p>
        <p class="text-sm text-on-light-accent/70">
          Add exercises from the diamond to get started
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Network,
  ChevronUp,
  ChevronDown,
  X,
  Play,
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  MessageSquare,
  Target,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { usePipeline } from "@/composables/usePipeline";
import { useExercises } from "@/composables/useExercises";
import { useExerciseChat } from "@/composables/useExerciseChat";
import { useEthics } from "@/composables/useEthics";
import { usePipelineNavigation } from "@/composables/usePipelineNavigation";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  allRenderingLineOffsets?: any;
  mainContentScreenLeft?: number;
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "unselectPinRequested", id: number | string, isEthics: boolean): void;
  (e: "expandPipeline"): void;
  (e: "reorderPins", fromIndex: number, toIndex: number): void;
  (e: "openExercise", exercise: SelectedPinInfo, index: number): void;
  (e: "addCustomEthics", index: number): void;
}>();

// Composables
const {
  calculatePipelineProgress,
  getCurrentExercise,
  isExerciseCompleted,
  getExerciseProgress,
} = usePipelineProgress();
const { getChatStats } = useExerciseChat();
const ethics = useEthics();
const { getCurrentActiveExercise } = usePipelineNavigation();

const { allStaticExercises } = useExercises();
const { canDropAtIndex, getExercisesByPhase } = usePipeline(
  props,
  allStaticExercises,
  (selectedPins: any) => {
    emit("reorderPins", 0, 0); // This won't be used directly since we handle reordering here
  }
);

// State
const isExpanded = ref(false);
const phaseRestrictionMessage = ref<string | null>(null);

// Drag and drop state
const isDragging = ref(false);
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// Click detection state
const mouseDownTime = ref<number>(0);
const mouseDownPosition = ref<{ x: number; y: number } | null>(null);
const CLICK_THRESHOLD_TIME = 200; // ms
const CLICK_THRESHOLD_DISTANCE = 5; // pixels

// Computed properties
const overallProgress = computed(() =>
  calculatePipelineProgress(props.selectedPins)
);
const currentExercise = computed(() => getCurrentExercise(props.selectedPins));
const exercisesByPhase = computed(() => getExercisesByPhase());
const currentActiveExercise = computed(() => getCurrentActiveExercise());

// Sort exercises in timeline order (following phase sequence but respecting user ordering within phases)
const chronologicallyOrderedPins = computed(() => {
  const phaseOrder = ["Discover", "Define", "Develop", "Deliver"];

  // Group exercises by phase while preserving their order within each phase
  const exercisesByPhase: Record<string, SelectedPinInfo[]> = {};

  // Initialize phase groups
  phaseOrder.forEach((phase) => {
    exercisesByPhase[phase] = [];
  });

  // Group exercises by phase in the order they appear in selectedPins
  props.selectedPins.forEach((exercise) => {
    const phase = exercise.location.phase;
    if (exercisesByPhase[phase]) {
      exercisesByPhase[phase].push(exercise);
    }
  });

  // Combine phases in correct order, preserving user order within each phase
  const result: SelectedPinInfo[] = [];
  phaseOrder.forEach((phase) => {
    result.push(...exercisesByPhase[phase]);
  });

  return result;
});

// Phase colors for visual distinction
const getPhaseColor = (phase: string) => {
  const colors: Record<string, string> = {
    Discover: "bg-blue-100 border-blue-400 text-blue-800",
    Define: "bg-green-100 border-green-400 text-green-800",
    Develop: "bg-yellow-100 border-yellow-400 text-yellow-800",
    Deliver: "bg-purple-100 border-purple-400 text-purple-800",
  };
  return colors[phase] || "bg-gray-100 border-gray-400 text-gray-800";
};

// Expand/Collapse handlers
const handleExpand = () => {
  isExpanded.value = true;
  emit("expandPipeline");
};

const handleCollapse = () => {
  isExpanded.value = false;
};

// Exercise handlers
const openCurrentExercise = () => {
  if (currentExercise.value) {
    const index = props.selectedPins.findIndex(
      (pin) => pin.originalIndex === currentExercise.value!.originalIndex
    );
    if (index >= 0) {
      handleOpenExercise(currentExercise.value, index);
    }
  }
};

const handleOpenExercise = (exercise: SelectedPinInfo, index: number) => {
  emit("openExercise", exercise, index);
};

// Drag and drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  // Small delay to allow distinguishing clicks from drags
  setTimeout(() => {
    isDragging.value = true;
  }, 50);
  
  draggedIndex.value = index;
  phaseRestrictionMessage.value = null; // Clear any previous messages
  
  // Reset click detection since this is a drag
  mouseDownTime.value = 0;
  mouseDownPosition.value = null;
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnter = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    // Check if this is a valid drop target (same phase)
    if (canDropAtIndex(draggedIndex.value, index)) {
      dragOverIndex.value = index;
    } else {
      // Invalid drop target - could add visual feedback here
      dragOverIndex.value = null;
    }
  }
};

const handleDragLeave = () => {
  // Only clear dragOverIndex after a small delay to prevent flickering
  setTimeout(() => {
    dragOverIndex.value = null;
  }, 50);
};

const handleDrop = (event: DragEvent, toIndex: number) => {
  event.preventDefault();

  if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
    // Check if this is a valid drop (same phase)
    if (canDropAtIndex(draggedIndex.value, toIndex)) {
      emit("reorderPins", draggedIndex.value, toIndex);
      phaseRestrictionMessage.value = null;
    } else {
      // Show restriction message
      const draggedExercise = props.selectedPins[draggedIndex.value];
      const targetExercise = props.selectedPins[toIndex];
      phaseRestrictionMessage.value = `Cannot move ${draggedExercise.name} from ${draggedExercise.location.phase} to ${targetExercise.location.phase} phase`;

      // Clear message after 3 seconds
      setTimeout(() => {
        phaseRestrictionMessage.value = null;
      }, 3000);
    }
  }

  handleDragEnd();
};

// Card styling helpers
const getCardStateClasses = (exercise: SelectedPinInfo) => {
  const classes = [];

  // Check if this is the currently active exercise in the pipeline page
  if (currentActiveExercise.value?.originalIndex === exercise.originalIndex) {
    classes.push(
      "ring-2 ring-orange-500 ring-opacity-50 border-orange-500/50 bg-orange-50 border-orange-200"
    );
  } else if (
    isCurrentExercise(exercise) &&
    !isExerciseCompleted(exercise.name)
  ) {
    classes.push(
      "ring-2 ring-primary-accent ring-opacity-50 border-primary-accent/30 bg-blue-50 border-blue-200"
    );
  } else if (isExerciseCompleted(exercise.name)) {
    classes.push("bg-green-50 border-green-200");
  } else {
    classes.push("border-on-light-accent/20");
  }

  return classes;
};

const getHumanAiScaleText = (humanAiScale: number) => {
  if (humanAiScale <= 3) return "Human";
  if (humanAiScale <= 7) return "Human+AI";
  return "AI";
};

const getHumanAiScaleStyle = (humanAiScale: number) => {
  if (humanAiScale <= 3) return "bg-[#DBE9FE] text-[#1D40AE]";
  if (humanAiScale <= 7) return "bg-[#F3E8FF] text-[#6B21A8]";
  return "bg-[#D1FAE5] text-[#076046]";
};

// Helper functions for UnifiedExerciseCard
const isCurrentExercise = (exercise: SelectedPinInfo): boolean => {
  return currentExercise.value?.originalIndex === exercise.originalIndex;
};

const exerciseHasEthics = (exercise: SelectedPinInfo): boolean => {
  return (
    ethics.hasEthicsRequirement(exercise, "before") ||
    ethics.hasEthicsRequirement(exercise, "after")
  );
};

const exerciseEthicsCompleted = (exercise: SelectedPinInfo): boolean => {
  const status = ethics.getExerciseEthicsStatus(exercise);
  return status.allCompleted || false;
};

const getChatHistoryCount = (exerciseId: string): number => {
  const stats = getChatStats(exerciseId);
  return stats.userMessages;
};

const formatCompletionDate = (exerciseId: string): string => {
  const progress = getExerciseProgress(exerciseId);
  if (!progress?.completedAt) return "";

  const date = new Date(progress.completedAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openExercise = (exercise: SelectedPinInfo, index: number) => {
  handleOpenExercise(exercise, index);
};

const handleEthicsClick = (exercise: SelectedPinInfo) => {
  const status = ethics.getExerciseEthicsStatus(exercise);

  if (status.beforeCompleted || status.afterCompleted) {
    // For now, just open the exercise - could add ethics viewer modal later
    const index = props.selectedPins.findIndex(
      (p) => p.originalIndex === exercise.originalIndex
    );
    openExercise(exercise, index);
  } else {
    // Navigate to exercise for pending ethics
    const index = props.selectedPins.findIndex(
      (p) => p.originalIndex === exercise.originalIndex
    );
    openExercise(exercise, index);
  }
};

// Exercise click handlers
const handleMouseDown = (event: MouseEvent) => {
  mouseDownTime.value = Date.now();
  mouseDownPosition.value = { x: event.clientX, y: event.clientY };
};

const handleExerciseClick = (exercise: SelectedPinInfo, event: MouseEvent) => {
  // Only trigger click if this wasn't a drag operation
  if (!isDragging.value && mouseDownTime.value && mouseDownPosition.value) {
    const timeDiff = Date.now() - mouseDownTime.value;
    const distance = Math.sqrt(
      Math.pow(event.clientX - mouseDownPosition.value.x, 2) +
      Math.pow(event.clientY - mouseDownPosition.value.y, 2)
    );
    
    // Click is valid if it's quick and the mouse didn't move much
    if (timeDiff < CLICK_THRESHOLD_TIME && distance < CLICK_THRESHOLD_DISTANCE) {
      const index = props.selectedPins.findIndex(
        (p) => p.originalIndex === exercise.originalIndex
      );
      if (index >= 0) {
        emit('openExercise', exercise, index);
      }
    }
  }
  
  // Reset click detection state
  mouseDownTime.value = 0;
  mouseDownPosition.value = null;
};

const findExerciseIndexInPipeline = (exercise: SelectedPinInfo): number => {
  if (exercise.isEthicsExercise && exercise.ethicsExerciseData) {
    const id = exercise.ethicsExerciseData.id;
    return props.selectedPins.findIndex(p => p.isEthicsExercise && p.ethicsExerciseData?.id === id);
  } else {
    const id = exercise.originalIndex;
    return props.selectedPins.findIndex(p => !p.isEthicsExercise && p.originalIndex === id);
  }
};

const isFirstPhase = (phase: string) => {
  return exercisesByPhase.value.length > 0 && exercisesByPhase.value[0].phase === phase;
}

const getPinInsertionIndex = (renderableIndex: number) => {
  let pinCount = 0;
  // Get the item from the renderable pipeline at the given index
  const lastRenderableItem = renderablePipeline.value[renderableIndex];

  if (!lastRenderableItem) {
    // If the index is out of bounds (for adding at the end), count all pins
    return props.selectedPins.length;
  }
  
  // Find the last actual pin within the renderable item
  let lastPinInRenderable: SelectedPinInfo | undefined;
  if (lastRenderableItem.isEthics) {
    lastPinInRenderable = lastRenderableItem.exercise;
  } else {
    lastPinInRenderable = lastRenderableItem.exercises?.[lastRenderableItem.exercises.length - 1];
  }

  if (!lastPinInRenderable) {
    // Fallback for an empty phase group, insert before it
    for (let i = 0; i < renderableIndex; i++) {
        const item = renderablePipeline.value[i];
        pinCount += item.isEthics ? 1 : (item.exercises?.length || 0);
    }
    return pinCount;
  }

  // Find the index of that last pin in the original `selectedPins` array
  const id = lastPinInRenderable.isEthicsExercise ? lastPinInRenderable.ethicsExerciseData!.id : lastPinInRenderable.originalIndex;
  const originalIndex = props.selectedPins.findIndex(p => 
      (p.isEthicsExercise ? p.ethicsExerciseData?.id : p.originalIndex) === id
  );

  return originalIndex + 1;
};

const renderablePipeline = computed(() => {
  const items: Array<{
    isEthics: boolean;
    phase?: string;
    exercises?: SelectedPinInfo[];
    exercise?: SelectedPinInfo;
  }> = [];

  if (!props.selectedPins || props.selectedPins.length === 0) {
    return items;
  }

  let currentPhaseGroup: {
    isEthics: false;
    phase: string;
    exercises: SelectedPinInfo[];
  } | null = null;

  for (const pin of props.selectedPins) {
    if (pin.isEthicsExercise) {
      if (currentPhaseGroup) {
        items.push(currentPhaseGroup);
        currentPhaseGroup = null;
      }
      items.push({ isEthics: true, exercise: pin });
    } else {
      if (!currentPhaseGroup || currentPhaseGroup.phase !== pin.location.phase) {
        if (currentPhaseGroup) {
          items.push(currentPhaseGroup);
        }
        currentPhaseGroup = {
          isEthics: false,
          phase: pin.location.phase,
          exercises: [pin],
        };
      } else {
        currentPhaseGroup.exercises.push(pin);
      }
    }
  }

  if (currentPhaseGroup) {
    items.push(currentPhaseGroup);
  }

  return items;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

