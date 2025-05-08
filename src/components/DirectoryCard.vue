<template>
  <div class="max-w-lg h-96 flex flex-col overflow-hidden">
    <h3
      class="text-2xl font-bold py-1 px-6 w-fit rounded-t-lg"
      :style="{ color: color, background: h3Background }"
    >
      {{ title }}
    </h3>
    <div 
      class="flex-1 flex flex-col p-4 overflow-hidden rounded-tr-lg rounded-b-lg" 
      :style="{ background: bodyBackground }"
    >
      <p class="text-white mb-4 line-clamp-14">
        {{ content }}
      </p>
      <div
        class="flex items-center gap-2 rounded-full w-fit py-1 px-4 mt-auto"
        :style="{ background: tagWrapperBackground, color: props.color }"
      >
        <svg
          width="34"
          height="17"
          viewBox="0 0 34 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path :d="svgPaths.discover" :fill="getSectionFillColor('discover')" />
          <path :d="svgPaths.define" :fill="getSectionFillColor('define')" />
          <path :d="svgPaths.develop" :fill="getSectionFillColor('develop')" />
          <path :d="svgPaths.deliver" :fill="getSectionFillColor('deliver')" />
        </svg>
        <p :style="{ color: props.color }">{{ tag }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  title: string;
  content: string;
  tag: string;
  color: string;
}>();

const svgPaths = {
  discover: "M0 8.5L8.5 0V17L0 8.5Z",
  define: "M17 8.5L8.5 0V17L17 8.5Z",
  develop: "M17 8.5L25.5 0V17L17 8.5Z",
  deliver: "M34 8.5L25.5 0V17L34 8.5Z"
};

const inactiveSvgPartColor = computed(() => {
  if (!props.color || !/^#[0-9A-Fa-f]{6}$/.test(props.color)) {
    return "#000000"; // Fallback for invalid color
  }
  const hex = props.color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const factor = 0.75;
  const newR = Math.round(r * factor).toString(16).padStart(2, '0');
  const newG = Math.round(g * factor).toString(16).padStart(2, '0');
  const newB = Math.round(b * factor).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
});

const getSectionFillColor = (sectionName: 'discover' | 'define' | 'develop' | 'deliver'): string => {
  if (props.tag.toLowerCase() === sectionName) {
    return props.color;
  }
  return inactiveSvgPartColor.value;
};

const h3Background = computed(() => {
  if (!props.color || !/^#[0-9A-Fa-f]{6}$/.test(props.color)) {
    return `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), #000000`;
  }
  return `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), ${props.color}`;
});

const bodyBackground = computed(() => {
  if (!props.color || !/^#[0-9A-Fa-f]{6}$/.test(props.color)) {
    return `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), #000000`;
  }
  return `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), ${props.color}`;
});

const tagWrapperBackground = computed(() => {
  if (!props.color || !/^#[0-9A-Fa-f]{6}$/.test(props.color)) {
    return `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), #000000`;
  }
  return `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), ${props.color}`;
});
</script>
