<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center p-4 border-b bg-white">
      <button
        @click="$emit('close')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft />
        <h1 class="ml-2 text-lg font-medium">Back to diamond</h1>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <p class="text-sm text-gray-500">Project Analytics</p>
          <h2 class="text-3xl font-semibold text-gray-900">
            Project Reflection
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Project DNA -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"
              >
                <Dna class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Project DNA</h3>
            </div>

            <div class="space-y-4">
              <div
                v-for="item in projectDNA"
                :key="item.type"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="item.icon"
                    class="w-5 h-5"
                    :class="item.color"
                  />
                  <span class="font-medium text-gray-700">{{
                    item.label
                  }}</span>
                </div>
                <div class="text-gray-600 font-semibold">
                  {{ item.count }}
                  <span class="text-sm font-normal text-gray-500"
                    >exercise{{ item.count !== 1 ? "s" : "" }}</span
                  >
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
              <p class="text-sm font-semibold text-gray-800 mb-2">Guidance</p>
              <p class="text-sm text-gray-600">{{ guidance }}</p>
            </div>
          </div>

          <!-- Human-AI Balance Chart -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"
              >
                <Scaling class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">
                Human-AI Balance Distribution
              </h3>
            </div>
            <div class="h-full w-full">
              <HumanAiBalanceChart :selected-exercises="selectedExercises" />
            </div>
          </div>

          <!-- Ethical Considerations -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
              >
                <ShieldCheck class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">
                Ethical Considerations
              </h3>
            </div>
            <div
              v-if="ethicalInsights.totalExercisesWithEthics > 0"
              class="space-y-4"
            >
              <p class="text-gray-700">
                <span class="font-bold text-gray-900">{{
                  ethicalInsights.totalExercisesWithEthics
                }}</span>
                of
                <span class="font-bold text-gray-900">{{
                  selectedExercises.length
                }}</span>
                exercises include an ethical check.
              </p>
              <div>
                <h4 class="font-semibold text-gray-800 mb-2">
                  Ethical Lenses Applied:
                </h4>
                <div
                  v-if="ethicalInsights.uniqueLenses.length > 0"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="lens in ethicalInsights.uniqueLenses"
                    :key="lens"
                    class="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {{ lens }}
                  </span>
                </div>
                <p v-else class="text-sm text-gray-500">
                  No specific ethical lenses found.
                </p>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800 mb-2 mt-4">
                  Ethical Capitals:
                </h4>
                <div
                  v-if="ethicalInsights.uniqueCapitals.length > 0"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="capital in ethicalInsights.uniqueCapitals"
                    :key="capital"
                    class="bg-yellow-50 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {{ capital }}
                  </span>
                </div>
                <p v-else class="text-sm text-gray-500">
                  No specific ethical capitals found.
                </p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No ethical considerations defined in this pipeline.</p>
            </div>
          </div>

          <!-- Process Distribution -->
          <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"
              >
                <GalleryVerticalEnd class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">
                Process Distribution
              </h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="phase in phaseDistribution"
                :key="phase.name"
                class="flex items-center gap-4"
              >
                <span class="w-24 font-medium text-gray-700 text-sm">{{
                  phase.name
                }}</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-green-500 h-2.5 rounded-full"
                    :style="{ width: phase.percentage + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-semibold text-gray-600 w-12 text-right"
                  >{{ phase.count }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowLeft,
  Dna,
  Scaling,
  ShieldCheck,
  GalleryVerticalEnd,
  User,
  UserCog,
  Bot,
} from "lucide-vue-next";
import HumanAiBalanceChart from "./HumanAiBalanceChart.vue";
import type { SelectedPinInfo, DriveType } from "@/types/exercise";

const props = defineProps<{
  selectedExercises: SelectedPinInfo[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const getDriveType = (scale: number): DriveType => {
  if (scale <= 2) return "human";
  if (scale <= 6) return "human-ai";
  return "ai";
};

const projectDNA = computed(() => {
  const counts = {
    human: 0,
    "human-ai": 0,
    ai: 0,
  };

  props.selectedExercises.forEach((ex) => {
    const driveType = getDriveType(ex.location.human_ai_scale);
    counts[driveType]++;
  });

  return [
    {
      type: "human",
      label: "Human-driven",
      count: counts.human,
      icon: User,
      color: "text-blue-600",
    },
    {
      type: "human-ai",
      label: "Human+AI Collab",
      count: counts["human-ai"],
      icon: UserCog,
      color: "text-purple-600",
    },
    {
      type: "ai",
      label: "AI-driven",
      count: counts.ai,
      icon: Bot,
      color: "text-green-600",
    },
  ];
});

const guidance = computed(() => {
  const dna = projectDNA.value;
  const humanCount = dna.find((item) => item.type === "human")?.count ?? 0;
  const aiHybridCount =
    (dna.find((item) => item.type === "ai")?.count ?? 0) +
    (dna.find((item) => item.type === "human-ai")?.count ?? 0);

  if (aiHybridCount > humanCount) {
    return "Your process heavily leverages AI. Consider incorporating more human-led divergent thinking exercises to broaden the solution space and ensure human values are central.";
  } else {
    return "Your process is balanced with human-driven insights. Explore opportunities to use AI for convergent tasks like synthesis or prototyping to accelerate development.";
  }
});

const ethicalInsights = computed(() => {
  let totalExercisesWithEthics = 0;
  const lenses = new Set<string>();
  const capitals = new Set<string>();

  props.selectedExercises.forEach((ex) => {
    if (!ex.ethical) return;

    const requirements = [
      ...(Array.isArray(ex.ethical.before)
        ? ex.ethical.before
        : [ex.ethical.before]),
      ...(Array.isArray(ex.ethical.after)
        ? ex.ethical.after
        : [ex.ethical.after]),
    ].filter(Boolean);

    if (requirements.length > 0) {
      totalExercisesWithEthics++;
      requirements.forEach((req) => {
        if (req.lens) lenses.add(req.lens);
        if (req.capital) capitals.add(req.capital);
      });
    }
  });

  return {
    totalExercisesWithEthics,
    uniqueLenses: Array.from(lenses),
    uniqueCapitals: Array.from(capitals),
  };
});

const phaseDistribution = computed(() => {
  const phases = ["Discover", "Define", "Develop", "Deliver"];
  const totalExercises = props.selectedExercises.length;

  const distribution = phases.map((phaseName) => {
    const count = props.selectedExercises.filter(
      (ex) => ex.location.phase === phaseName
    ).length;
    return {
      name: phaseName,
      count,
      percentage: totalExercises > 0 ? (count / totalExercises) * 100 : 0,
    };
  });

  return distribution;
});
</script>
