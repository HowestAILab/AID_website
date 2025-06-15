<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Progress Bar -->
    <div class="px-4 py-3 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-sm font-medium text-on-light-default">Overall Progress</span>
        <span class="text-sm text-on-light-accent">{{ completedCount }} of {{ totalCount }} exercises</span>
      </div>
      <div class="w-full bg-white/50 rounded-full h-2 border border-on-light-accent/20">
        <div 
          class="bg-primary-accent h-2 rounded-full transition-all duration-300"
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
          class="flex-shrink-0 w-80 border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          :class="{
            'ring-2 ring-primary-accent ring-opacity-50': isCurrentExercise(exercise),
            'bg-green-50 border-green-200': isExerciseCompleted(exercise.name),
            'bg-blue-50 border-blue-200': !isExerciseCompleted(exercise.name) && isCurrentExercise(exercise)
          }"
          @click="openExercise(exercise, index)"
        >
          <!-- Exercise Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-medium text-on-light-default text-sm">{{ exercise.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs text-on-light-accent">{{ exercise.location.phase }} • {{ exercise.location.step }}</p>
                  <div :class="getHumanAiScaleStyle(exercise.location.human_ai_scale)" class="text-xs px-1.5 py-0.5 rounded-sm font-medium">
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
              <Circle 
                v-else
                class="w-5 h-5 text-on-light-accent/40"
              />
            </div>
          </div>

          <!-- Exercise Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ exercise.description }}</p>

          <!-- Progress Indicators -->
          <div class="space-y-2">
            <!-- Ethics Status -->
            <div 
              v-if="exerciseHasEthics(exercise)" 
              class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
              @click.stop="handleEthicsClick(exercise)"
            >
              <Shield class="w-3 h-3 flex-shrink-0 text-purple-600" />
              <span class="text-on-light-accent">Ethics:</span>
              <span 
                :class="exerciseEthicsCompleted(exercise) ? 'text-green-600' : 'text-primary-accent'"
              >
                {{ exerciseEthicsCompleted(exercise) ? 'Completed' : 'Pending' }}
              </span>
              <Eye 
                v-if="exerciseEthicsCompleted(exercise)"
                class="w-3 h-3 text-gray-400 ml-auto"
              />
            </div>

            <!-- Chat History -->
            <div class="flex items-center gap-2 text-xs">
              <MessageSquare class="w-3 h-3 flex-shrink-0 text-on-light-accent" />
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
                :class="isExerciseCompleted(exercise.name) ? 'text-green-600 font-medium' : 'text-on-light-accent/70'"
              >
                {{ isExerciseCompleted(exercise.name) ? 'Completed' : 'Not Started' }}
              </span>
            </div>
          </div>

          <!-- Completion Date -->
          <div v-if="isExerciseCompleted(exercise.name)" class="mt-3 pt-3 border-t border-on-light-accent/20">
            <p class="text-xs text-on-light-accent/70">
              Completed {{ formatCompletionDate(exercise.name) }}
            </p>
          </div>
        </div>

        <!-- Add more exercises prompt -->
        <div 
          v-if="selectedPins.length === 0"
          class="flex-shrink-0 w-80 border-2 border-dashed border-on-light-accent/30 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-on-light-accent/40 mb-2" />
          <p class="text-on-light-accent font-medium mb-1">No exercises in pipeline</p>
          <p class="text-sm text-on-light-accent/70">Add exercises from the diamond to get started</p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 p-4 overflow-y-auto min-h-0">
      <!-- Grid Layout for PipelinePage -->
      <div class="grid gap-4 auto-fit-minmax">
        <div
          v-for="(exercise, index) in selectedPins"
          :key="exercise.originalIndex"
          class="border border-on-light-accent/20 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-0"
          :class="{
            'ring-2 ring-primary-accent ring-opacity-50 border-primary-accent/30': isCurrentExercise(exercise),
            'bg-green-50 border-green-200': isExerciseCompleted(exercise.name),
            'bg-blue-50 border-blue-200': !isExerciseCompleted(exercise.name) && isCurrentExercise(exercise)
          }"
          @click="openExercise(exercise, index)"
        >
          <!-- Exercise Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div class="min-w-0">
                <h3 class="font-medium text-on-light-default text-sm truncate">{{ exercise.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs text-on-light-accent truncate">{{ exercise.location.phase }} • {{ exercise.location.step }}</p>
                  <div :class="getHumanAiScaleStyle(exercise.location.human_ai_scale)" class="text-xs px-1.5 py-0.5 rounded-sm font-medium">
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
              <Circle 
                v-else
                class="w-5 h-5 text-on-light-accent/40"
              />
            </div>
          </div>

          <!-- Exercise Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ exercise.description }}</p>

          <!-- Progress Indicators -->
          <div class="space-y-2">
            <!-- Ethics Status -->
            <div 
              v-if="exerciseHasEthics(exercise)" 
              class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
              @click.stop="handleEthicsClick(exercise)"
            >
              <Shield class="w-3 h-3 flex-shrink-0 text-purple-600" />
              <span class="text-on-light-accent">Ethics:</span>
              <span 
                :class="exerciseEthicsCompleted(exercise) ? 'text-green-600' : 'text-primary-accent'"
              >
                {{ exerciseEthicsCompleted(exercise) ? 'Completed' : 'Pending' }}
              </span>
              <Eye 
                v-if="exerciseEthicsCompleted(exercise)"
                class="w-3 h-3 text-gray-400 ml-auto"
              />
            </div>

            <!-- Chat History -->
            <div class="flex items-center gap-2 text-xs">
              <MessageSquare class="w-3 h-3 flex-shrink-0 text-on-light-accent" />
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
                :class="isExerciseCompleted(exercise.name) ? 'text-green-600 font-medium' : 'text-on-light-accent/70'"
              >
                {{ isExerciseCompleted(exercise.name) ? 'Completed' : 'Not Started' }}
              </span>
            </div>
          </div>

          <!-- Completion Date -->
          <div v-if="isExerciseCompleted(exercise.name)" class="mt-3 pt-3 border-t border-on-light-accent/20">
            <p class="text-xs text-on-light-accent/70">
              Completed {{ formatCompletionDate(exercise.name) }}
            </p>
          </div>
        </div>

        <!-- Add more exercises prompt -->
        <div 
          v-if="selectedPins.length === 0"
          class="col-span-full border-2 border-dashed border-on-light-accent/30 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <Plus class="w-8 h-8 text-on-light-accent/40 mb-2" />
          <p class="text-on-light-accent font-medium mb-1">No exercises in pipeline</p>
          <p class="text-sm text-on-light-accent/70">Add exercises from the diamond to get started</p>
        </div>
      </div>
    </div>

    <!-- Phase Summary - Only show in full mode -->
    <div v-if="mode === 'full'" class="border-t p-4 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Phase Progress</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          v-for="phase in phases"
          :key="phase"
          class="text-center"
        >
          <div class="text-xs text-on-light-accent mb-1">{{ phase }}</div>
          <div class="text-sm font-medium text-on-light-default">
            {{ getPhaseProgress(selectedPins, phase).completed }}/{{ getPhaseProgress(selectedPins, phase).total }}
          </div>
          <div class="w-full bg-white/50 rounded-full h-1 mt-1 border border-on-light-accent/20">
            <div 
              class="bg-primary-accent h-1 rounded-full transition-all duration-300"
              :style="{ width: getPhaseProgress(selectedPins, phase).percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

      <!-- Ethics Viewer Modal -->
  <EthicsViewerModal
    v-if="selectedEthicsExercise"
    :open="ethicsModalOpen"
    :exercise="selectedEthicsExercise"
    @update:open="ethicsModalOpen = $event"
    @edit-ethics="handleEthicsEdit"
  />
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, ref } from 'vue';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Shield, 
  MessageSquare, 
  Target,
  Plus,
  Eye
} from 'lucide-vue-next';
import { usePipelineProgress } from '@/composables/usePipelineProgress';
import { useExerciseChat } from '@/composables/useExerciseChat';
import { useEthics } from '@/composables/useEthics';
import EthicsViewerModal from '@/components/ethics/EthicsViewerModal.vue';
import type { SelectedPinInfo } from '@/types/exercise';

