import { ref, onMounted, nextTick, watch } from 'vue';
import { useProjects } from './useProjects';
import { useEthicsExercises } from './useEthicsExercises';
import type { SelectedPinInfo } from '@/types/exercise';
import DoubleDiamond from '@/assets/DoubleDiamond.svg';

export function useCanvas() {
  const { currentProject, updateProjectSelectedPins, getCurrentProjectSelectedPins } = useProjects();
  const { addPredefinedEthicsExercises, removeEthicsExercise } = useEthicsExercises();

  // Container dimensions
  const containerWidth = ref<number>(834);
  const containerHeight = ref<number>(420);

  const imageObj = ref<HTMLImageElement | null>(null);
  const selectedPins = ref<SelectedPinInfo[]>([]);
  const diamondGridRef = ref<any>(null);

  const handleSelectedPinsChange = (pins: SelectedPinInfo[]) => {
    // Always ensures the full, correct list is constructed
    const finalPins = addPredefinedEthicsExercises(pins);
    selectedPins.value = finalPins;
    updateProjectSelectedPins(finalPins);
  };

  const handleUnselectPin = (id: number | string, isEthics: boolean) => {
    let updatedPins: SelectedPinInfo[];

    if (isEthics) {
        updatedPins = removeEthicsExercise(id as string, selectedPins.value);
    } else {
        updatedPins = selectedPins.value.filter(pin => !pin.isEthicsExercise && pin.originalIndex !== id);
    }

    selectedPins.value = updatedPins;
    updateProjectSelectedPins(updatedPins);
    if (diamondGridRef.value) {
        diamondGridRef.value.loadSelectedPins(updatedPins);
    }
  };

  watch(currentProject, (project) => {
    if (project) {
      const projectPins = getCurrentProjectSelectedPins();
      // Also apply the logic here to ensure consistency when loading a project
      const finalPins = addPredefinedEthicsExercises(projectPins);
      selectedPins.value = finalPins;
      
      // Debug: Check project loaded pins
      console.log('🔧 useCanvas Debug - Project loaded pins:', {
        projectName: project.name,
        projectId: project.id,
        totalPins: projectPins.length,
        pinsWithEthics: projectPins.filter(pin => !!pin.ethical).length,
        samplePins: projectPins.slice(0, 3).map(pin => ({
          name: pin.name,
          hasEthical: !!pin.ethical,
          ethicalKeys: pin.ethical ? Object.keys(pin.ethical) : 'none'
        }))
      });
      
      nextTick(() => {
        if (diamondGridRef.value) {
          diamondGridRef.value.loadSelectedPins(selectedPins.value);
        }
      });
    } else {
      selectedPins.value = [];
    }
  }, { immediate: true });

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
        resolve();
      };
    });
  };

  const updateContainerDimensions = (width: number, height: number) => {
    containerWidth.value = width;
    containerHeight.value = height;
  };

  onMounted(() => {
    loadImage();
  });

  return {
    containerWidth,
    containerHeight,
    diamondGridRef,
    updateContainerDimensions,
    imageObj,
    selectedPins,
    handleSelectedPinsChange,
    handleUnselectPin,
    loadImage,
  };
} 