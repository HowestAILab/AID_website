<template>
  <div class="flex items-center gap-1">
    <!-- Ethics Status Badge -->
    <div
      :class="badgeClasses"
      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
      :title="badgeTooltip"
      @click="$emit('click')"
    >
      <Shield :class="iconClasses" class="w-3 h-3 flex-shrink-0" />
      <span>{{ badgeText }}</span>

      <!-- Progress indicator for partially completed -->
      <div v-if="status === 'partial'" class="flex items-center gap-0.5 ml-1">
        <div
          v-for="step in (['before', 'after'] as const)"
          :key="step"
          :class="getStepClasses(step)"
          class="w-1.5 h-1.5 rounded-full"
        ></div>
      </div>
    </div>

    <!-- Detailed status for larger displays -->
    <!-- <div v-if="showDetailed" class="hidden sm:flex items-center gap-1 text-xs text-gray-600">
      <span v-if="beforeStatus && afterStatus">
        Before: {{ beforeStatus }}, After: {{ afterStatus }}
      </span>
      <span v-else-if="beforeStatus">
        Before: {{ beforeStatus }}
      </span>
      <span v-else-if="afterStatus">
        After: {{ afterStatus }}
      </span>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Shield } from "lucide-vue-next";
import { useEthics } from "@/composables/useEthics";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  exercise: SelectedPinInfo;
  showDetailed?: boolean;
  size?: "sm" | "md" | "lg";
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const { hasEthics, isCompleted } = useEthics();

const hasBeforeEthics = computed(() => hasEthics(props.exercise, "before"));
const hasAfterEthics = computed(() => hasEthics(props.exercise, "after"));
const beforeCompleted = computed(
  () => hasBeforeEthics.value && isCompleted(props.exercise.name, "before")
);
const afterCompleted = computed(
  () => hasAfterEthics.value && isCompleted(props.exercise.name, "after")
);

const beforeStatus = computed(() => {
  if (!hasBeforeEthics.value) return null;
  return beforeCompleted.value ? "Complete" : "Pending";
});

const afterStatus = computed(() => {
  if (!hasAfterEthics.value) return null;
  return afterCompleted.value ? "Complete" : "Pending";
});

const status = computed(() => {
  const hasAnyEthics = hasBeforeEthics.value || hasAfterEthics.value;
  if (!hasAnyEthics) return "none";

  const totalRequired =
    (hasBeforeEthics.value ? 1 : 0) + (hasAfterEthics.value ? 1 : 0);
  const totalCompleted =
    (beforeCompleted.value ? 1 : 0) + (afterCompleted.value ? 1 : 0);

  if (totalCompleted === 0) return "pending";
  if (totalCompleted === totalRequired) return "complete";
  return "partial";
});

const badgeClasses = computed(() => {
  const base = "transition-all duration-200";

  switch (status.value) {
    case "complete":
      return `${base} bg-green-100 text-green-800 border border-green-200 hover:bg-green-200`;
    case "partial":
      return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200`;
    case "pending":
      return `${base} bg-red-100 text-red-800 border border-red-200 hover:bg-red-200`;
    default:
      return `${base} bg-gray-100 text-gray-600 border border-gray-200`;
  }
});

const iconClasses = computed(() => {
  switch (status.value) {
    case "complete":
      return "text-green-600";
    case "partial":
      return "text-yellow-600";
    case "pending":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
});

const badgeText = computed(() => {
  switch (status.value) {
    case "complete":
      return "Ethics ✓";
    case "partial":
      return "Ethics ◐";
    case "pending":
      return "Ethics !";
    default:
      return "";
  }
});

const badgeTooltip = computed(() => {
  switch (status.value) {
    case "complete":
      return "All ethics requirements completed";
    case "partial":
      return "Some ethics requirements pending";
    case "pending":
      return "Ethics review required before proceeding";
    default:
      return "No ethics requirements for this exercise";
  }
});

const getStepClasses = (step: "before" | "after") => {
  const isRequired =
    step === "before" ? hasBeforeEthics.value : hasAfterEthics.value;
  const isCompleted =
    step === "before" ? beforeCompleted.value : afterCompleted.value;

  if (!isRequired) return "bg-gray-300";
  if (isCompleted) return "bg-green-500";
  return "bg-red-500";
};
</script>
