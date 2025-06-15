<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Progress Bar -->
    <div class="px-4 py-3 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-sm font-medium text-gray-700">Overall Progress</span>
        <span class="text-sm text-gray-500">{{ completedCount }} of {{ totalCount }} exercises</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-[#F59E0C] h-2 rounded-full transition-all duration-300"
          :style="{ width: overallProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Exercises - Conditional Layout Based on Mode -->
    <div v-if="mode === 'compact'" class="flex-1 p-4">
      <!-- Horizontal Scroll Layout for CurrentPipelineSection -->
      <div class="flex gap-4 overflow-x-auto pb-4" style="scroll-behavior: smooth;">
        <div
          v-for="(exercise, index) in selectedPins"
          :key="exercise.originalIndex"
          class="flex-shrink-0 w-80 border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          :class="{
            'ring-2 ring-[#F59E0C] ring-opacity-50': isCurrentExercise(exercise),
            'bg-green-50 border-green-200': isExerciseCompleted(exercise.name),
            'bg-blue-50 border-blue-200': !isExerciseCompleted(exercise.name) && isCurrentExercise(exercise)
          }"
          @click="openExercise(exercise, index)"
        >
          <!-- Exercise Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-[#F59E0C] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-medium text-gray-900 text-sm">{{ exercise.name }}</h3>
                <p class="text-xs text-gray-500">{{ exercise.location.phase }} • {{ exercise.location.step }}</p>
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
                class="w-5 h-5 text-blue-600"
              />
              <Circle 
                v-else
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </div>

          <!-- Exercise Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ exercise.description }}</p>

          <!-- Progress Indicators -->
          <div class="space-y-2">
            <!-- Ethics Status -->
            <div v-if="exerciseHasEthics(exercise)" class="flex items-center gap-2 text-xs">
              <Shield class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Ethics:</span>
              <span 
                :class="exerciseEthicsCompleted(exercise) ? 'text-green-600' : 'text-orange-600'"
              >
                {{ exerciseEthicsCompleted(exercise) ? 'Completed' : 'Pending' }}
              </span>
            </div>

            <!-- Chat History -->
            <div class="flex items-center gap-2 text-xs">
              <MessageSquare class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Chat:</span>
              <span class="text-gray-500">
                {{ getChatHistoryCount(exercise.name) }} messages
              </span>
            </div>

            <!-- Completion Status -->
            <div class="flex items-center gap-2 text-xs">
              <Target class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Status:</span>
              <span 
                :class="isExerciseCompleted(exercise.name) ? 'text-green-600 font-medium' : 'text-gray-500'"
              >
                {{ isExerciseCompleted(exercise.name) ? 'Completed' : 'Not Started' }}
              </span>
            </div>
          </div>

          <!-- Completion Date -->
          <div v-if="isExerciseCompleted(exercise.name)" class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Completed {{ formatCompletionDate(exercise.name) }}
            </p>
          </div>
        </div>

        <!-- Add more exercises prompt -->
        <div 
          v-if="selectedPins.length === 0"
          class="flex-shrink-0 w-80 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-gray-400 mb-2" />
          <p class="text-gray-500 font-medium mb-1">No exercises in pipeline</p>
          <p class="text-sm text-gray-400">Add exercises from the diamond to get started</p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 p-4 overflow-y-auto min-h-0">
      <!-- Grid Layout for PipelinePage -->
      <div class="grid gap-4 auto-fit-minmax">
        <div
          v-for="(exercise, index) in selectedPins"
          :key="exercise.originalIndex"
          class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-0"
          :class="{
            'ring-2 ring-[#F59E0C] ring-opacity-50': isCurrentExercise(exercise),
            'bg-green-50 border-green-200': isExerciseCompleted(exercise.name),
            'bg-blue-50 border-blue-200': !isExerciseCompleted(exercise.name) && isCurrentExercise(exercise)
          }"
          @click="openExercise(exercise, index)"
        >
          <!-- Exercise Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 bg-[#F59E0C] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div class="min-w-0">
                <h3 class="font-medium text-gray-900 text-sm truncate">{{ exercise.name }}</h3>
                <p class="text-xs text-gray-500 truncate">{{ exercise.location.phase }} • {{ exercise.location.step }}</p>
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
                class="w-5 h-5 text-blue-600"
              />
              <Circle 
                v-else
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </div>

          <!-- Exercise Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ exercise.description }}</p>

          <!-- Progress Indicators -->
          <div class="space-y-2">
            <!-- Ethics Status -->
            <div v-if="exerciseHasEthics(exercise)" class="flex items-center gap-2 text-xs">
              <Shield class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Ethics:</span>
              <span 
                :class="exerciseEthicsCompleted(exercise) ? 'text-green-600' : 'text-orange-600'"
              >
                {{ exerciseEthicsCompleted(exercise) ? 'Completed' : 'Pending' }}
              </span>
            </div>

            <!-- Chat History -->
            <div class="flex items-center gap-2 text-xs">
              <MessageSquare class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Chat:</span>
              <span class="text-gray-500">
                {{ getChatHistoryCount(exercise.name) }} messages
              </span>
            </div>

            <!-- Completion Status -->
            <div class="flex items-center gap-2 text-xs">
              <Target class="w-3 h-3 flex-shrink-0" />
              <span class="text-gray-600">Status:</span>
              <span 
                :class="isExerciseCompleted(exercise.name) ? 'text-green-600 font-medium' : 'text-gray-500'"
              >
                {{ isExerciseCompleted(exercise.name) ? 'Completed' : 'Not Started' }}
              </span>
            </div>
          </div>

          <!-- Completion Date -->
          <div v-if="isExerciseCompleted(exercise.name)" class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Completed {{ formatCompletionDate(exercise.name) }}
            </p>
          </div>
        </div>

        <!-- Add more exercises prompt -->
        <div 
          v-if="selectedPins.length === 0"
          class="col-span-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-gray-400 mb-2" />
          <p class="text-gray-500 font-medium mb-1">No exercises in pipeline</p>
          <p class="text-sm text-gray-400">Add exercises from the diamond to get started</p>
        </div>
      </div>
    </div>

    <!-- Phase Summary - Only show in full mode -->
    <div v-if="mode === 'full'" class="border-t bg-gray-50 p-4 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Phase Progress</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          v-for="phase in phases"
          :key="phase"
          class="text-center"
        >
          <div class="text-xs text-gray-500 mb-1">{{ phase }}</div>
          <div class="text-sm font-medium text-gray-900">
            {{ getPhaseProgress(selectedPins, phase).completed }}/{{ getPhaseProgress(selectedPins, phase).total }}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              class="bg-[#F59E0C] h-1 rounded-full transition-all duration-300"
              :style="{ width: getPhaseProgress(selectedPins, phase).percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Shield, 
  MessageSquare, 
  Target,
  Plus
} from 'lucide-vue-next';
import { usePipelineProgress } from '@/composables/usePipelineProgress';
import { useEthics } from '@/composables/useEthics';
import type { SelectedPinInfo } from '@/types/exercise';