const props = withDefaults(defineProps<{
  selectedPins: SelectedPinInfo[];
  mode?: 'full' | 'compact'; // 'full' for PipelinePage, 'compact' for CurrentPipelineSection
}>(), {
  mode: 'full'
});

const emit = defineEmits<{
  (e: 'open-exercise', exercise: SelectedPinInfo, index: number): void;
  (e: 'edit-ethics', exercise: SelectedPinInfo, timing: 'before' | 'after'): void;
}>();

const { 
  isExerciseCompleted, 
  getExerciseProgress, 
  calculatePipelineProgress,
  getCurrentExercise,
  getPhaseProgress
} = usePipelineProgress();

const { getChatStats } = useExerciseChat();
const ethics = useEthics();

const phases = ['Discover', 'Define', 'Develop', 'Deliver'];

// Computed properties
const overallProgress = computed(() => calculatePipelineProgress(props.selectedPins));
const completedCount = computed(() => 
  props.selectedPins.filter(pin => isExerciseCompleted(pin.name)).length
);
const totalCount = computed(() => props.selectedPins.length);
const currentExercise = computed(() => getCurrentExercise(props.selectedPins));

// Local state for ethics modal
const ethicsModalOpen = ref(false);
const selectedEthicsExercise = ref<SelectedPinInfo | null>(null);

// Helper functions - simplified
const isCurrentExercise = (exercise: SelectedPinInfo): boolean => {
  return currentExercise.value?.originalIndex === exercise.originalIndex;
};

const exerciseHasEthics = (exercise: SelectedPinInfo): boolean => {
  return ethics.hasEthicsRequirement(exercise, 'before') || ethics.hasEthicsRequirement(exercise, 'after');
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
  if (!progress?.completedAt) return '';
  
  const date = new Date(progress.completedAt);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getHumanAiScaleText = (scale: number): string => {
  if (scale <= 3) return 'Human';
  if (scale <= 7) return 'Human+AI';
  return 'AI';
};

const getHumanAiScaleStyle = (scale: number): string => {
  if (scale <= 3) return 'bg-[#DBE9FE] text-[#1D40AE]'; // Human - blue
  if (scale <= 7) return 'bg-[#F3E8FF] text-[#6B21A8]'; // Human+AI - purple
  return 'bg-[#D1FAE5] text-[#076046]'; // AI - green
};

const openExercise = (exercise: SelectedPinInfo, index: number) => {
  emit('open-exercise', exercise, index);
};

const handleEthicsClick = (exercise: SelectedPinInfo) => {
  const status = ethics.getExerciseEthicsStatus(exercise);
  
  if (status.beforeCompleted || status.afterCompleted) {
    // Show viewer modal for completed ethics
    selectedEthicsExercise.value = exercise;
    ethicsModalOpen.value = true;
  } else {
    // Navigate to exercise for pending ethics
    const index = props.selectedPins.findIndex(p => p.originalIndex === exercise.originalIndex);
    openExercise(exercise, index);
  }
};

const handleEthicsEdit = (exercise: SelectedPinInfo, timing: 'before' | 'after') => {
  emit('edit-ethics', exercise, timing);
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