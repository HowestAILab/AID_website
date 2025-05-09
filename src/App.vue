<template>
  <Toaster />
  <main class="h-screen px-6 pb-6 pt-10 flex flex-col overflow-hidden">
    <div class="relative flex items-end">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button class="flex items-center z-10 rounded-t-lg rounded-b-none">
            <h2 class="text-3xl font-bold mr-2">
              {{ currentViewFormatted }}
            </h2>
            <Icon icon="heroicons:chevron-up-down-16-solid" class="w-7 h-7" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem @click="setView('Catalog')">Catalog</DropdownMenuItem>
          <DropdownMenuItem @click="setView('DoubleDiamond')">Double Diamond</DropdownMenuItem>
          <DropdownMenuItem @click="setView('Workflow')" :disabled="selectedTools.length === 0">Workflow</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Stepper
        v-if="currentView === 'Workflow'"
        class="absolute left-1/2 -translate-x-1/2 bottom-0"
      >
        <template v-for="(tool, index) in selectedTools" :key="tool.name">
          <StepperItem :step="index + 1">
            <StepperTrigger @click="handleStepClick(tool)">
              <StepperIndicator>
                <Icon :icon="tool.icon" />
              </StepperIndicator>
              <StepperTitle>{{ tool.name }}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator v-if="index < selectedTools.length - 1" />
          </StepperItem>
        </template>
      </Stepper>
    </div>
    <div class="flex-1 h-full">
      <Catalog v-if="currentView === 'Catalog'" class="border rounded-tr-xl rounded-br-xl rounded-bl-xl" />
      <DoubleDiamond v-else-if="currentView === 'DoubleDiamond'" class="border rounded-xl" />
      <Workflow v-else-if="currentView === 'Workflow'" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch } from "vue";
import Workflow from "./pages/Workflow.vue";
import DoubleDiamond from "./pages/DoubleDiamond.vue";
import Catalog from "./pages/Catalog.vue";
import { Icon } from "@iconify/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import dummyData from "../dummy.json";

interface Tool {
  name: string;
  description: string;
  icon: string;
  location: number[];
  diamond_position: string;
  color: string;
  prompt_list: string[];
  ethical: {
    before: string[];
    after: string[];
  };
}

const validViews = ['Catalog', 'DoubleDiamond', 'Workflow'] as const;
type View = typeof validViews[number];

const currentView = ref<View>('DoubleDiamond');

const currentViewFormatted = computed(() => {
  switch (currentView.value) {
    case 'Catalog':
      return 'Catalog';
    case 'DoubleDiamond':
      return 'Double Diamond';
    case 'Workflow':
      return 'Workflow';
    default:
      return '';
  }
});

const tools: Tool[] = Array.isArray(dummyData.tools) ? dummyData.tools as Tool[] : [];

provide('tools', tools);

const selectedPinIndices = computed<number[]>(() => {
  const savedSelection = localStorage.getItem('selectedDiagramPinIndices');
  if (savedSelection) {
    try {
      const parsed = JSON.parse(savedSelection);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
        return parsed as number[];
      }
      return [];
    } catch {
      return [];
    }
  }
  return [];
});

const selectedTools = computed(() => {
  return selectedPinIndices.value
    .map((index: number) => tools[index])
    .filter((tool: Tool | undefined) => tool) as Tool[];
});

const currentStep = ref(selectedPinIndices.value.length > 0 ? selectedPinIndices.value[0] : -1);

watch(currentView, (newView) => {
  if (newView === 'Workflow') {
    if (selectedTools.value.length === 0) {
      currentStep.value = -1;
    } else {
      if (!selectedPinIndices.value.includes(currentStep.value)) {
        currentStep.value = selectedPinIndices.value[0];
      }
    }
  }
});

provide('currentStep', currentStep);

const setView = (view: View) => {
  if (validViews.includes(view)) {
    currentView.value = view;
  }
};

const handleStepClick = (clickedTool: any) => {
  const originalIndex = tools.findIndex(t => t === clickedTool);
  if (originalIndex !== -1) {
    currentStep.value = originalIndex;
  }
};
</script>
