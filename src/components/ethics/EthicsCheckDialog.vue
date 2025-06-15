<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[550px] overflow-y-auto max-h-[85vh]">
      <DialogHeader>
        <DialogTitle>Ethical Check – {{ capitalizedTiming }} Exercise</DialogTitle>
        <DialogDescription>
          Please answer the following questions before continuing.
        </DialogDescription>
      </DialogHeader>

      <div v-if="check" class="space-y-6 py-4">
        <!-- Settings overview -->
        <div class="grid grid-cols-3 gap-4 border p-3 rounded-md bg-gray-50">
          <div>
            <p class="text-xs uppercase font-semibold text-gray-500 mb-1">Zooming</p>
            <p class="text-sm font-medium">{{ check.settings.zoomingState }}</p>
          </div>
          <div>
            <p class="text-xs uppercase font-semibold text-gray-500 mb-1">Main capital</p>
            <p class="text-sm font-medium">{{ check.settings.mainCapital.name }}</p>
          </div>
          <div>
            <p class="text-xs uppercase font-semibold text-gray-500 mb-1">Ethical lens</p>
            <p class="text-sm font-medium">{{ check.settings.ethicalLens.name }}</p>
          </div>
        </div>

        <!-- Questions list -->
        <div v-for="question in check.questions" :key="question.id" class="space-y-2">
          <label class="font-medium text-sm">{{ question.question }}</label>
          <!-- simple input types for now -->
          <template v-if="question.type === 'text'">
            <Textarea v-model="responses[question.id]" placeholder="Your answer" />
          </template>
          <template v-else-if="question.type === 'rating'">
            <select v-model="responses[question.id]" class="border p-2 rounded w-full text-sm">
              <option disabled value="">Select rating</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </template>
          <template v-else-if="question.type === 'multiple-choice'">
            <select v-model="responses[question.id]" class="border p-2 rounded w-full text-sm">
              <option disabled value="">Choose</option>
              <option v-for="opt in question.options || []" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </template>
        </div>
      </div>

      <DialogFooter class="mt-6">
        <Button variant="outline" @click="handleCancel">Close</Button>
        <Button :disabled="!isFormComplete" @click="handleSubmit">Submit</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEthics } from '@/composables/useEthics';
import type { EthicalQuestion, EthicalSettings } from '@/types/ethics';

const props = defineProps<{
  exerciseId: string;
  timing: 'before' | 'after';
  open: boolean;
  defaultQuestions: Omit<EthicalQuestion, 'id'>[];
  settings: EthicalSettings;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'completed'): void;
}>();

const isOpen = ref(props.open);

watch(() => props.open, (v) => (isOpen.value = v));
watch(isOpen, (v) => emit('update:open', v));

const { ensureEthicalCheck, markCompleted } = useEthics();

const check = ensureEthicalCheck({
  exerciseId: props.exerciseId,
  timing: props.timing,
  questions: props.defaultQuestions,
  settings: props.settings,
});

const responses = reactive<Record<string, any>>({});

// Pre-fill responses if already answered
if (check.responses) {
  Object.assign(responses, check.responses);
}

const isFormComplete = computed(() => {
  return check.questions.every((q) => {
    const val = responses[q.id];
    return val !== undefined && val !== null && val !== '';
  });
});

const capitalizedTiming = computed(() => props.timing.charAt(0).toUpperCase() + props.timing.slice(1));

const handleSubmit = () => {
  if (!isFormComplete.value) return;
  markCompleted(props.exerciseId, props.timing, { ...responses });
  emit('completed');
  isOpen.value = false;
};

const handleCancel = () => {
  // allow closing even if incomplete -> will block flow elsewhere
  isOpen.value = false;
};
</script> 