import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue';
import {
  SECTION_LABEL_TEXTS,
  FULL_HEIGHT_LINE_INDICES,
} from '@/constants/app';

export function useLayout() {
  const mainElementRef = shallowRef<HTMLElement | null>(null);
  const labelBarRef = shallowRef<HTMLElement | null>(null);
  
  const verticalLineOffsets = ref<number[]>([]);
  const allRenderingLineOffsets = ref<number[]>([]);
  const sectionLabels = ref<{ text: string; left: number; width: number }[]>([]);
  const labelBarCalculatedTop = ref<number>(0);
  const mainContentScreenLeft = ref(0);

  const addExercisesButtonCenterOffsets = computed(() => {
    if (
      allRenderingLineOffsets.value &&
      allRenderingLineOffsets.value.length >= 8
    ) {
      return [
        allRenderingLineOffsets.value[1],
        allRenderingLineOffsets.value[3],
        allRenderingLineOffsets.value[5],
        allRenderingLineOffsets.value[7],
      ];
    }
    return [];
  });

  const updateLayout = (
    buttonRefs: {
      Discover: { value: HTMLButtonElement | null };
      Define: { value: HTMLButtonElement | null };
      Develop: { value: HTMLButtonElement | null };
      Deliver: { value: HTMLButtonElement | null };
    }
  ) => {
    if (mainElementRef.value) {
      // Calculate tab positions and offsets
      if (
        buttonRefs.Discover.value &&
        buttonRefs.Define.value &&
        buttonRefs.Develop.value &&
        buttonRefs.Deliver.value
      ) {
        const mainRect = mainElementRef.value.getBoundingClientRect();
        mainContentScreenLeft.value = mainRect.left;

        const discoverRect = buttonRefs.Discover.value.getBoundingClientRect();
        const defineRect = buttonRefs.Define.value.getBoundingClientRect();
        const developRect = buttonRefs.Develop.value.getBoundingClientRect();
        const deliverRect = buttonRefs.Deliver.value.getBoundingClientRect();

        const offsets: number[] = [];
        if (discoverRect && mainRect) {
          offsets.push(discoverRect.left - mainRect.left);
          offsets.push(discoverRect.right - mainRect.left);
        }
        if (defineRect && mainRect) {
          offsets.push(defineRect.right - mainRect.left);
        }
        if (developRect && mainRect) {
          offsets.push(developRect.right - mainRect.left);
        }
        if (deliverRect && mainRect) {
          offsets.push(deliverRect.right - mainRect.left);
        }
        verticalLineOffsets.value = offsets;

        if (verticalLineOffsets.value.length === 5) {
          const o = verticalLineOffsets.value;
          const m: number[] = [];
          m[0] = (o[0] + o[1]) / 2;
          m[1] = (o[1] + o[2]) / 2;
          m[2] = (o[2] + o[3]) / 2;
          m[3] = (o[3] + o[4]) / 2;

          allRenderingLineOffsets.value = [
            o[0], m[0], o[1], m[1], o[2], m[2], o[3], m[3], o[4],
          ];

          // Create section labels
          if (allRenderingLineOffsets.value.length >= 9) {
            const labelsData: { text: string; left: number; width: number }[] = [];
            const sectionPoints = allRenderingLineOffsets.value;

            for (let i = 0; i < 8; i++) {
              const sectionStart = sectionPoints[i];
              const sectionEnd = sectionPoints[i + 1];
              labelsData.push({
                text: SECTION_LABEL_TEXTS[i],
                left: sectionStart,
                width: sectionEnd - sectionStart,
              });
            }
            sectionLabels.value = labelsData;

            if (labelBarRef.value) {
              labelBarCalculatedTop.value = labelBarRef.value.offsetTop;
            }
          }
        } else {
          allRenderingLineOffsets.value = [];
          sectionLabels.value = [];
        }
      } else {
        verticalLineOffsets.value = [];
        allRenderingLineOffsets.value = [];
        sectionLabels.value = [];
        labelBarCalculatedTop.value = 0;
      }
    } else {
      verticalLineOffsets.value = [];
      allRenderingLineOffsets.value = [];
      sectionLabels.value = [];
      labelBarCalculatedTop.value = 0;
    }
  };

  const setupResizeListener = (updateLayoutCallback: () => void) => {
    const resizeHandler = () => updateLayoutCallback();
    
    onMounted(() => {
      window.addEventListener("resize", resizeHandler);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeHandler);
    });

    return resizeHandler;
  };

  return {
    mainElementRef,
    labelBarRef,
    verticalLineOffsets,
    allRenderingLineOffsets,
    sectionLabels,
    labelBarCalculatedTop,
    mainContentScreenLeft,
    addExercisesButtonCenterOffsets,
    fullHeightLineIndices: FULL_HEIGHT_LINE_INDICES,
    updateLayout,
    setupResizeListener,
  };
} 