<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent class="!max-w-[70vw] max-h-[90vh] overflow-hidden p-0 z-50">
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
                Ethics Review Required
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                {{
                  timing === "before" ? "Pre-Exercise" : "Post-Exercise"
                }}
                Ethics Check for "{{ exerciseName }}"
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
      </div>

      <!-- Content -->
      <div class="flex h-[60vh]">
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

            <!-- Ethics Settings -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
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
                    ethicsSettings?.ethicalLens.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="font-medium">{{
                    ethicsSettings?.mainCapital.name
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="font-medium capitalize"
                    >{{ ethicsSettings?.zoomingState }} Focus</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Ethics Questions -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-6">
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

                    <!-- Rating Answer -->
                    <div
                      v-else-if="question.type === 'rating'"
                      class="space-y-2"
                    >
                      <div class="flex items-center gap-4">
                        <label
                          v-for="rating in 5"
                          :key="rating"
                          class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                          :class="
                            responses[question.id] === rating
                              ? 'bg-blue-50 border border-blue-200'
                              : ''
                          "
                        >
                          <input
                            type="radio"
                            :value="rating"
                            v-model="responses[question.id]"
                            class="text-blue-600"
                          />
                          <span class="text-sm font-medium">{{ rating }}</span>
                        </label>
                      </div>
                      <div
                        class="flex justify-between text-xs text-gray-500 px-2"
                      >
                        <span>Strongly Disagree</span>
                        <span>Strongly Agree</span>
                      </div>
                    </div>

                    <!-- Multiple Choice -->
                    <div
                      v-else-if="question.type === 'multiple-choice'"
                      class="space-y-2"
                    >
                      <label
                        v-for="option in question.options"
                        :key="option"
                        class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50"
                        :class="
                          responses[question.id] === option
                            ? 'bg-blue-50 border border-blue-200'
                            : 'border border-gray-200'
                        "
                      >
                        <input
                          type="radio"
                          :value="option"
                          v-model="responses[question.id]"
                          class="text-blue-600"
                        />
                        <span class="text-sm">{{ option }}</span>
                      </label>
                    </div>

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
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t bg-gray-50 p-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Complete all questions to proceed with the
            {{ timing === "before" ? "exercise" : "next step" }}
          </div>
          <div class="flex items-center gap-3">
            <Button
              variant="outline"
              @click="handleCancel"
              :disabled="isSubmitting"
            >
              Cancel
            </Button>
            <Button
              @click="handleSubmit"
              :disabled="!isFormComplete || isSubmitting"
              class="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              <Shield v-else class="w-4 h-4 mr-2" />
              {{ isSubmitting ? "Saving..." : "Complete Ethics Review" }}
            </Button>
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
} from "lucide-vue-next";

export interface EthicsQuestion {
  id: string;
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
  required: boolean;
}

export interface EthicsSettings {
  ethicalLens: { name: string; type: string };
  mainCapital: { name: string; type: string };
  zoomingState: "in" | "out";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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
  exerciseName: string;
  timing: "before" | "after";
  ethicsQuestions: EthicsQuestion[];
  ethicsSettings: EthicsSettings;
  exerciseContext: ExerciseContext;
  chatHistory: ChatMessage[];
  previousExerciseContext?: PreviousExerciseContext;
  existingResponses?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", responses: Record<string, any>): void;
  (e: "cancel"): void;
}>();

const isOpen = ref(props.open);
const responses = reactive<Record<string, any>>({});
const isSubmitting = ref(false);

// Sync with prop changes
watch(
  () => props.open,
  (value) => {
    isOpen.value = value;
  }
);

watch(
  () => props.existingResponses,
  (existingResponses) => {
    if (existingResponses) {
      Object.assign(responses, existingResponses);
    }
  },
  { immediate: true, deep: true }
);

// Computed properties
const totalQuestions = computed(() => props.ethicsQuestions.length);

const answeredQuestions = computed(() => {
  return Object.keys(responses).filter((key) => {
    const value = responses[key];
    return value !== undefined && value !== null && value !== "";
  }).length;
});

const isFormComplete = computed(() => {
  return props.ethicsQuestions.every((q) => {
    const value = responses[q.id];
    return q.required
      ? value !== undefined && value !== null && value !== ""
      : true;
  });
});

// Event handlers
const handleOpenChange = (open: boolean) => {
  if (!open && !isSubmitting.value) {
    emit("update:open", false);
  }
};

const handleSubmit = async () => {
  if (!isFormComplete.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Add a small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    emit("submit", { ...responses });
    isOpen.value = false;
    emit("update:open", false);
  } catch (error) {
    console.error("Error submitting ethics review:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (!isSubmitting.value) {
    emit("cancel");
    isOpen.value = false;
    emit("update:open", false);
  }
};

// Initialize responses on mount
onMounted(() => {
  if (props.existingResponses) {
    Object.assign(responses, props.existingResponses);
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
