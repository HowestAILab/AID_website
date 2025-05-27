<template>
  <div class="border-b border-[#A1824A]">
    <nav class="flex -mb-px" aria-label="Tabs">
      <div class="flex-1"></div>
      <button
        v-for="tab in tabs"
        :key="tab"
        :ref="(el) => assignButtonRef(el, tab)"
        @click="setActiveTab(tab)"
        :class="[
          'grow-2',
          'shrink',
          'basis-0',
          'py-4',
          'px-1',
          'text-center',
          'text-sm',
          'font-bold',
          'focus:outline-none',
          activeTab === tab
            ? ['border-b-2', 'border-b-[#A1824A]', 'text-[#A1824A]', '']
            : ['border-b', 'border-b-[#A1824A]', '', 'text-[#1C170D]'],
        ]"
      >
        {{ tab }}
      </button>
      <div class="flex-1"></div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, defineProps, defineEmits, onMounted, nextTick } from "vue";

const props = defineProps<{
  tabs: string[];
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: "update:activeTab", tab: string): void;
  (e: "buttonRefsUpdated", refs: Record<string, HTMLButtonElement | null>): void;
}>();

const buttonRefs = {
  Discover: shallowRef<HTMLButtonElement | null>(null),
  Define: shallowRef<HTMLButtonElement | null>(null),
  Develop: shallowRef<HTMLButtonElement | null>(null),
  Deliver: shallowRef<HTMLButtonElement | null>(null),
};

const setActiveTab = (tabName: string) => {
  emit("update:activeTab", tabName);
};

const assignButtonRef = (el: any, tabName: string) => {
  if (tabName === "Discover") {
    buttonRefs.Discover.value = el as HTMLButtonElement;
  } else if (tabName === "Define") {
    buttonRefs.Define.value = el as HTMLButtonElement;
  } else if (tabName === "Develop") {
    buttonRefs.Develop.value = el as HTMLButtonElement;
  } else if (tabName === "Deliver") {
    buttonRefs.Deliver.value = el as HTMLButtonElement;
  }
};

onMounted(() => {
  nextTick(() => {
    const refsToEmit: Record<string, HTMLButtonElement | null> = {};
    for (const key in buttonRefs) {
      refsToEmit[key] = buttonRefs[key as keyof typeof buttonRefs].value;
    }
    emit("buttonRefsUpdated", refsToEmit);
  });
});
</script> 