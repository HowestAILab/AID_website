import { ref, onMounted, nextTick, watch } from 'vue';
import { useProjects, type SelectedPinInfo } from './useProjects';
import { DEFAULT_KONVA_CONFIG, DEFAULT_IMAGE_CONFIG } from '@/constants/app';
import DoubleDiamond from '@/assets/DoubleDiamond.svg';

export function useCanvas() {
  const { currentProject, updateProjectSelectedPins, getCurrentProjectSelectedPins } = useProjects();
  
  const configKonva = ref({
    width: DEFAULT_KONVA_CONFIG.width,
    height: DEFAULT_KONVA_CONFIG.height,
    x: DEFAULT_KONVA_CONFIG.x,
    y: DEFAULT_KONVA_CONFIG.y,
  });

  const imageObj = ref<HTMLImageElement | null>(null);
  const configImage = ref({
    image: null as HTMLImageElement | null,
    width: DEFAULT_IMAGE_CONFIG.width,
    height: DEFAULT_IMAGE_CONFIG.height,
    x: DEFAULT_IMAGE_CONFIG.x,
  });

  const selectedPins = ref<SelectedPinInfo[]>([]);
  const konvaCanvasRef = ref<any>(null);

  const handleSelectedPinsChange = (pins: SelectedPinInfo[]) => {
    selectedPins.value = pins;
    // Save the selected pins to the current project
    updateProjectSelectedPins(pins);
  };

  const handleUnselectPin = (originalPinIndex: number) => {
    if (konvaCanvasRef.value) {
      konvaCanvasRef.value.togglePinSelected(originalPinIndex);
    }
  };

  // Watch for current project changes and load the project's selected pins
  watch(currentProject, (project) => {
    // Load the selected pins for the current project
    if (project) {
      selectedPins.value = getCurrentProjectSelectedPins();
      // Update the canvas with the project's selected pins
      nextTick(() => {
        if (konvaCanvasRef.value) {
          konvaCanvasRef.value.loadSelectedPins(selectedPins.value);
        }
      });
    } else {
      selectedPins.value = [];
    }
  });

  // Watch for konvaCanvasRef to become available and load selected pins
  watch(konvaCanvasRef, (canvas) => {
    if (canvas && currentProject.value) {
      const projectSelectedPins = getCurrentProjectSelectedPins();
      selectedPins.value = projectSelectedPins;
      canvas.loadSelectedPins(projectSelectedPins);
    }
  });

  const loadImage = () => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = DoubleDiamond;
      img.onload = () => {
        imageObj.value = img;
        configImage.value.image = img;
        resolve();
      };
    });
  };

  onMounted(() => {
    loadImage();
  });

  return {
    configKonva,
    imageObj,
    configImage,
    selectedPins,
    konvaCanvasRef,
    handleSelectedPinsChange,
    handleUnselectPin,
    loadImage,
  };
} 