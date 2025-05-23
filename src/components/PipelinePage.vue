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
                class="size-10 rounded-full shrink-0"
                :class="[
                  index + 1 <= currentStep ? 'bg-[#F59E0C] text-white hover:bg-[#F59E0C]/90' : 'text-muted-foreground'
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, Check } from 'lucide-vue-next';
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentStep = ref(1);

const steps = [
  {
    id: 1,
    title: 'Discover',
    description: 'Research and understand the problem space'
  },
  {
    id: 2,
    title: 'Define',
    description: 'Synthesize insights and define the challenge'
  },
  {
    id: 3,
    title: 'Develop',
    description: 'Ideate and create potential solutions'
  },
  {
    id: 4,
    title: 'Deliver',
    description: 'Test, refine, and implement the solution'
  }
];

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