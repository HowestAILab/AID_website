import { ref, watch } from 'vue';
import { useProjects } from './useProjects';
import type { DriveType } from '@/types/exercise';

const CURRENT_PAGE_STORAGE_KEY = 'aid-current-page';

export function useNavigation() {
  const { currentProject, hasProjects } = useProjects();
  
  const currentPage = ref('overview');
  const currentPhase = ref('Discover');
  const currentExerciseTitle = ref('');
  const currentExerciseDriveType = ref<DriveType | undefined>(undefined);

  const initializeNavigation = () => {
    try {
      const storedPage = localStorage.getItem(CURRENT_PAGE_STORAGE_KEY);
      if (storedPage) {
        // Basic validation: if trying to load a project-specific page without a project, default to overview
        if (
          (storedPage === 'diamond' || storedPage === 'exercises' || storedPage === 'pipeline') &&
          !currentProject.value
        ) {
          currentPage.value = 'overview';
          // Clear the invalid stored page
          localStorage.removeItem(CURRENT_PAGE_STORAGE_KEY);
        } else {
          currentPage.value = storedPage;
        }
      } else {
        currentPage.value = 'overview'; // Default if nothing is stored
      }
    } catch (error) {
      console.error('Failed to initialize navigation from localStorage:', error);
      currentPage.value = 'overview'; // Fallback to default
    }
  };

  initializeNavigation();

  // Watch for project changes - if no projects exist, stay on overview
  watch(hasProjects, (hasProjectsValue) => {
    if (!hasProjectsValue && currentPage.value !== 'overview') {
      currentPage.value = 'overview';
    }
  });

  // Watch for current project changes - if no current project, go to overview
  watch(currentProject, (project) => {
    if (!project && currentPage.value !== 'overview') {
      currentPage.value = 'overview';
      // Also clear stored page if current project is lost
      localStorage.removeItem(CURRENT_PAGE_STORAGE_KEY);
    }
  });

  // Save currentPage to localStorage whenever it changes
  watch(currentPage, (newPage) => {
    try {
      if (newPage) {
        localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, newPage);
      } else {
        // Should not happen, but if it does, remove the key
        localStorage.removeItem(CURRENT_PAGE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save currentPage to localStorage:', error);
    }
  });

  const handleNavigate = (page: string) => {
    // If no project is selected, stay on overview
    if ((page === 'diamond' || page === 'exercises' || page === 'pipeline') && !currentProject.value) {
      currentPage.value = 'overview';
      return;
    }
    
    currentPage.value = page;
    
    // If navigating to exercises but no phase selected, default to Discover
    if (page === 'exercises' && !currentPhase.value) {
      currentPhase.value = 'Discover';
    }
  };

  const handleNavigateToProject = (projectId: string) => {
    // Project is already set as current in OverviewPage
    currentPage.value = 'diamond';
  };

  const handleExerciseButtonClick = (phase: string) => {
    currentPage.value = 'exercises';
    currentPhase.value = phase;
  };

  const handleExercisesClose = () => {
    currentPage.value = 'diamond';
    currentPhase.value = '';
  };

  const handlePipelineClose = () => {
    currentPage.value = 'diamond';
  };

  const handleOpenExerciseDetail = (exerciseName: string, driveType?: DriveType) => {
    currentPage.value = 'exerciseDetail';
    currentExerciseTitle.value = exerciseName;
    currentExerciseDriveType.value = driveType;
  };

  const handleBackToPipeline = () => {
    currentPage.value = 'pipeline';
  };

  return {
    currentPage,
    currentPhase,
    currentExerciseTitle,
    currentExerciseDriveType,
    handleNavigate,
    handleNavigateToProject,
    handleExerciseButtonClick,
    handleExercisesClose,
    handlePipelineClose,
    handleOpenExerciseDetail,
    handleBackToPipeline,
  };
} 