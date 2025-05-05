<template>
  <Toaster />
  <main class="h-screen p-6 flex flex-col overflow-hidden">
    <div class="relative flex items-end">
      <div
        class="flex items-center cursor-pointer pr-4 z-10"
        @click="toggleView"
      >
        <h2 class="text-3xl font-bold">
          {{ showDoubleDiamond ? "Double Diamond" : "Workflow" }}
        </h2>
        <Icon icon="heroicons:chevron-up-down-16-solid" class="w-7 h-7" />
      </div>
      <Stepper class="absolute left-1/2 -translate-x-1/2 bottom-0">
        <StepperItem :step="1">
          <StepperTrigger>
            <StepperIndicator
              ><Icon icon="streamline:magnifying-glass-solid"
            /></StepperIndicator>
            <StepperTitle>User research</StepperTitle>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
        <StepperItem :step="2">
          <StepperTrigger>
            <StepperIndicator><Icon icon="line-md:person-filled" /></StepperIndicator>
            <StepperTitle>Personas</StepperTitle>
          </StepperTrigger>
        </StepperItem>
      </Stepper>
    </div>
    <div class="flex-1 h-full overflow-hidden">
      <DoubleDiamond v-if="showDoubleDiamond" class="border rounded-xl" />
      <Workflow v-else />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Workflow from "./pages/Workflow.vue";
import DoubleDiamond from "./pages/DoubleDiamond.vue";
import { Icon } from "@iconify/vue";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Toaster } from "@/components/ui/sonner";

const showDoubleDiamond = ref(true);

const toggleView = () => {
  showDoubleDiamond.value = !showDoubleDiamond.value;
};
</script>
