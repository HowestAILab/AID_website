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
              <Shield class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-on-light-default">
                {{
                  currentStep === "builder"
                    ? "Ethics Review Setup"
                    : currentStep === "review"
                    ? "Ethics Review"
                    : "View Ethics Review"
                }}
              </h2>
              <p class="text-sm text-on-light-accent mt-1">
                <span class="font-medium capitalize">{{ activeTiming }}</span>
                -Exercise Ethics Check for "{{ exerciseName }}"
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <!-- Timing Switcher -->
        <div v-if="availableTimings && availableTimings.length > 1" class="mt-4">
          <div class="flex gap-2 p-1 bg-on-light-accent/10 rounded-lg">
            <Button
              v-for="timing in availableTimings"
              :key="timing"
              @click="activeTiming = timing"
              :variant="activeTiming === timing ? 'default' : 'ghost'"
              class="flex-1 justify-center gap-2"
              :class="{
                'bg-primary-accent text-white hover:bg-primary-accent/90':
                  activeTiming === timing,
                'hover:bg-primary-accent/10': activeTiming !== timing,
              }"
            >
              <CheckCircle2
                v-if="getTimingStatus(timing).isCompleted"
                class="w-4 h-4"
              />
              <span>{{
                timing === "before" ? "Pre-Exercise" : "Post-Exercise"
              }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 min-h-0">
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
              v-if="activeTiming === 'after' && previousExerciseContext"
              class="bg-white rounded-lg p-4 shadow-sm border border-on-light-accent/10"
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

            <!-- Current Ethics Settings (when not in builder and not editing) -->
            <div
              v-if="currentStep !== 'builder' && !isEditingExisting"
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
                  <div class="w-3 h-3 bg-primary-accent/80 rounded-full"></div>
                  <span class="font-medium">{{
                    selectedEthicsSettings.ethicalLens.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-primary-accent/60 rounded-full"></div>
                  <span class="font-medium">{{
                    selectedEthicsSettings.mainCapital.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-primary-accent/40 rounded-full"></div>
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
          <div
            v-if="
              currentStep === 'builder' ||
              (currentStep === 'view' && isEditingExisting)
            "
            class="p-6 space-y-6"
          >
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-on-light-default">
                {{
                  isEditingExisting
                    ? "Modify Ethics Framework"
                    : "Configure Ethics Framework"
                }}
              </h3>
              <p class="text-sm text-on-light-accent">
                {{
                  isEditingExisting
                    ? "Update the framework to regenerate the ethics questions for this review."
                    : "Select the ethical lens and capital focus for this review, then add any additional context."
                }}
              </p>
            </div>

            <!-- Ethical Lens Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-on-light-default">
                Ethical Lens
              </label>
              <div class="grid grid-cols-2 gap-3">
                <TooltipProvider
                  v-for="lens in ETHICAL_LENSES"
                  :key="lens.type"
                >
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        @click="selectedEthicsSettings.ethicalLens = lens"
                        class="p-3 border rounded-lg text-left hover:border-primary-accent/40 transition-colors"
                        :class="
                          selectedEthicsSettings.ethicalLens.type === lens.type
                            ? 'border-primary-accent bg-primary-accent/10'
                            : 'border-on-light-accent/20'
                        "
                      >
                        <div class="font-medium text-sm flex items-center gap-2">
                          {{ lens.name }}
                          <span
                            v-if="suggestions?.lens === lens.type"
                            class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                            >Suggested</span
                          >
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p class="max-w-xs">{{ lens.description }}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <!-- Main Capital Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-on-light-default">
                Main Capital Focus
              </label>
              <div class="grid grid-cols-3 gap-3">
                <TooltipProvider
                  v-for="capital in MAIN_CAPITALS"
                  :key="capital.type"
                >
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        @click="selectedEthicsSettings.mainCapital = capital"
                        class="p-3 border rounded-lg text-left hover:border-primary-accent/40 transition-colors"
                        :class="
                          selectedEthicsSettings.mainCapital.type ===
                          capital.type
                            ? 'border-primary-accent bg-primary-accent/10'
                            : 'border-on-light-accent/20'
                        "
                      >
                        <div
                          class="font-medium text-sm flex items-center gap-2"
                        >
                          {{ capital.name }}
                          <span
                            v-if="suggestions?.capital === capital.type"
                            class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                            >Suggested</span
                          >
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p class="max-w-xs">{{ capital.description }}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <!-- Zooming State Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-on-light-default">
                Focus Level
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="selectedEthicsSettings.zoomingState = 'in'"
                  class="p-3 border rounded-lg text-left hover:border-primary-accent/40 transition-colors"
                  :class="
                    selectedEthicsSettings.zoomingState === 'in'
                      ? 'border-primary-accent bg-primary-accent/10'
                      : 'border-on-light-accent/20'
                  "
                >
                  <div class="font-medium text-sm">Zoom In</div>
                  <div class="text-xs text-on-light-accent mt-1">
                    Focus on specific details and immediate impacts
                  </div>
                </button>
                <button
                  @click="selectedEthicsSettings.zoomingState = 'out'"
                  class="p-3 border rounded-lg text-left hover:border-primary-accent/40 transition-colors"
                  :class="
                    selectedEthicsSettings.zoomingState === 'out'
                      ? 'border-primary-accent bg-primary-accent/10'
                      : 'border-on-light-accent/20'
                  "
                >
                  <div class="font-medium text-sm">Zoom Out</div>
                  <div class="text-xs text-on-light-accent mt-1">
                    Focus on broader implications and systemic effects
                  </div>
                </button>
              </div>
            </div>

            <!-- Additional Context -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-on-light-default">
                Additional Context (Optional)
              </label>
              <Textarea
                v-model="additionalContext"
                placeholder="Add any specific considerations, constraints, or context that should inform the ethics questions..."
                class="min-h-[100px] resize-none"
              />
            </div>

            <!-- Generate Questions Button -->
            <div
              v-if="currentStep === 'builder' || frameworkModified"
              class="pt-4"
            >
              <Button
                @click="generateQuestions"
                :disabled="isGeneratingQuestions"
                class="w-full bg-primary-accent hover:bg-primary-accent/90 text-white"
              >
                <Loader2
                  v-if="isGeneratingQuestions"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <component
                  :is="frameworkModified ? RefreshCw : Sparkles"
                  class="w-4 h-4 mr-2"
                />
                {{
                  isGeneratingQuestions
                    ? "Generating..."
                    : frameworkModified
                    ? "Regenerate Questions with New Framework"
                    : "Generate Ethics Questions"
                }}
              </Button>
              <p
                v-if="frameworkModified"
                class="text-xs text-on-light-accent text-center mt-2"
              >
                Changing the framework will clear existing responses and create
                a new set of questions.
              </p>
            </div>
          </div>

          <!-- Review Step -->
          <div v-else-if="currentStep === 'review'" class="p-6 space-y-6">
            <!-- Progress Indicator -->
            <div
              class="flex items-center gap-3 p-4 bg-primary-accent/10 rounded-lg"
            >
              <div
                class="w-12 h-12 bg-primary-accent rounded-full flex items-center justify-center text-white font-semibold"
              >
                {{ Math.round((answeredQuestions / totalQuestions) * 100) }}%
              </div>
              <div>
                <p class="font-medium text-primary-accent">Review Progress</p>
                <p class="text-sm text-on-light-accent">
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
                          ? 'border-green-300 bg-green-50/80'
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
          <div
            v-else-if="currentStep === 'view' && !isEditingExisting"
            class="p-6 space-y-6"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-on-light-default">
                View Ethics Review
              </h3>
              <div class="flex gap-2">
                <Button @click="startEditing" variant="outline" size="sm">
                  <Pencil class="w-4 h-4 mr-2" />
                  Edit Review
                </Button>
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
      <div class="border-t bg-gray-50 p-6 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <span v-if="currentStep === 'builder'">
              Configure your ethics framework to generate relevant questions
            </span>
            <span v-else-if="currentStep === 'review'">
              Complete all questions to proceed with the
              {{ activeTiming === "before" ? "exercise" : "next step" }}
            </span>
            <span v-else>
              {{
                isEditingExisting
                  ? "Edit your responses or modify the framework"
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
              v-if="currentStep === 'builder' && !frameworkModified"
              @click="generateQuestions"
              :disabled="isGeneratingQuestions"
              class="bg-primary-accent hover:bg-primary-accent/90 text-white"
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
              class="bg-primary-accent hover:bg-primary-accent/90 text-white"
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
                class="bg-primary-accent hover:bg-primary-accent/90 text-white"
              >
                <Pencil class="w-4 h-4 mr-2" />
                Edit Review
              </Button>
              <template v-else>
                <Button @click="cancelEditing" variant="outline" size="sm">
                  Cancel
                </Button>
                <Button
                  @click="saveChanges"
                  size="sm"
                  :disabled="!hasChanges || isSubmitting"
                  class="bg-primary-accent hover:bg-primary-accent/90 text-white"
                >
                  <Loader2
                    v-if="isSubmitting"
                    class="w-4 h-4 mr-2 animate-spin"
                  />
                  <Save v-else class="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </template>
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
  Info,
  RefreshCw,
} from "lucide-vue-next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ETHICAL_LENSES, MAIN_CAPITALS } from "@/types/ethics";
import type { EthicalSettings, EthicalLens, MainCapital } from "@/types/ethics";

export interface EthicsQuestion {
  id: string;
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
  required: boolean;
}

interface EthicsData {
  exerciseId: string;
  timing: "before" | "after";
  settings: EthicalSettings;
  questions: EthicsQuestion[];
  completed: boolean;
  responses?: Record<string, any>;
  completedAt?: number;
  additionalContext?: string;
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
  mode: "new" | "view" | "edit"; // Mode for the initial timing
  exerciseName: string;
  initialTiming: "before" | "after";
  availableTimings: ("before" | "after")[];
  exerciseContext: ExerciseContext;
  chatHistory: ChatMessage[];
  previousExerciseContext?: PreviousExerciseContext;
  suggestions?: {
    lens?: string;
    capital?: string;
  };
  allExistingEthicsData?: {
    before?: EthicsData;
    after?: EthicsData;
  };
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (
    e: "submit",
    data: {
      timing: "before" | "after";
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
const activeTiming = ref(props.initialTiming);
const currentStep = ref<"builder" | "review" | "view">("builder");
const isGeneratingQuestions = ref(false);
const isSubmitting = ref(false);
const isEditingExisting = ref(false);
const frameworkModified = ref(false);
const originalSettings = ref<EthicalSettings | null>(null);

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
  if (frameworkModified.value) return false; // Don't allow saving if framework changed, must regenerate
  return Object.keys(responses).some((key) => {
    return originalResponses.value[key] !== responses[key];
  });
});

const existingCompletedAt = computed(() => {
  return props.allExistingEthicsData?.[activeTiming.value]?.completedAt;
});

const getTimingStatus = (timing: "before" | "after") => {
  const data = props.allExistingEthicsData?.[timing];
  return {
    isCompleted: !!data?.completed,
  };
};

// Initialize or switch component state based on timing
const initializeForTiming = (timing: "before" | "after") => {
  const data = props.allExistingEthicsData?.[timing];
  const isCompleted = !!data?.completed;
  const hasData = !!data;

  frameworkModified.value = false;
  isEditingExisting.value = false;

  if (hasData) {
    currentStep.value = "view";
    Object.assign(selectedEthicsSettings, data.settings);
    originalSettings.value = JSON.parse(JSON.stringify(data.settings));
    additionalContext.value = data.additionalContext || "";
    ethicsQuestions.value = data.questions || [];
    Object.keys(responses).forEach((key) => delete responses[key]);
    Object.assign(responses, data.responses || {});
    originalResponses.value = { ...(data.responses || {}) };
  } else {
    // No data, start fresh in the builder
    currentStep.value = "builder";
    Object.assign(selectedEthicsSettings, {
      ethicalLens: ETHICAL_LENSES[0],
      mainCapital: MAIN_CAPITALS[0],
      zoomingState: "in" as const,
    });
    additionalContext.value = "";
    ethicsQuestions.value = [];
    Object.keys(responses).forEach((key) => delete responses[key]);
    originalResponses.value = {};
  }
};

// Generate questions using AI (mock implementation for now)
const generateQuestions = async () => {
  isGeneratingQuestions.value = true;
  frameworkModified.value = false;

  // Clear previous responses when generating new questions
  Object.keys(responses).forEach((key) => delete responses[key]);

  try {
    // This is where you would check for an API key and make a real call
    const useMock = !import.meta.env.VITE_OPENAI_API_KEY;

    if (useMock) {
      // Simulate AI question generation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      ethicsQuestions.value = generateMockQuestions();
    } else {
      // Placeholder for real AI call
      // const prompt = buildAIPrompt();
      // const generatedQuestions = await callAI(prompt);
      // ethicsQuestions.value = parseAIResponse(generatedQuestions);
      console.warn("AI question generation is not implemented. Using mock data.");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      ethicsQuestions.value = generateMockQuestions();
    }

    currentStep.value = "review";
  } catch (error) {
    console.error("Error generating questions:", error);
    // Add user-facing error handling (e.g., a toast notification)
  } finally {
    isGeneratingQuestions.value = false;
  }
};

// Generate mock questions based on current settings
const generateMockQuestions = (): EthicsQuestion[] => {
  const { ethicalLens, mainCapital, zoomingState } = selectedEthicsSettings;
  const timing = activeTiming.value;
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
  return props.allExistingEthicsData?.[activeTiming.value]?.responses?.[
    questionId
  ] || "";
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
      timing: activeTiming.value,
      settings: selectedEthicsSettings,
      questions: ethicsQuestions.value,
      responses: { ...responses },
      additionalContext: additionalContext.value,
    });

    // Close the modal upon submission.
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
  originalSettings.value = JSON.parse(JSON.stringify(selectedEthicsSettings));
  frameworkModified.value = false;
};

const cancelEditing = () => {
  isEditingExisting.value = false;
  frameworkModified.value = false;
  // Restore original responses
  Object.keys(responses).forEach((key) => delete responses[key]);
  Object.assign(responses, originalResponses.value);
  // Restore original settings
  if (originalSettings.value) {
    Object.assign(selectedEthicsSettings, originalSettings.value);
  }
};

const saveChanges = async () => {
  if (!hasChanges.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    emit("submit", {
      timing: activeTiming.value,
      settings: selectedEthicsSettings,
      questions: ethicsQuestions.value,
      responses: { ...responses },
      additionalContext: additionalContext.value,
    });

    isEditingExisting.value = false;
    originalResponses.value = { ...responses };
    // Close the modal
    isOpen.value = false;
    emit("update:open", false);
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
      activeTiming.value = props.initialTiming;
      initializeForTiming(props.initialTiming);
    }
  }
);

watch(activeTiming, (newTiming) => {
  initializeForTiming(newTiming);
});

// Initialize on mount
onMounted(() => {
  if (props.open) {
    initializeForTiming(props.initialTiming);
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
