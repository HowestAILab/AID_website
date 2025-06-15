<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Ethics Review Details</h3>
        <p class="text-sm text-gray-600">{{ exercise.name }} - {{ exercise.location.phase }} / {{ exercise.location.step }}</p>
      </div>
      <Button @click="$emit('close')" variant="outline" size="sm">
        <X class="w-4 h-4 mr-2" />
        Close
      </Button>
    </div>

    <!-- Ethics Status Overview -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Ethics Status Overview</h4>
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-if="exerciseEthicsStatus.beforeRequired"
          class="flex items-center justify-between p-3 bg-white rounded border"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">Before</span>
            <span class="text-sm text-gray-600">Pre-Exercise Review</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 
              v-if="exerciseEthicsStatus.beforeCompleted" 
              class="w-4 h-4 text-green-600" 
            />
            <Clock v-else class="w-4 h-4 text-orange-600" />
            <Button
              @click="handleViewEdit('before')"
              variant="ghost"
              size="sm"
              class="text-xs"
            >
              {{ exerciseEthicsStatus.beforeCompleted ? 'View/Edit' : 'Complete' }}
            </Button>
          </div>
        </div>

        <div 
          v-if="exerciseEthicsStatus.afterRequired"
          class="flex items-center justify-between p-3 bg-white rounded border"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">After</span>
            <span class="text-sm text-gray-600">Post-Exercise Review</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 
              v-if="exerciseEthicsStatus.afterCompleted" 
              class="w-4 h-4 text-green-600" 
            />
            <Clock v-else class="w-4 h-4 text-orange-600" />
            <Button
              @click="handleViewEdit('after')"
              variant="ghost"
              size="sm"
              class="text-xs"
            >
              {{ exerciseEthicsStatus.afterCompleted ? 'View/Edit' : 'Complete' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Review Section -->
    <div v-if="selectedTiming" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-medium text-gray-900">
          {{ selectedTiming === 'before' ? 'Pre-Exercise' : 'Post-Exercise' }} Ethics Review
        </h4>
        <div class="flex items-center gap-2">
          <span 
            class="text-xs px-2 py-1 rounded font-medium"
            :class="selectedTiming === 'before' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
          >
            {{ selectedTiming === 'before' ? 'Before' : 'After' }}
          </span>
          <Button
            v-if="!isEditing"
            @click="startEditing"
            variant="outline"
            size="sm"
          >
            <Pencil class="w-4 h-4 mr-2" />
            Edit
          </Button>
          <div v-else class="flex gap-2">
            <Button
              @click="saveChanges"
              size="sm"
              :disabled="!hasChanges"
            >
              <Save class="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              @click="cancelEditing"
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <!-- Ethics Settings Display -->
      <div v-if="currentEthicsData" class="bg-blue-50 rounded-lg p-4">
        <h5 class="font-medium text-blue-900 mb-2">Ethics Framework</h5>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-blue-700 font-medium">Lens:</span>
            <span class="ml-1 text-blue-800">{{ currentEthicsData.settings?.lens || 'Unknown' }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Capital:</span>
            <span class="ml-1 text-blue-800">{{ currentEthicsData.settings?.capital || 'Unknown' }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Zoom:</span>
            <span class="ml-1 text-blue-800">{{ currentEthicsData.settings?.zoomingState || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <!-- Questions and Responses -->
      <div v-if="ethicsQuestions.length > 0" class="space-y-4">
        <div
          v-for="(question, index) in ethicsQuestions"
          :key="`${selectedTiming}-q${index}`"
          class="bg-white border rounded-lg p-4"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h6 class="font-medium text-gray-900 mb-2">Question {{ index + 1 }}</h6>
                <p class="text-sm text-gray-700 leading-relaxed">{{ question }}</p>
              </div>
            </div>

            <!-- Response Display/Edit -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Response:</label>
              <div v-if="!isEditing" class="bg-gray-50 rounded p-3 text-sm text-gray-800">
                {{ getResponse(index) || 'No response provided' }}
              </div>
              <textarea
                v-else
                v-model="editingResponses[`${exercise.name}-${selectedTiming}-q${index}`]"
                class="w-full min-h-[100px] p-3 border rounded-md text-sm resize-y"
                :placeholder="`Enter your response to question ${index + 1}...`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Completion Status -->
      <div v-if="currentEthicsData?.completedAt" class="bg-green-50 rounded-lg p-4">
        <div class="flex items-center gap-2 text-green-800">
          <CheckCircle2 class="w-4 h-4" />
          <span class="font-medium">Review Completed</span>
        </div>
        <p class="text-sm text-green-700 mt-1">
          Completed on {{ formatDate(currentEthicsData.completedAt) }}
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="ethicsQuestions.length === 0" class="text-center py-8 text-gray-500">
        <Shield class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No ethics questions found for this timing</p>
      </div>
    </div>

    <!-- No Selection State -->
    <div v-else class="text-center py-12 text-gray-500">
      <Shield class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h4 class="text-lg font-medium text-gray-700 mb-2">Select an Ethics Review</h4>
      <p class="text-sm">Choose a before or after review above to view or edit responses</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Pencil, 
  Save, 
  Shield 
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useEthics } from '@/composables/useEthics';
import type { SelectedPinInfo } from '@/types/exercise';

const props = defineProps<{
  exercise: SelectedPinInfo;
  initialTiming?: 'before' | 'after';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'trigger-ethics', exercise: SelectedPinInfo, timing: 'before' | 'after'): void;
}>();

const { 
  ethicsData, 
  getExerciseEthicsStatus, 
  getEthicsQuestions,
  markCompleted 
} = useEthics();

// Local state
const selectedTiming = ref<'before' | 'after' | null>(props.initialTiming || null);
const isEditing = ref(false);
const editingResponses = ref<Record<string, string>>({});

// Computed properties
const exerciseEthicsStatus = computed(() => {
  return getExerciseEthicsStatus(props.exercise);
});

const currentEthicsData = computed(() => {
  if (!selectedTiming.value) return null;
  const key = `${props.exercise.name}-${selectedTiming.value}`;
  return ethicsData.value[key] || null;
});

const ethicsQuestions = computed(() => {
  if (!selectedTiming.value) return [];
  return getEthicsQuestions(props.exercise, selectedTiming.value);
});

const hasChanges = computed(() => {
  if (!currentEthicsData.value?.responses) return false;
  
  return Object.keys(editingResponses.value).some(key => {
    const originalResponse = currentEthicsData.value?.responses?.[key];
    const editedResponse = editingResponses.value[key];
    return originalResponse !== editedResponse;
  });
});

// Helper functions
const getResponse = (questionIndex: number): string => {
  if (!currentEthicsData.value?.responses) return '';
  const key = `${props.exercise.name}-${selectedTiming.value}-q${questionIndex}`;
  return currentEthicsData.value.responses[key] || '';
};

const formatDate = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

// Event handlers
const handleViewEdit = (timing: 'before' | 'after') => {
  const status = timing === 'before' ? exerciseEthicsStatus.value.beforeCompleted : exerciseEthicsStatus.value.afterCompleted;
  
  if (status) {
    // Already completed, show in viewer
    selectedTiming.value = timing;
    setupEditingResponses();
  } else {
    // Not completed, trigger ethics modal
    emit('trigger-ethics', props.exercise, timing);
  }
};

const setupEditingResponses = () => {
  if (!currentEthicsData.value?.responses) return;
  
  editingResponses.value = { ...currentEthicsData.value.responses };
};

const startEditing = () => {
  isEditing.value = true;
  setupEditingResponses();
};

const cancelEditing = () => {
  isEditing.value = false;
  editingResponses.value = {};
};

const saveChanges = () => {
  if (!selectedTiming.value || !hasChanges.value) return;
  
  markCompleted(props.exercise.name, selectedTiming.value, editingResponses.value);
  isEditing.value = false;
  editingResponses.value = {};
};

// Watch for timing changes to reset editing state
watch(selectedTiming, () => {
  isEditing.value = false;
  editingResponses.value = {};
  if (selectedTiming.value && currentEthicsData.value?.responses) {
    setupEditingResponses();
  }
});
</script> 