const props = withDefaults(defineProps<{
  selectedPins: SelectedPinInfo[];
  mode?: 'full' | 'compact'; // 'full' for PipelinePage, 'compact' for CurrentPipelineSection
}>(), {
  mode: 'full'
});

const emit = defineEmits<{
  (e: 'open-exercise', exercise: SelectedPinInfo, index: number): void;
}>();

const { 
  isExerciseCompleted, 
  getExerciseProgress, 
  calculatePipelineProgress,
  getCurrentExercise,
  getPhaseProgress
} = usePipelineProgress();

const { hasEthics, isCompleted: isEthicsCompleted } = useEthics();

const phases = ['Discover', 'Define', 'Develop', 'Deliver'];

// Computed properties
const overallProgress = computed(() => calculatePipelineProgress(props.selectedPins));
const completedCount = computed(() => 
  props.selectedPins.filter(pin => isExerciseCompleted(pin.name)).length
);
const totalCount = computed(() => props.selectedPins.length);
const currentExercise = computed(() => getCurrentExercise(props.selectedPins));

// Helper functions
const isCurrentExercise = (exercise: SelectedPinInfo): boolean => {
  return currentExercise.value?.originalIndex === exercise.originalIndex;
};

const exerciseHasEthics = (exercise: SelectedPinInfo): boolean => {
  return Boolean(hasEthics(exercise, 'before') || hasEthics(exercise, 'after'));
};

const exerciseEthicsCompleted = (exercise: SelectedPinInfo): boolean => {
  let completed = true;
  if (hasEthics(exercise, 'before'))
    completed = completed && isEthicsCompleted(exercise.name, 'before');
  if (hasEthics(exercise, 'after'))
    completed = completed && isEthicsCompleted(exercise.name, 'after');
  return completed;
};

const getChatHistoryCount = (exerciseId: string): number => {
  const progress = getExerciseProgress(exerciseId);
  return progress?.chatHistory?.length || 0;
};

const formatCompletionDate = (exerciseId: string): string => {
  const progress = getExerciseProgress(exerciseId);
  if (!progress?.completedAt) return '';
  
  const date = new Date(progress.completedAt);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openExercise = (exercise: SelectedPinInfo, index: number) => {
  emit('open-exercise', exercise, index);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.auto-fit-minmax {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Ensure responsive behavior for smaller screens */
@media (max-width: 640px) {
  .auto-fit-minmax {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .auto-fit-minmax {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 1025px) {
  .auto-fit-minmax {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}
</style> 