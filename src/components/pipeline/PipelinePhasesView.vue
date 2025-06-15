<template>
  <div class="flex-1 bg-white flex flex-col min-h-0">
    <!-- Progress Stepper -->
    <div class="p-4 border-b flex-shrink-0">
      <div class="w-full">
        <Stepper
          :model-value="currentStep"
          @update:model-value="setCurrentStep"
          class="flex w-full items-center gap-2"
          orientation="horizontal"
        >
          <StepperItem
            v-for="(step, index) in steps"
            :key="step.id"
            :step="index + 1"
            class="relative flex w-full flex-col items-center justify-center"
          >
            <StepperTrigger as-child>
              <Button
                :variant="getStepVariant(index + 1)"
                size="icon"
                class="size-10 rounded-full shrink-0 cursor-pointer"
                :class="getStepClasses(index + 1)"
              >
                <Check v-if="isStepCompleted(step.title)" class="size-5" />
                <span v-else>{{ index + 1 }}</span>
              </Button>
            </StepperTrigger>

            <div class="mt-2 text-center">
              <StepperTitle class="text-sm font-medium text-on-light-default">
                {{ step.title }}
              </StepperTitle>
              <div class="text-xs text-on-light-accent mt-1">
                {{ getPhaseProgress(selectedPins, step.title).completed }}/{{ getPhaseProgress(selectedPins, step.title).total }}
              </div>
            </div>

            <StepperSeparator
              v-if="index < steps.length - 1"
              class="absolute left-[calc(50%+20px)] top-5 block h-0.5 w-[calc(100%-40px)] shrink-0 rounded-full bg-on-light-accent/30 group-data-[state=completed]:bg-primary-accent"
            />
          </StepperItem>
        </Stepper>
      </div>
    </div>

    <!-- Phase Exercises -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
      <div v-for="(phaseItem, index) in phaseExercises" :key="index">
        <div
          v-if="phaseItem.exercises.length > 0"
          class="border border-on-light-accent/20 rounded-lg shadow-sm"
        >
          <!-- Phase Header -->
          <div class="bg-light px-4 py-3 border-b border-on-light-accent/20 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-primary-accent">
                  {{ phaseItem.phase }} Phase
                </h3>
                <div class="text-sm text-on-light-accent">
                  {{ getPhaseProgress(selectedPins, phaseItem.phase).completed }} of {{ getPhaseProgress(selectedPins, phaseItem.phase).total }} completed
                </div>
              </div>
              <div class="w-24 bg-white/50 rounded-full h-2 border border-on-light-accent/20">
                <div 
                  class="bg-primary-accent h-2 rounded-full transition-all duration-300"
                  :style="{ width: getPhaseProgress(selectedPins, phaseItem.phase).percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Exercise Cards -->
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <PipelineExercisesCard
                v-for="exercise in phaseItem.exercises"
                :key="exercise.originalIndex"
                :title="exercise.name"
                :stage="exercise.location.step"
                :description="exercise.description"
                :originalIndex="exercise.originalIndex"
                :has-ethics="exerciseHasEthics(exercise)"
                :ethics-completed="exerciseEthicsCompleted(exercise)"
                :is-completed="isExerciseCompleted(exercise.name)"
                @open-exercise="openExercise(exercise)"
                @open-ethics="openEthicsForExercise(exercise)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-if="selectedPins.length === 0"
        class="text-center py-12"
      >
        <div class="w-16 h-16 bg-light rounded-full flex items-center justify-center mx-auto mb-4 border border-on-light-accent/20">
          <Plus class="w-8 h-8 text-on-light-accent/60" />
        </div>
        <h3 class="text-lg font-medium text-on-light-default mb-2">No exercises in pipeline</h3>
        <p class="text-on-light-accent mb-4">Add exercises from the diamond to get started with your pipeline.</p>
        <Button @click="$emit('go-to-diamond')" variant="outline" class="border-on-light-accent text-on-light-accent hover:bg-light">
          Go to Diamond
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Check, Plus } from "lucide-vue-next";
import {
  Stepper,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import PipelineExercisesCard from "./PipelineExercisesCard.vue";
import { usePipelineProgress } from "@/composables/usePipelineProgress";
import { useEthics } from "@/composables/useEthics";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  selectedPins: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "open-exercise", exercise: SelectedPinInfo): void;
  (e: "open-ethics", exercise: SelectedPinInfo): void;
  (e: "go-to-diamond"): void;
}>();

// Composables
const { 
  isExerciseCompleted, 
  getPhaseProgress
} = usePipelineProgress();

const { 
  hasEthics, 
  isCompleted: isEthicsCompleted, 
  ensureEthicalCheckFromExercise 
} = useEthics();

// State
const currentStep = ref(1);

// Steps configuration
const steps = [
  { id: 1, title: "Discover", description: "Research and understand the problem space" },
  { id: 2, title: "Define", description: "Synthesize insights and define the challenge" },
  { id: 3, title: "Develop", description: "Ideate and create potential solutions" },
  { id: 4, title: "Deliver", description: "Test, refine, and implement the solution" },
];

// Computed properties
const phaseExercises = computed(() => [
  { phase: "Discover", exercises: props.selectedPins.filter(pin => pin.location.phase === "Discover") },
  { phase: "Define", exercises: props.selectedPins.filter(pin => pin.location.phase === "Define") },
  { phase: "Develop", exercises: props.selectedPins.filter(pin => pin.location.phase === "Develop") },
  { phase: "Deliver", exercises: props.selectedPins.filter(pin => pin.location.phase === "Deliver") },
]);

// Helper functions
const setCurrentStep = (step: number | undefined) => {
  if (step !== undefined) {
    currentStep.value = step;
  }
};

const isStepCompleted = (phase: string): boolean => {
  const progress = getPhaseProgress(props.selectedPins, phase);
  return progress.total > 0 && progress.completed === progress.total;
};

const getStepVariant = (stepNumber: number) => {
  const phase = steps[stepNumber - 1]?.title;
  if (!phase) return 'outline';
  
  const progress = getPhaseProgress(props.selectedPins, phase);
  if (progress.completed === progress.total && progress.total > 0) return 'default';
  if (progress.completed > 0) return 'secondary';
  return 'outline';
};

const getStepClasses = (stepNumber: number) => {
  const phase = steps[stepNumber - 1]?.title;
  if (!phase) return 'text-on-light-accent/60 border-on-light-accent/30';
  
  const progress = getPhaseProgress(props.selectedPins, phase);
  if (progress.completed === progress.total && progress.total > 0) {
    return 'bg-primary-accent text-white hover:bg-primary-accent/90 border-primary-accent';
  }
  if (progress.completed > 0) {
    return 'bg-primary-accent/20 text-primary-accent hover:bg-primary-accent/30 border-primary-accent/30';
  }
  return 'text-on-light-accent/60 border-on-light-accent/30 hover:bg-light';
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

// Event handlers
const openExercise = (exercise: SelectedPinInfo) => {
  emit('open-exercise', exercise);
};

const openEthicsForExercise = (exercise: SelectedPinInfo) => {
  emit('open-ethics', exercise);
};
</script> 