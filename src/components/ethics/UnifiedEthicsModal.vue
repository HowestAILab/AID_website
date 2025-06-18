<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent class="!max-w-[80vw] max-h-[90vh] overflow-hidden p-0 z-50">
      <!-- Header -->
      <div class="border-b bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center"
            >
              <Shield class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{
                  currentStep === "builder"
                    ? "Ethics Review Setup"
                    : currentStep === "review"
                    ? "Ethics Review"
                    : "View Ethics Review"
                }}
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ timing === "before" ? "Pre-Exercise" : "Post-Exercise" }}
                Ethics Check for "{{ exerciseName }}"
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
      </div>

      <!-- Content -->
      <div class="flex h-[65vh]">
        <!-- Left Panel - Context Information -->
        <div class="w-1/3 border-r bg-gray-50 overflow-y-auto">
          <div class="p-4 space-y-4">
            <!-- Exercise Info -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3
                class="font-medium text-gray-900 mb-2 flex items-center gap-2"
              >
                <FileText class="w-4 h-4" />
                Exercise Context
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Phase:</span>
                  <span class="ml-2 text-gray-600">{{
                    exerciseContext?.phase
                  }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Step:</span>
                  <span class="ml-2 text-gray-600">{{
                    exerciseContext?.step
                  }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">AI Scale:</span>
                  <span class="ml-2 text-gray-600"
                    >{{ exerciseContext?.humanAiScale }}/10</span
                  >
                </div>
              </div>
            </div>

            <!-- Chat History -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3
                class="font-medium text-gray-900 mb-2 flex items-center gap-2"
              >
                <MessageSquare class="w-4 h-4" />
                Recent Chat Activity
              </h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-if="chatHistory.length === 0"
                  class="text-sm text-gray-500 italic"
                >
                  No chat messages yet
                </div>
                <div
                  v-for="(message, index) in chatHistory.slice(-10)"
                  :key="index"
                  class="text-xs p-2 rounded border-l-2"
                  :class="
                    message.role === 'user'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-green-400 bg-green-50'
                  "
                >
                  <div class="font-medium text-gray-700 mb-1">
                    {{ message.role === "user" ? "You" : "AI" }}
                  </div>
                  <div class="text-gray-600 line-clamp-3">
                    {{ message.content }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Previous Exercise Context (for post-ethics) -->
            <div
              v-if="timing === 'after' && previousExerciseContext"
              class="bg-white rounded-lg p-4 shadow-sm"
            >
              <h3
                class="font-medium text-gray-900 mb-2 flex items-center gap-2"
              >
                <History class="w-4 h-4" />
                Previous Exercise
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Exercise:</span>
                  <span class="ml-2 text-gray-600">{{
                    previousExerciseContext.name
                  }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Messages:</span>
                  <span class="ml-2 text-gray-600"
                    >{{ previousExerciseContext.chatCount }} interactions</span
                  >
                </div>
              </div>
            </div>

            <!-- Current Ethics Settings (when not in builder) -->
            <div
              v-if="currentStep !== 'builder'"
              class="bg-white rounded-lg p-4 shadow-sm"
            >
              <h3
                class="font-medium text-gray-900 mb-2 flex items-center gap-2"
              >
                <Settings class="w-4 h-4" />
                Ethics Framework
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span class="font-medium">{{
                    selectedEthicsSettings.ethicalLens.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="font-medium">{{
                    selectedEthicsSettings.mainCapital.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="font-medium capitalize"
                    >{{ selectedEthicsSettings.zoomingState }} Focus</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Main Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Builder Step -->
          <div v-if="currentStep === 'builder'" class="p-6 space-y-6">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">
                Configure Ethics Framework
              </h3>
              <p class="text-sm text-gray-600">
                Select the ethical lens and capital focus for this review, then
                add any additional context.
              </p>
            </div>

            <!-- Ethical Lens Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Ethical Lens
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="lens in ETHICAL_LENSES"
                  :key="lens.type"
                  @click="selectedEthicsSettings.ethicalLens = lens"
                  class="p-3 border rounded-lg text-left hover:border-purple-300 transition-colors"
                  :class="
                    selectedEthicsSettings.ethicalLens.type === lens.type
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  "
                >
                  <div class="font-medium text-sm">{{ lens.name }}</div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ lens.description }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Main Capital Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Main Capital Focus
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="capital in MAIN_CAPITALS"
                  :key="capital.type"
                  @click="selectedEthicsSettings.mainCapital = capital"
                  class="p-3 border rounded-lg text-left hover:border-blue-300 transition-colors"
                  :class="
                    selectedEthicsSettings.mainCapital.type === capital.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  "
                >
                  <div class="font-medium text-sm">{{ capital.name }}</div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ capital.description }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Zooming State Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Focus Level
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="selectedEthicsSettings.zoomingState = 'in'"
                  class="p-3 border rounded-lg text-left hover:border-green-300 transition-colors"
                  :class="
                    selectedEthicsSettings.zoomingState === 'in'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  "
                >
                  <div class="font-medium text-sm">Zoom In</div>
                  <div class="text-xs text-gray-600 mt-1">
                    Focus on specific details and immediate impacts
                  </div>
                </button>
                <button
                  @click="selectedEthicsSettings.zoomingState = 'out'"
                  class="p-3 border rounded-lg text-left hover:border-green-300 transition-colors"
                  :class="
                    selectedEthicsSettings.zoomingState === 'out'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  "
                >
                  <div class="font-medium text-sm">Zoom Out</div>
                  <div class="text-xs text-gray-600 mt-1">
                    Focus on broader implications and systemic effects
                  </div>
                </button>
              </div>
            </div>

            <!-- Additional Context -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Additional Context (Optional)
              </label>
              <Textarea
                v-model="additionalContext"
                placeholder="Add any specific considerations, constraints, or context that should inform the ethics questions..."
                class="min-h-[100px] resize-none"
              />
            </div>

            <!-- Generate Questions Button -->
            <div class="pt-4">
              <Button
                @click="generateQuestions"
                :disabled="isGeneratingQuestions"
                class="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Loader2
                  v-if="isGeneratingQuestions"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <Sparkles v-else class="w-4 h-4 mr-2" />
                {{
                  isGeneratingQuestions
                    ? "Generating Questions..."
                    : "Generate Ethics Questions"
                }}
              </Button>
            </div>
          </div>

          <!-- Review Step -->
          <div v-else-if="currentStep === 'review'" class="p-6 space-y-6">
            <!-- Progress Indicator -->
            <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div
                class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {{ Math.round((answeredQuestions / totalQuestions) * 100) }}%
              </div>
              <div>
                <p class="font-medium text-blue-900">Review Progress</p>
                <p class="text-sm text-blue-700">
                  {{ answeredQuestions }} of {{ totalQuestions }} questions
                  completed
                </p>
              </div>
            </div>

            <!-- Generated Context Info -->
            <div
              v-if="additionalContext"
              class="bg-amber-50 border border-amber-200 rounded-lg p-4"
            >
              <h4 class="font-medium text-amber-900 mb-2">
                Additional Context
              </h4>
              <p class="text-sm text-amber-800">{{ additionalContext }}</p>
            </div>

            <!-- Ethics Questions -->
            <div class="space-y-6">
              <div
                v-for="(question, index) in ethicsQuestions"
                :key="question.id"
                class="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mt-1"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <label class="block font-medium text-gray-900 mb-3">
                      {{ question.question }}
                    </label>

                    <!-- Text Answer -->
                    <Textarea
                      v-if="question.type === 'text'"
                      v-model="responses[question.id]"
                      placeholder="Share your thoughts and considerations..."
                      class="min-h-[100px] resize-none"
                      :class="
                        responses[question.id]
                          ? 'border-green-300 bg-green-50'
                          : ''
                      "
                    />

                    <!-- Answer Status -->
                    <div class="mt-3 flex items-center gap-2">
                      <CheckCircle2
                        v-if="responses[question.id]"
                        class="w-4 h-4 text-green-600"
                      />
                      <AlertCircle v-else class="w-4 h-4 text-orange-500" />
                      <span
                        class="text-xs"
                        :class="
                          responses[question.id]
                            ? 'text-green-600'
                            : 'text-orange-500'
                        "
                      >
                        {{ responses[question.id] ? "Completed" : "Required" }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- View/Edit Step -->
          <div v-else-if="currentStep === 'view'" class="p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditingExisting ? "Edit" : "View" }} Ethics Review
              </h3>
              <div class="flex gap-2">
                <Button
                  v-if="!isEditingExisting"
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
                  <Button @click="cancelEditing" variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            <!-- Questions and Responses -->
            <div class="space-y-4">
              <div
                v-for="(question, index) in ethicsQuestions"
                :key="`view-${question.id}`"
                class="bg-white border rounded-lg p-4"
              >
                <div class="space-y-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h6 class="font-medium text-gray-900 mb-2">
                        Question {{ index + 1 }}
                      </h6>
                      <p class="text-sm text-gray-700 leading-relaxed">
                        {{ question.question }}
                      </p>
                    </div>
                  </div>

                  <!-- Response Display/Edit -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700"
                      >Response:</label
                    >
                    <div
                      v-if="!isEditingExisting"
                      class="bg-gray-50 rounded p-3 text-sm text-gray-800"
                    >
                      {{
                        getExistingResponse(question.id) ||
                        "No response provided"
                      }}
                    </div>
                    <textarea
                      v-else
                      v-model="responses[question.id]"
                      class="w-full min-h-[100px] p-3 border rounded-md text-sm resize-y"
                      :placeholder="`Enter your response to question ${
                        index + 1
                      }...`"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Completion Status -->
            <div v-if="existingCompletedAt" class="bg-green-50 rounded-lg p-4">
              <div class="flex items-center gap-2 text-green-800">
                <CheckCircle2 class="w-4 h-4" />
                <span class="font-medium">Review Completed</span>
              </div>
              <p class="text-sm text-green-700 mt-1">
                Completed on {{ formatDate(existingCompletedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t bg-gray-50 p-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <span v-if="currentStep === 'builder'">
              Configure your ethics framework to generate relevant questions
            </span>
            <span v-else-if="currentStep === 'review'">
              Complete all questions to proceed with the
              {{ timing === "before" ? "exercise" : "next step" }}
            </span>
            <span v-else>
              {{
                isEditingExisting
                  ? "Edit your responses"
                  : "View completed ethics review"
              }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <Button
              variant="outline"
              @click="handleCancel"
              :disabled="isSubmitting || isGeneratingQuestions"
            >
              Cancel
            </Button>

            <!-- Builder Step Button -->
            <Button
              v-if="currentStep === 'builder'"
              @click="generateQuestions"
              :disabled="isGeneratingQuestions"
              class="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Loader2
                v-if="isGeneratingQuestions"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <Sparkles v-else class="w-4 h-4 mr-2" />
              Generate Questions
            </Button>

            <!-- Review Step Button -->
            <Button
              v-else-if="currentStep === 'review'"
              @click="handleSubmit"
              :disabled="!isFormComplete || isSubmitting"
              class="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              <Shield v-else class="w-4 h-4 mr-2" />
              {{ isSubmitting ? "Saving..." : "Complete Ethics Review" }}
            </Button>

            <!-- View Step Buttons -->
            <template v-else-if="currentStep === 'view'">
              <Button
                v-if="!isEditingExisting"
                @click="startEditing"
                class="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Pencil class="w-4 h-4 mr-2" />
                Edit Review
              </Button>
              <Button
                v-else
                @click="saveChanges"
                :disabled="!hasChanges || isSubmitting"
                class="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Loader2
                  v-if="isSubmitting"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <Save v-else class="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </template>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  MessageSquare,
  History,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Pencil,
  Save,
} from "lucide-vue-next";

import { ETHICAL_LENSES, MAIN_CAPITALS } from "@/types/ethics";
import type { EthicalSettings, EthicalLens, MainCapital } from "@/types/ethics";

export interface EthicsQuestion {
  id: string;
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
  required: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ExerciseContext {
  name: string;
  phase: string;
  step: string;
  humanAiScale: number;
  description?: string;
}

export interface PreviousExerciseContext {
  name: string;
  chatCount: number;
  outcomes?: string[];
}

const props = defineProps<{
  open: boolean;
  mode: "new" | "view" | "edit"; // Mode determines the initial step
  exerciseName: string;
  timing: "before" | "after";
  exerciseContext: ExerciseContext;
  chatHistory: ChatMessage[];
  previousExerciseContext?: PreviousExerciseContext;
  existingEthicsData?: {
    settings: EthicalSettings;
    questions: EthicsQuestion[];
    responses: Record<string, any>;
    completedAt?: number;
    additionalContext?: string;
  };
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (
    e: "submit",
    data: {
      settings: EthicalSettings;
      questions: EthicsQuestion[];
      responses: Record<string, any>;
      additionalContext?: string;
    }
  ): void;
  (e: "cancel"): void;
}>();

// State management
const isOpen = ref(props.open);
const currentStep = ref<"builder" | "review" | "view">("builder");
const isGeneratingQuestions = ref(false);
const isSubmitting = ref(false);
const isEditingExisting = ref(false);

// Ethics configuration
const selectedEthicsSettings = reactive<EthicalSettings>({
  ethicalLens: ETHICAL_LENSES[0],
  mainCapital: MAIN_CAPITALS[0],
  zoomingState: "in" as const,
});

const additionalContext = ref("");
const ethicsQuestions = ref<EthicsQuestion[]>([]);
const responses = reactive<Record<string, any>>({});
const originalResponses = ref<Record<string, any>>({});

// Computed properties
const totalQuestions = computed(() => ethicsQuestions.value.length);

const answeredQuestions = computed(() => {
  return Object.keys(responses).filter((key) => {
    const value = responses[key];
    return value !== undefined && value !== null && value !== "";
  }).length;
});

const isFormComplete = computed(() => {
  return ethicsQuestions.value.every((q) => {
    const value = responses[q.id];
    return q.required
      ? value !== undefined && value !== null && value !== ""
      : true;
  });
});

const hasChanges = computed(() => {
  if (!isEditingExisting.value) return false;
  return Object.keys(responses).some((key) => {
    return originalResponses.value[key] !== responses[key];
  });
});

const existingCompletedAt = computed(() => {
  return props.existingEthicsData?.completedAt;
});

// Initialize component based on mode
const initializeComponent = () => {
  if (props.mode === "new") {
    currentStep.value = "builder";
    // Reset to defaults
    Object.assign(selectedEthicsSettings, {
      ethicalLens: ETHICAL_LENSES[0],
      mainCapital: MAIN_CAPITALS[0],
      zoomingState: "in" as const,
    });
    additionalContext.value = "";
    ethicsQuestions.value = [];
    Object.keys(responses).forEach((key) => delete responses[key]);
  } else if (props.mode === "view" || props.mode === "edit") {
    currentStep.value = "view";
    isEditingExisting.value = props.mode === "edit";

    if (props.existingEthicsData) {
      // Load existing data
      Object.assign(selectedEthicsSettings, props.existingEthicsData.settings);
      additionalContext.value =
        props.existingEthicsData.additionalContext || "";
      ethicsQuestions.value = props.existingEthicsData.questions;

      // Load responses
      Object.keys(responses).forEach((key) => delete responses[key]);
      Object.assign(responses, props.existingEthicsData.responses);
      originalResponses.value = { ...props.existingEthicsData.responses };
    }
  }
};

// Generate questions using AI (mock implementation for now)
const generateQuestions = async () => {
  isGeneratingQuestions.value = true;

  try {
    // Simulate AI question generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock questions based on settings and context
    const baseQuestions = generateMockQuestions();
    ethicsQuestions.value = baseQuestions;
    currentStep.value = "review";
  } catch (error) {
    console.error("Error generating questions:", error);
  } finally {
    isGeneratingQuestions.value = false;
  }
};

// Generate mock questions based on current settings
const generateMockQuestions = (): EthicsQuestion[] => {
  const { ethicalLens, mainCapital, zoomingState } = selectedEthicsSettings;
  const timing = props.timing;
  const context = additionalContext.value;

  const questions: EthicsQuestion[] = [];

  // Base questions based on lens
  if (ethicalLens.type === "virtue") {
    questions.push({
      id: `${props.exerciseName}-${timing}-virtue-1`,
      question: `What character traits and virtues should guide your approach to this ${
        timing === "before" ? "upcoming" : "completed"
      } exercise?`,
      type: "text",
      required: true,
    });
  } else if (ethicalLens.type === "consequentialist") {
    questions.push({
      id: `${props.exerciseName}-${timing}-consequentialist-1`,
      question: `What are the potential consequences and outcomes of this ${
        timing === "before" ? "exercise approach" : "exercise"
      }, and how do they align with ethical principles?`,
      type: "text",
      required: true,
    });
  } else if (ethicalLens.type === "care") {
    questions.push({
      id: `${props.exerciseName}-${timing}-care-1`,
      question: `How does this ${
        timing === "before" ? "exercise plan" : "exercise"
      } demonstrate care and consideration for all stakeholders and relationships involved?`,
      type: "text",
      required: true,
    });
  }

  // Questions based on capital focus
  if (mainCapital.type === "human") {
    questions.push({
      id: `${props.exerciseName}-${timing}-human-capital-1`,
      question: `How does this ${
        timing === "before" ? "exercise" : "exercise outcome"
      } impact human wellbeing, skills development, and personal growth?`,
      type: "text",
      required: true,
    });
  } else if (mainCapital.type === "economic") {
    questions.push({
      id: `${props.exerciseName}-${timing}-economic-capital-1`,
      question: `What are the economic implications and financial considerations of this ${
        timing === "before" ? "exercise approach" : "exercise"
      }?`,
      type: "text",
      required: true,
    });
  } else if (mainCapital.type === "natural") {
    questions.push({
      id: `${props.exerciseName}-${timing}-natural-capital-1`,
      question: `How does this ${
        timing === "before" ? "exercise" : "exercise outcome"
      } affect environmental sustainability and natural resources?`,
      type: "text",
      required: true,
    });
  }

  // Questions based on zoom level
  if (zoomingState === "in") {
    questions.push({
      id: `${props.exerciseName}-${timing}-zoom-in-1`,
      question: `What specific, immediate ethical considerations should be addressed in the details of this ${
        timing === "before" ? "exercise" : "exercise outcome"
      }?`,
      type: "text",
      required: true,
    });
  } else {
    questions.push({
      id: `${props.exerciseName}-${timing}-zoom-out-1`,
      question: `What broader systemic and long-term ethical implications arise from this ${
        timing === "before" ? "exercise approach" : "exercise"
      }?`,
      type: "text",
      required: true,
    });
  }

  // Context-specific question if additional context was provided
  if (context.trim()) {
    questions.push({
      id: `${props.exerciseName}-${timing}-context-1`,
      question: `Considering the additional context you provided ("${context.trim()}"), what specific ethical considerations arise?`,
      type: "text",
      required: true,
    });
  }

  return questions;
};

// Get existing response for view mode
const getExistingResponse = (questionId: string): string => {
  return props.existingEthicsData?.responses?.[questionId] || "";
};

// Format date
const formatDate = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

// Event handlers
const handleOpenChange = (open: boolean) => {
  if (!open && !isSubmitting.value && !isGeneratingQuestions.value) {
    emit("update:open", false);
  }
};

const handleSubmit = async () => {
  if (!isFormComplete.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    emit("submit", {
      settings: selectedEthicsSettings,
      questions: ethicsQuestions.value,
      responses: { ...responses },
      additionalContext: additionalContext.value,
    });

    isOpen.value = false;
    emit("update:open", false);
  } catch (error) {
    console.error("Error submitting ethics review:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (!isSubmitting.value && !isGeneratingQuestions.value) {
    emit("cancel");
    isOpen.value = false;
    emit("update:open", false);
  }
};

const startEditing = () => {
  isEditingExisting.value = true;
  originalResponses.value = { ...responses };
};

const cancelEditing = () => {
  isEditingExisting.value = false;
  // Restore original responses
  Object.keys(responses).forEach((key) => delete responses[key]);
  Object.assign(responses, originalResponses.value);
};

const saveChanges = async () => {
  if (!hasChanges.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    emit("submit", {
      settings: selectedEthicsSettings,
      questions: ethicsQuestions.value,
      responses: { ...responses },
      additionalContext: additionalContext.value,
    });

    isEditingExisting.value = false;
    originalResponses.value = { ...responses };
  } catch (error) {
    console.error("Error saving changes:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watchers
watch(
  () => props.open,
  (value) => {
    isOpen.value = value;
    if (value) {
      initializeComponent();
    }
  }
);

watch(
  () => props.mode,
  () => {
    if (props.open) {
      initializeComponent();
    }
  }
);

// Initialize on mount
onMounted(() => {
  if (props.open) {
    initializeComponent();
  }
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
