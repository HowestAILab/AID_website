<template>
  <div
    v-if="exerciseData.length === 0"
    class="flex items-center justify-center h-64 text-gray-500"
  >
    <p>
      No exercises selected. Add exercises to your pipeline to see the
      visualization.
    </p>
  </div>
  <apexchart
    v-else
    class="w-[80%]"
    type="bar"
    height="400"
    :options="chartOptions"
    :series="chartSeries"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";

const apexchart = VueApexCharts;

interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

const props = defineProps<{
  selectedExercises?: Exercise[];
}>();

// Use selected exercises only
const exerciseData = computed(() => {
  const exercises = props.selectedExercises || [];
  return exercises.map((exercise) => ({
    name: exercise.name,
    phase: exercise.location.phase,
    human_ai_scale: exercise.location.human_ai_scale,
  }));
});

// Process data to calculate counts for each category per phase
const chartData = computed(() => {
  const phases = ["Discover", "Define", "Develop", "Deliver"];
  const data = exerciseData.value;

  const humanCounts = phases.map(
    (phase) =>
      data.filter((ex) => ex.phase === phase && ex.human_ai_scale <= 2).length
  );
  const humanAiCounts = phases.map(
    (phase) =>
      data.filter(
        (ex) =>
          ex.phase === phase && ex.human_ai_scale >= 3 && ex.human_ai_scale <= 7
      ).length
  );
  const aiCounts = phases.map(
    (phase) =>
      data.filter((ex) => ex.phase === phase && ex.human_ai_scale >= 8).length
  );

  return { humanCounts, humanAiCounts, aiCounts, phases };
});

const chartSeries = computed(() => [
  {
    name: "Human",
    data: chartData.value.humanCounts,
    color: "#3B82F6",
  },
  {
    name: "Human+AI",
    data: chartData.value.humanAiCounts,
    color: "#8B5CF6",
  },
  {
    name: "AI",
    data: chartData.value.aiCounts,
    color: "#10B981",
  },
]);

const maxStackedCount = computed(() => {
  const { humanCounts, humanAiCounts, aiCounts } = chartData.value;
  const phaseTotals = humanCounts.map(
    (val, i) => val + humanAiCounts[i] + aiCounts[i]
  );
  return Math.max(1, ...phaseTotals);
});

const chartOptions = computed(() => ({
  chart: {
    type: "bar",
    height: 400,
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "60%",
    },
  },
  xaxis: {
    categories: chartData.value.phases,
    labels: {
      style: {
        fontSize: "12px",
        fontWeight: 500,
      },
    },
  },
  yaxis: {
    title: {
      text: "Number of Exercises",
      style: {
        fontSize: "12px",
        fontWeight: 500,
      },
    },
    labels: {
      style: {
        fontSize: "12px",
      },
    },
    forceNiceScale: true,
    min: 0,
    max: maxStackedCount.value,
  },
  legend: {
    show: true,
  },
  colors: ["#3B82F6", "#8B5CF6", "#10B981"],
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: "#F3F4F6",
    strokeDashArray: 3,
  },
  tooltip: {
    y: {
      formatter: function (val: number) {
        return val + (val === 1 ? " exercise" : " exercises");
      },
    },
    style: {
      fontSize: "12px",
    },
    theme: "light",
    custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
      const categoryName = w.globals.labels[dataPointIndex] || w.config.xaxis.categories[dataPointIndex];
      const seriesName = w.config.series[seriesIndex].name;
      const value = series[seriesIndex][dataPointIndex];
      
      return `
        <div style="border-radius: 4px; overflow: hidden;">
          <div style="background-color: #F5F0E5; padding: 4px 12px; font-weight: 600;">
            ${categoryName}
          </div>
          <div style="background-color: white; padding: 8px 12px; color: #374151;">
            <span style="color: ${w.globals.colors[seriesIndex]};">●</span>
            ${seriesName}: ${value} ${value === 1 ? 'exercise' : 'exercises'}
          </div>
        </div>
      `;
    },
  },
}));
</script> 