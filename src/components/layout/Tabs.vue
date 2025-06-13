<template>
    <div class="border-b border-primary-accent transition-all duration-500 ease-in-out" :style="{ paddingLeft: leftMargin + 'px', paddingRight: rightMargin + 'px' }">
      <nav class="flex -mb-px" aria-label="Tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab"
          :ref="(el) => assignButtonRef(el, tab)"
          @click="clickable ? setActiveTab(tab) : undefined"
          :class="[
            'py-4',
            'px-1',
            'text-center',
            'text-sm',
            'font-bold',
            'focus:outline-none',
            'transition-all',
            'duration-500',
            'ease-in-out',
            clickable ? 'cursor-pointer' : 'cursor-default',
            clickable && activeTab === tab
              ? ['border-b-2', 'border-primary-accent', 'text-on-light-accent', '']
              : ['border-b', 'border-primary-accent', '', 'text-[#1C170D]'],
          ]"
          :style="getTabStyle(index)"
        >
          {{ tab }}
        </button>
      </nav>
    </div>
  </template>
  
  <script setup lang="ts">
  import { shallowRef, defineProps, defineEmits, onMounted, nextTick, computed } from "vue";
  
  const props = defineProps<{
    tabs: string[];
    activeTab: string;
    clickable?: boolean;
    gridLayout?: {
      sectionLabels: { text: string; left: number; width: number }[];
      svgBounds: { left: number; top: number; width: number; height: number };
    } | null;
    isGridMode?: boolean;
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
  
  // Calculate dynamic margins and tab widths based on grid layout
  const leftMargin = computed(() => {
    if (!props.isGridMode || !props.gridLayout) return 0;
    return props.gridLayout.svgBounds.left;
  });
  
  const rightMargin = computed(() => {
    if (!props.isGridMode || !props.gridLayout) return 0;
    // Calculate the right margin to match left margin for symmetry
    return leftMargin.value;
  });
  
  const getTabStyle = (tabIndex: number) => {
    if (!props.isGridMode || !props.gridLayout) {
      // Full width mode (exercises view)
      return {
        width: '25%',
        flexBasis: '25%',
        flexGrow: 0,
        flexShrink: 0
      };
    }
    
    // Grid mode (diamond view) - each tab spans 2 sections
    const gridWidth = props.gridLayout.svgBounds.width;
    const tabWidth = gridWidth / 4; // 4 tabs spanning the full grid width
    
    return {
      width: tabWidth + 'px',
      flexBasis: tabWidth + 'px',
      flexGrow: 0,
      flexShrink: 0
    };
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