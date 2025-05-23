import { ref, shallowRef, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  SECTION_LABEL_TEXTS,
  FULL_HEIGHT_LINE_INDICES,
  IMAGE_WIDTH_SCALE_FACTOR,
  IMAGE_ASPECT_RATIO,
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
      // These correspond to the midpoints of the Discover, Define, Develop, and Deliver tab sections
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
    },
    configKonva: { value: any },
    configImage: { value: any }
  ) => {
    // Use the mainElement's width for the canvas
    if (mainElementRef.value) {
      const mainWidth = mainElementRef.value.clientWidth;
      configKonva.value.x = 0; // Start from the left edge
      configKonva.value.width = mainWidth; // Use full container width
      configKonva.value.height = mainWidth * IMAGE_ASPECT_RATIO;

      configImage.value.width = mainWidth;
      configImage.value.height = mainWidth * IMAGE_ASPECT_RATIO;
      configImage.value.x = 0; // Image should also start at x=0 by default

      // Proceed to calculate overlays if other refs are available
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
        // Ensure rects are valid before calculating offsets from them
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
            o[0],
            m[0],
            o[1],
            m[1],
            o[2],
            m[2],
            o[3],
            m[3],
            o[4],
          ];

          // Use the full width between the first and last rendering lines
          if (
            allRenderingLineOffsets.value &&
            allRenderingLineOffsets.value.length >= 9
          ) {
            const canvasStartX = allRenderingLineOffsets.value[0];
            const newCanvasWidth = mainWidth - canvasStartX; // Extends from first line to edge of main container

            if (newCanvasWidth > 0) {
              configKonva.value.x = canvasStartX;
              configKonva.value.width = newCanvasWidth;
              configKonva.value.height = newCanvasWidth * IMAGE_ASPECT_RATIO; // Konva stage height

              // ADJUST THIS FACTOR (e.g., 0.95 for 95%, 1.0 for 100%) to scale the image
              configImage.value.width =
                configKonva.value.width * IMAGE_WIDTH_SCALE_FACTOR;
              configImage.value.height = configImage.value.width * IMAGE_ASPECT_RATIO; // Maintain image's aspect ratio

              // Align the image to the left of the Konva stage
              configImage.value.x = 0;

              const labelsData: { text: string; left: number; width: number }[] =
                [];
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
            } else {
              console.warn(
                "Calculated newCanvasWidth (mainWidth - canvasStartX) is not positive. " +
                  "Canvas will use full mainWidth starting at x=0."
              );
              // Fallback to canvas filling the entire main element, as set at the start of updateLayout
              configKonva.value.x = 0;
              configKonva.value.width = mainWidth;
              configKonva.value.height = mainWidth * IMAGE_ASPECT_RATIO;
              configImage.value.width = mainWidth;
              configImage.value.height = mainWidth * IMAGE_ASPECT_RATIO;
              configImage.value.x = 0;
            }
          } else {
            console.warn(
              "allRenderingLineOffsets not populated sufficiently. Canvas will use mainWidth-based size or previous valid size."
            );
            // If offsets are not sufficient, the Konva/Image dimensions set earlier (from mainWidth) will remain.
          }
        } else {
          console.warn(
            "Base vertical line offsets not fully calculated (expected 5). Visual line/label rendering might be incomplete."
          );
          allRenderingLineOffsets.value = [];
          sectionLabels.value = [];
          // Konva settings already handled by user's logic if mainElementRef.value is true
        }
      } else {
        // mainElementRef.value is true, but one or more button refs are missing.
        console.warn(
          "One or more button elements (Discover, Define, Develop, Deliver) not found. Vertical lines/labels will not be rendered or will be cleared."
        );
        verticalLineOffsets.value = [];
        allRenderingLineOffsets.value = [];
        sectionLabels.value = [];
        labelBarCalculatedTop.value = 0;
        // Konva settings already handled by user's logic
      }
    } else {
      // mainElementRef.value is null. This is the original fallback logic.
      console.warn(
        "Main element not found for layout calculation. Using default dimensions for Konva and no vertical lines/labels."
      );
      verticalLineOffsets.value = [];
      allRenderingLineOffsets.value = [];
      sectionLabels.value = [];
      labelBarCalculatedTop.value = 0;

      configKonva.value.x = 0;
      configKonva.value.width = 834;
      configKonva.value.height = 420;
      configImage.value.width = 834;
      configImage.value.height = 420;
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