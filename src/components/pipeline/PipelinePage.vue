<template>
  <div class="flex-1 bg-white flex flex-col">
    <div class="flex items-center p-4">
      <button
        @click="$emit('close')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft />
        <h1 class="ml-2 text-lg font-medium">Back to diamond</h1>
      </button>
    </div>

    <div class="p-4 space-y-8">
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
                :variant="index + 1 <= currentStep ? 'default' : 'outline'"
                size="icon"
                class="size-10 rounded-full shrink-0 cursor-pointer"
                :class="[
                  index + 1 <= currentStep
                    ? 'bg-[#F59E0C] text-white hover:bg-[#F59E0C]/90'
                    : 'text-muted-foreground',
                ]"
              >
                <Check v-if="index + 1 < currentStep" class="size-5" />
                <span v-else>{{ index + 1 }}</span>
              </Button>
            </StepperTrigger>

            <div class="mt-2 text-center">
              <StepperTitle class="text-sm font-medium text-foreground">
                {{ step.title }}
              </StepperTitle>
            </div>

            <StepperSeparator
              v-if="index < steps.length - 1"
              class="absolute left-[calc(50%+20px)] top-5 block h-0.5 w-[calc(100%-40px)] shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
            />
          </StepperItem>
        </Stepper>
      </div>
      <div>
        <div v-for="(phaseItem, index) in phaseExercises" :key="index">
          <div v-if="phaseItem.exercises.length > 0" class="border p-4 rounded-lg shadow-md mb-4">
            <div>
              <p class="text-[#D97704] mb-4 text-xl">{{ phaseItem.phase }} Phase</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <PipelineExercisesCard
                v-for="exercise in phaseItem.exercises"
                :key="exercise.originalIndex"
                :title="exercise.name"
                :stage="exercise.location.step"
                :description="exercise.description"
                :originalIndex="exercise.originalIndex"
                @open-exercise="$emit('open-exercise-detail', exercise)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ArrowLeft,
  Check
} from "lucide-vue-next";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import PipelineExercisesCard from "./PipelineExercisesCard.vue";
import type { DriveType } from "@/types/exercise";

// Define the structure of a selected pin
interface SelectedPin {
  name: string;
  originalIndex: number;
  order: number;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

const props = defineProps<{
  selectedPins: SelectedPin[]; // Prop to receive selected pins
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "open-exercise-detail", exercise: SelectedPin): void;
}>();

const getDriveType = (scale: number | undefined): DriveType => {
  if (scale === undefined) return 'human';
  if (scale >= 0 && scale <= 3) return 'human';
  if (scale >= 4 && scale <= 7) return 'human-ai';
  return 'ai';
};

const currentStep = ref(1);

const steps = [
  {
    id: 1,
    title: "Discover",
    description: "Research and understand the problem space",
  },
  {
    id: 2,
    title: "Define",
    description: "Synthesize insights and define the challenge",
  },
  {
    id: 3,
    title: "Develop",
    description: "Ideate and create potential solutions",
  },
  {
    id: 4,
    title: "Deliver",
    description: "Test, refine, and implement the solution",
  },
];

// Computed properties to filter exercises by phase
const discoverExercises = computed(() =>
  props.selectedPins.filter((pin) => pin.location.phase === "Discover")
);
const defineExercises = computed(() =>
  props.selectedPins.filter((pin) => pin.location.phase === "Define")
);
const developExercises = computed(() =>
  props.selectedPins.filter((pin) => pin.location.phase === "Develop")
);
const deliverExercises = computed(() =>
  props.selectedPins.filter((pin) => pin.location.phase === "Deliver")
);

const phaseExercises = computed(() => [
  { phase: "Discover", exercises: discoverExercises.value },
  { phase: "Define", exercises: defineExercises.value },
  { phase: "Develop", exercises: developExercises.value },
  { phase: "Deliver", exercises: deliverExercises.value },
]);

const setCurrentStep = (step: number | undefined) => {
  if (step !== undefined) {
    currentStep.value = step;
  }
};

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};
</script> 