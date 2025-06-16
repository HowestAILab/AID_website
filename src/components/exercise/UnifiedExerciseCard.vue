<template>
  <div
    class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-0"
    :class="[
      cardStateClasses,
      mode === 'compact' ? 'flex-shrink-0 w-80' : 'border-on-light-accent/20',
    ]"
    @click="handleCardClick"
  >
    <!-- Exercise Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <!-- Exercise Number (show in all modes) -->
        <div
          class="w-8 h-8 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
        >
          {{ originalIndex + 1 }}
        </div>

        <div class="min-w-0">
          <h3
            class="font-medium text-on-light-default text-sm"
            :class="mode === 'grid' ? 'truncate' : ''"
          >
            {{ title }}
          </h3>

          <!-- Phase and Step info (pipeline modes) or Drive Type (exercises page) -->
          <div class="flex items-center gap-2 mt-1">
            <template v-if="showPhaseInfo">
              <p
                class="text-xs text-on-light-accent"
                :class="mode === 'grid' ? 'truncate' : ''"
              >
                {{ phase }} • {{ step }}
              </p>
              <div
                :class="humanAiScaleStyle"
                class="text-xs px-1.5 py-0.5 rounded-sm font-medium"
              >
                {{ humanAiScaleText }}
              </div>
            </template>

            <!-- Drive Type for exercises page -->
            <template v-else-if="driveType">
              <div
                class="flex items-center gap-2 rounded-sm px-2 py-0.5"
                :class="[driveTypeConfig.bgColor, driveTypeConfig.textColor]"
              >
                <UserRound v-if="driveType === 'human'" :size="16" />
                <Bot v-else-if="driveType === 'ai'" :size="16" />
                <UserCog v-else-if="driveType === 'human-ai'" :size="16" />
                <span class="text-xs">{{ driveTypeConfig.text }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Status Icon -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <!-- Pipeline status icons -->
        <template v-if="showStatusIcons">
          <CheckCircle2 v-if="isCompleted" class="w-5 h-5 text-green-600" />
          <Clock
            v-else-if="isCurrentExercise"
            class="w-5 h-5 text-primary-accent"
          />
          <Circle v-else class="w-5 h-5 text-on-light-accent/40" />
        </template>
      </div>
    </div>

    <!-- Exercise Description -->
    <p
      class="text-sm text-gray-600 mb-4"
      :class="mode === 'compact' || mode === 'grid' ? 'line-clamp-2' : ''"
    >
      {{ description }}
    </p>

    <!-- Progress Indicators -->
    <div v-if="showProgressIndicators" class="space-y-2 mb-4">
      <!-- Exercises Mode - Just show ethics requirements -->
      <template v-if="mode === 'exercises'">
        <div v-if="hasEthics" class="flex items-center gap-2 text-xs">
          <Shield class="w-3 h-3 flex-shrink-0 text-purple-600" />
          <span class="text-on-light-accent">Ethics Required:</span>
          <div class="flex gap-1">
            <span
              v-if="hasEthicsBefore"
              class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs"
            >
              Pre-exercise
            </span>
            <span
              v-if="hasEthicsAfter"
              class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs"
            >
              Post-exercise
            </span>
          </div>
        </div>
      </template>

      <!-- Pipeline Modes - Show status and completion info -->
      <template v-else>
        <!-- Ethics Status -->
        <div
          v-if="hasEthics"
          class="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
          @click.stop="handleEthicsClick"
        >
          <Shield class="w-3 h-3 flex-shrink-0 text-purple-600" />
          <span class="text-on-light-accent">Ethics:</span>
          <span
            :class="ethicsCompleted ? 'text-green-600' : 'text-primary-accent'"
          >
            {{ ethicsCompleted ? "Completed" : "Pending" }}
          </span>
          <Eye v-if="ethicsCompleted" class="w-3 h-3 text-gray-400 ml-auto" />
        </div>

        <!-- Chat History -->
        <div
          v-if="typeof chatMessageCount === 'number'"
          class="flex items-center gap-2 text-xs"
        >
          <MessageSquare class="w-3 h-3 flex-shrink-0 text-on-light-accent" />
          <span class="text-on-light-accent">Chat:</span>
          <span class="text-on-light-accent/70">
            {{ chatMessageCount }} user messages
          </span>
        </div>

        <!-- Completion Status -->
        <div class="flex items-center gap-2 text-xs">
          <Target class="w-3 h-3 flex-shrink-0 text-on-light-accent" />
          <span class="text-on-light-accent">Status:</span>
          <span
            :class="
              isCompleted
                ? 'text-green-600 font-medium'
                : 'text-on-light-accent/70'
            "
          >
            {{ isCompleted ? "Completed" : "Not Started" }}
          </span>
        </div>
      </template>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-2">
      <!-- Pipeline action button -->
      <template v-if="mode === 'pipeline-phases'">
        <button
          class="w-full border border-primary-accent bg-primary-accent/10 text-primary-accent p-2 rounded-md items-center flex justify-center gap-2 cursor-pointer hover:bg-primary-accent/20 transition-colors font-medium"
          @click.stop="$emit('open-exercise')"
        >
          <SquareArrowOutUpRight class="w-4 h-4" />
          {{ isCompleted ? "Review Exercise" : "Open Exercise Workspace" }}
        </button>
        <button
          v-if="hasEthics"
          class="w-full border border-on-light-accent/30 bg-light text-on-light-accent p-2 rounded-md items-center flex justify-center gap-2 cursor-pointer hover:bg-on-light-accent/10 transition-colors font-medium"
          @click.stop="$emit('open-ethics')"
        >
          <Info class="w-4 h-4" />
          <span v-if="!ethicsCompleted">Perform Ethics Check</span>
          <span v-else>View Ethics Answers</span>
        </button>
      </template>

      <!-- Exercises page toggle pipeline button -->
      <template v-else-if="mode === 'exercises'">
        <button
          class="flex items-center gap-2 mt-auto cursor-pointer"
          :class="isInPipeline ? 'text-red-500' : 'text-primary-accent'"
          @click.stop="$emit('toggle-pipeline', originalIndex)"
        >
          <CirclePlus v-if="!isInPipeline" />
          <CircleMinus v-else />
          <p>
            {{ isInPipeline ? "Remove from pipeline" : "Add to pipeline" }}
          </p>
        </button>
      </template>
    </div>

    <!-- Completion Date (pipeline modes only) -->
    <div
      v-if="showCompletionDate && isCompleted && completionDate"
      class="mt-3 pt-3 border-t border-on-light-accent/20"
    >
      <p class="text-xs text-on-light-accent/70">
        Completed {{ completionDate }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from "vue";
import {
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  MessageSquare,
  Target,
  Eye,
  SquareArrowOutUpRight,
  Info,
  UserRound,
  Bot,
  UserCog,
  CirclePlus,
  CircleMinus,
} from "lucide-vue-next";
import type { DriveType } from "@/types/exercise";

export interface UnifiedExerciseCardProps {
  // Basic exercise info
  title: string;
  description: string;
  originalIndex: number;

  // Mode determines which features to show
  mode:
    | "exercises"
    | "pipeline-overview"
    | "pipeline-phases"
    | "compact"
    | "grid";

  // Exercise page specific
  driveType?: DriveType;
  isInPipeline?: boolean;

  // Pipeline specific
  phase?: string;
  step?: string;
  humanAiScale?: number;
  isCompleted?: boolean;
  isCurrentExercise?: boolean;

  // Progress indicators
  hasEthics?: boolean;
  ethicsCompleted?: boolean;
  hasEthicsBefore?: boolean;
  hasEthicsAfter?: boolean;
  chatMessageCount?: number;
  completionDate?: string;
}

const props = withDefaults(defineProps<UnifiedExerciseCardProps>(), {
  mode: "exercises",
  isInPipeline: false,
  isCompleted: false,
  isCurrentExercise: false,
  hasEthics: false,
  ethicsCompleted: false,
  hasEthicsBefore: false,
  hasEthicsAfter: false,
  chatMessageCount: 0,
});

const emit = defineEmits<{
  (e: "click", exercise: UnifiedExerciseCardProps): void;
  (e: "toggle-pipeline", originalIndex: number): void;
  (e: "open-exercise"): void;
  (e: "open-ethics"): void;
  (e: "ethics-click"): void;
}>();

// Computed properties for conditional rendering
const showPhaseInfo = computed(
  () =>
    ["pipeline-overview", "pipeline-phases", "compact", "grid"].includes(
      props.mode
    ) &&
    props.phase &&
    props.step
);

const showStatusIcons = computed(() =>
  ["pipeline-overview", "compact", "grid", "pipeline-phases"].includes(
    props.mode
  )
);

const showProgressIndicators = computed(() =>
  [
    "pipeline-overview",
    "compact",
    "grid",
    "pipeline-phases",
    "exercises",
  ].includes(props.mode)
);

const showCompletionDate = computed(() =>
  ["pipeline-overview", "compact", "grid", "pipeline-phases"].includes(
    props.mode
  )
);

// Drive type configuration for exercises page
const driveTypeConfig = computed(() => {
  if (!props.driveType) return { text: "", bgColor: "", textColor: "" };

  switch (props.driveType) {
    case "human-ai":
      return {
        text: "Human+AI",
        bgColor: "bg-[#F3E8FF]",
        textColor: "text-[#6B21A8]",
      };
    case "ai":
      return {
        text: "AI-driven",
        bgColor: "bg-[#D1FAE5]",
        textColor: "text-[#076046]",
      };
    case "human":
    default:
      return {
        text: "Human-driven",
        bgColor: "bg-[#DBE9FE]",
        textColor: "text-[#1D40AE]",
      };
  }
});

// Human-AI scale for pipeline modes
const humanAiScaleText = computed(() => {
  if (typeof props.humanAiScale !== "number") return "";
  if (props.humanAiScale <= 3) return "Human";
  if (props.humanAiScale <= 7) return "Human+AI";
  return "AI";
});

const humanAiScaleStyle = computed(() => {
  if (typeof props.humanAiScale !== "number") return "";
  if (props.humanAiScale <= 3) return "bg-[#DBE9FE] text-[#1D40AE]";
  if (props.humanAiScale <= 7) return "bg-[#F3E8FF] text-[#6B21A8]";
  return "bg-[#D1FAE5] text-[#076046]";
});

// Card state classes based on completion and current status
const cardStateClasses = computed(() => {
  const classes = [];

  if (props.mode === "exercises") {
    classes.push("border-[#E5E7EB]");
  } else if (["pipeline-overview", "compact", "grid"].includes(props.mode)) {
    if (props.isCurrentExercise && !props.isCompleted) {
      classes.push(
        "ring-2 ring-primary-accent ring-opacity-50 border-primary-accent/30 bg-blue-50 border-blue-200"
      );
    } else if (props.isCompleted) {
      classes.push("bg-green-50 border-green-200");
    } else if (props.isCurrentExercise) {
      classes.push("ring-2 ring-primary-accent ring-opacity-50");
    }
  } else if (props.mode === "pipeline-phases") {
    if (props.isCompleted) {
      classes.push("bg-green-50 border-green-200");
    } else {
      classes.push("border-on-light-accent/20 hover:bg-light");
    }
  }

  return classes;
});

// Event handlers
const handleCardClick = () => {
  if (props.mode === "exercises") {
    // Don't emit click for exercises mode as it has toggle pipeline button
    return;
  }
  emit("click", props);
};

const handleEthicsClick = () => {
  emit("ethics-click");
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
