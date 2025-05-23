import { ref, watch } from 'vue';
import { useProjects } from './useProjects';

export function useNavigation() {
  const { currentProject, hasProjects } = useProjects();
  
  const currentPage = ref('overview');
  const currentPhase = ref('Discover');

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

  return {
    currentPage,
    currentPhase,
    handleNavigate,
    handleNavigateToProject,
    handleExerciseButtonClick,
    handleExercisesClose,
    handlePipelineClose,
  };
} 