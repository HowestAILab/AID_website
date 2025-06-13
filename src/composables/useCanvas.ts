import { ref, onMounted, nextTick, watch } from 'vue';
import { useProjects, type SelectedPinInfo } from './useProjects';
import { DEFAULT_KONVA_CONFIG, DEFAULT_IMAGE_CONFIG } from '@/constants/app';
import DoubleDiamond from '@/assets/DoubleDiamond.svg';

export function useCanvas() {
  const { currentProject, updateProjectSelectedPins, getCurrentProjectSelectedPins } = useProjects();
  
  // Container dimensions (formerly Konva config)
  const containerWidth = ref(DEFAULT_KONVA_CONFIG.width);
  const containerHeight = ref(DEFAULT_KONVA_CONFIG.height);
  
  // Keep configKonva for backward compatibility with layout calculations
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
  const diamondGridRef = ref<any>(null);

  const handleSelectedPinsChange = (pins: SelectedPinInfo[]) => {
    selectedPins.value = pins;
    // Save the selected pins to the current project
    updateProjectSelectedPins(pins);
  };

  const handleUnselectPin = (originalPinIndex: number) => {
    // Remove the pin from selectedPins array
    const updatedPins = selectedPins.value.filter(pin => pin.originalIndex !== originalPinIndex);
    selectedPins.value = updatedPins;
    
    // Update the project with the new selected pins
    updateProjectSelectedPins(updatedPins);
    
    // If DiamondGrid is available, update its state as well
    if (diamondGridRef.value) {
      diamondGridRef.value.loadSelectedPins(updatedPins);
    }
  };

  // Watch for current project changes and load the project's selected pins
  watch(currentProject, (project) => {
    // Load the selected pins for the current project
    if (project) {
      selectedPins.value = getCurrentProjectSelectedPins();
      // Update the grid with the project's selected pins
      nextTick(() => {
        if (diamondGridRef.value) {
          diamondGridRef.value.loadSelectedPins(selectedPins.value);
        }
      });
    } else {
      selectedPins.value = [];
    }
  }, { immediate: true });

  // Watch for diamondGridRef to become available and load selected pins
  watch(diamondGridRef, (grid) => {
    if (grid && currentProject.value) {
      const projectSelectedPins = getCurrentProjectSelectedPins();
      selectedPins.value = projectSelectedPins;
      grid.loadSelectedPins(projectSelectedPins);
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

  // Update container dimensions and sync with configKonva for layout compatibility
  const updateContainerDimensions = (width: number, height: number) => {
    containerWidth.value = width;
    containerHeight.value = height;
    configKonva.value.width = width;
    configKonva.value.height = height;
  };

  onMounted(() => {
    loadImage();
  });

  return {
    // Grid-specific properties
    containerWidth,
    containerHeight,
    diamondGridRef,
    updateContainerDimensions,
    
    // Legacy properties for backward compatibility
    configKonva,
    imageObj,
    configImage,
    selectedPins,
    konvaCanvasRef: diamondGridRef, // Alias for backward compatibility
    handleSelectedPinsChange,
    handleUnselectPin,
    loadImage,
  };
} 