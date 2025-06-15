<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Shield class="w-5 h-5 text-purple-600" />
          Ethics Review Results
        </DialogTitle>
        <DialogDescription>
          {{ exercise.name }} - {{ exercise.location.phase }} / {{ exercise.location.step }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Before Ethics -->
        <div v-if="beforeEthics" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-medium text-gray-900">Pre-Exercise Ethics Review</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                Before
              </span>
              <Button
                @click="handleEdit('before')"
                variant="outline"
                size="sm"
                class="text-xs"
              >
                <Pencil class="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-3">
              <div
                v-for="(response, questionId) in beforeEthics.responses"
                :key="questionId"
                class="space-y-1"
              >
                <div class="text-sm font-medium text-gray-700">
                  Question {{ extractQuestionNumber(questionId) }}
                </div>
                <div class="text-sm text-gray-600 bg-white rounded p-2 border">
                  {{ response }}
                </div>
              </div>
            </div>
            
            <div class="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center justify-between">
              <span>Completed {{ formatDate(beforeEthics.completedAt) }}</span>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ beforeEthics.settings?.lens || 'Unknown' }} lens</span>
                <span>•</span>
                <span class="font-medium">{{ beforeEthics.settings?.capital || 'Unknown' }} capital</span>
              </div>
            </div>
          </div>
        </div>

        <!-- After Ethics -->
        <div v-if="afterEthics" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-medium text-gray-900">Post-Exercise Ethics Review</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                After
              </span>
              <Button
                @click="handleEdit('after')"
                variant="outline"
                size="sm"
                class="text-xs"
              >
                <Pencil class="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-3">
              <div
                v-for="(response, questionId) in afterEthics.responses"
                :key="questionId"
                class="space-y-1"
              >
                <div class="text-sm font-medium text-gray-700">
                  Question {{ extractQuestionNumber(questionId) }}
                </div>
                <div class="text-sm text-gray-600 bg-white rounded p-2 border">
                  {{ response }}
                </div>
              </div>
            </div>
            
            <div class="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center justify-between">
              <span>Completed {{ formatDate(afterEthics.completedAt) }}</span>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ afterEthics.settings?.lens || 'Unknown' }} lens</span>
                <span>•</span>
                <span class="font-medium">{{ afterEthics.settings?.capital || 'Unknown' }} capital</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No completed ethics -->
        <div v-if="!beforeEthics && !afterEthics" class="text-center py-8 text-gray-500">
          <Shield class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No completed ethics reviews found</p>
          <p class="text-sm">Complete ethics reviews to see them here</p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="$emit('update:open', false)" variant="outline">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Shield, Pencil } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEthics } from '@/composables/useEthics';
import type { SelectedPinInfo } from '@/types/exercise';

const props = defineProps<{
  open: boolean;
  exercise: SelectedPinInfo;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'edit-ethics', exercise: SelectedPinInfo, timing: 'before' | 'after'): void;
}>();

const { ethicsData } = useEthics();

const beforeEthics = computed(() => {
  const key = `${props.exercise.name}-before`;
  return ethicsData.value[key] || null;
});

const afterEthics = computed(() => {
  const key = `${props.exercise.name}-after`;
  return ethicsData.value[key] || null;
});

const extractQuestionNumber = (questionId: string): string => {
  const match = questionId.match(/q(\d+)$/);
  return match ? match[1] : '?';
};

const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Unknown date';
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

const handleEdit = (timing: 'before' | 'after') => {
  emit('edit-ethics', props.exercise, timing);
  emit('update:open', false);
};
</script> 