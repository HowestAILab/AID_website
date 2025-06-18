<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      class="!max-w-[80vw] max-h-[90vh] overflow-hidden p-0 z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="border-b bg-light p-6 flex-shrink-0">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-primary-accent rounded-full flex items-center justify-center"
            >
              <BookOpen class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-on-light-default">
                {{ exercise?.name || "Exercise Details" }}
              </h2>
              <p class="text-sm text-on-light-accent mt-1">
                <span class="font-medium">{{ exercise?.location.phase }}</span>
                •
                <span class="font-medium">{{ exercise?.location.step }}</span> •
                <span class="font-medium"
                  >AI Scale: {{ exercise?.location.human_ai_scale }}/10</span
                >
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
      </div>

      <!-- Content -->
      <div class="flex flex-1 min-h-0">
        <!-- Left Panel - Navigation -->
        <div class="w-1/4 border-r bg-gray-50 overflow-y-auto">
          <div class="p-4 space-y-2">
            <button
              v-for="section in sections"
              :key="section.key"
              @click="activeSection = section.key"
              class="w-full text-left p-3 rounded-lg transition-colors"
              :class="
                activeSection === section.key
                  ? 'bg-primary-accent text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              "
            >
              <div class="flex items-center gap-3">
                <component :is="section.icon" class="w-4 h-4" />
                <span class="font-medium text-sm">{{ section.title }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Right Panel - Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <!-- Description Section -->
            <div v-if="activeSection === 'description'" class="space-y-6">
              <div class="space-y-4">
                <h3
                  class="text-lg font-semibold text-on-light-default flex items-center gap-2"
                >
                  <FileText class="w-5 h-5" />
                  Description
                </h3>
                <div class="bg-white rounded-lg p-4 border">
                  <p class="text-gray-700 leading-relaxed">
                    {{ exercise?.description }}
                  </p>
                </div>
              </div>

              <!-- Prompt Examples (if available) -->
              <div
                v-if="
                  exercise?.prompt_example && exercise.prompt_example.length > 0
                "
                class="space-y-4"
              >
                <h4
                  class="text-md font-semibold text-on-light-default flex items-center gap-2"
                >
                  <MessageSquare class="w-4 h-4" />
                  Example Prompts
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(prompt, index) in exercise.prompt_example"
                    :key="index"
                    class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg"
                  >
                    <p class="text-blue-800 italic">{{ prompt }}</p>
                  </div>
                </div>
              </div>

              <!-- Miro Board Link -->
              <div v-if="exercise?.miro_board" class="space-y-4">
                <h4
                  class="text-md font-semibold text-on-light-default flex items-center gap-2"
                >
                  <ExternalLink class="w-4 h-4" />
                  Miro Board
                </h4>
                <div class="bg-white rounded-lg border p-4">
                  <a
                    :href="exercise.miro_board"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-primary-accent hover:underline"
                  >
                    <ExternalLink class="w-4 h-4" />
                    Open in Miro
                  </a>
                </div>
              </div>
            </div>

            <!-- How to Run Section -->
            <div v-else-if="activeSection === 'howToRun'" class="space-y-6">
              <div class="space-y-4">
                <h3
                  class="text-lg font-semibold text-on-light-default flex items-center gap-2"
                >
                  <Play class="w-5 h-5" />
                  How to Run
                </h3>
                <div class="bg-white rounded-lg border">
                  <ol class="divide-y divide-gray-200">
                    <li
                      v-for="(step, index) in exercise?.how_to_run"
                      :key="index"
                      class="p-4 flex items-start gap-4"
                    >
                      <div
                        class="w-6 h-6 bg-primary-accent text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5"
                      >
                        {{ index + 1 }}
                      </div>
                      <p class="text-gray-700 leading-relaxed">{{ step }}</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Expected Outcomes Section -->
            <div v-else-if="activeSection === 'outcomes'" class="space-y-6">
              <div class="space-y-4">
                <h3
                  class="text-lg font-semibold text-on-light-default flex items-center gap-2"
                >
                  <Target class="w-5 h-5" />
                  Expected Outcomes
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="(outcome, index) in exercise?.expected_outcomes"
                    :key="index"
                    class="bg-white rounded-lg border p-4 flex items-start gap-3"
                  >
                    <CheckCircle
                      class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    />
                    <p class="text-gray-700 leading-relaxed">{{ outcome }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Human-AI Collaboration Section -->
            <div
              v-else-if="activeSection === 'collaboration'"
              class="space-y-6"
            >
              <div class="space-y-4">
                <h3
                  class="text-lg font-semibold text-on-light-default flex items-center gap-2"
                >
                  <Users class="w-5 h-5" />
                  Human-AI Collaboration
                </h3>

                <!-- AI Scale Indicator -->
                <div class="bg-white rounded-lg border p-4">
                  <h4 class="font-medium text-gray-900 mb-3">
                    AI Involvement Scale
                  </h4>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-600">Human</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        :style="{
                          width: `${
                            (exercise?.location.human_ai_scale || 0) * 10
                          }%`,
                        }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-600">AI</span>
                    <span class="text-sm font-medium text-gray-900">
                      {{ exercise?.location.human_ai_scale }}/10
                    </span>
                  </div>
                </div>

                <!-- Role Breakdown -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Human Role -->
                  <div class="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <h4
                      class="font-medium text-blue-900 mb-3 flex items-center gap-2"
                    >
                      <User class="w-4 h-4" />
                      Human Role
                    </h4>
                    <p class="text-blue-800 text-sm leading-relaxed">
                      {{ exercise?.human_ai_collaboration?.human_role }}
                    </p>
                  </div>

                  <!-- AI Role -->
                  <div
                    class="bg-purple-50 rounded-lg border border-purple-200 p-4"
                  >
                    <h4
                      class="font-medium text-purple-900 mb-3 flex items-center gap-2"
                    >
                      <Bot class="w-4 h-4" />
                      AI Role
                    </h4>
                    <p class="text-purple-800 text-sm leading-relaxed">
                      {{ exercise?.human_ai_collaboration?.ai_role }}
                    </p>
                  </div>
                </div>

                <!-- Collaboration Notes -->
                <div class="bg-gray-50 rounded-lg border p-4">
                  <h4
                    class="font-medium text-gray-900 mb-3 flex items-center gap-2"
                  >
                    <Info class="w-4 h-4" />
                    Collaboration Notes
                  </h4>
                  <p class="text-gray-700 text-sm leading-relaxed">
                    {{ exercise?.human_ai_collaboration?.collaboration_notes }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t bg-gray-50 p-6 flex-shrink-0">
        <div class="flex items-center justify-end">
          <Button @click="handleClose" variant="outline"> Close </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Play,
  Target,
  Users,
  User,
  Bot,
  Info,
  CheckCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-vue-next";
import type { Exercise } from "@/types/exercise";

export interface ExerciseSpecificModalProps {
  open: boolean;
  exercise: Exercise | null;
}

const props = defineProps<ExerciseSpecificModalProps>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

// State management
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const activeSection = ref<string>("description");

// Navigation sections
const sections = computed(() => [
  {
    key: "description",
    title: "Description",
    icon: FileText,
  },
  {
    key: "howToRun",
    title: "How to Run",
    icon: Play,
  },
  {
    key: "outcomes",
    title: "Expected Outcomes",
    icon: Target,
  },
  {
    key: "collaboration",
    title: "Human-AI Collaboration",
    icon: Users,
  },
]);

// Event handlers
const handleOpenChange = (open: boolean) => {
  if (!open) {
    handleClose();
  }
};

const handleClose = () => {
  activeSection.value = "description"; // Reset to default section
  emit("update:open", false);
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
