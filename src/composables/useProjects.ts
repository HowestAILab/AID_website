import { ref, computed } from 'vue';

export interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  selectedPins: SelectedPinInfo[];
}

const projects = ref<Project[]>([]);
const currentProjectId = ref<string | null>(null);

export function useProjects() {
  const currentProject = computed(() => 
    projects.value.find(p => p.id === currentProjectId.value) || null
  );

  const hasProjects = computed(() => projects.value.length > 0);

  const createProject = (projectData: { 
    name: string; 
    description: string; 
    createdDate: string 
  }): Project => {
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      selectedPins: []
    };
    
    projects.value.push(newProject);
    currentProjectId.value = newProject.id;
    return newProject;
  };

  const setCurrentProject = (projectId: string) => {
    const project = projects.value.find(p => p.id === projectId);
    if (project) {
      currentProjectId.value = projectId;
    }
  };

  const deleteProject = (projectId: string) => {
    const index = projects.value.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects.value.splice(index, 1);
      
      // If we deleted the current project, clear current project
      if (currentProjectId.value === projectId) {
        currentProjectId.value = projects.value.length > 0 ? projects.value[0].id : null;
      }
    }
  };

  const updateProjectSelectedPins = (pins: SelectedPinInfo[]) => {
    if (currentProject.value) {
      const projectIndex = projects.value.findIndex(p => p.id === currentProject.value!.id);
      if (projectIndex !== -1) {
        projects.value[projectIndex].selectedPins = [...pins];
      }
    }
  };

  const getCurrentProjectSelectedPins = (): SelectedPinInfo[] => {
    return currentProject.value?.selectedPins || [];
  };

  return {
    projects: computed(() => projects.value),
    currentProject,
    hasProjects,
    createProject,
    setCurrentProject,
    deleteProject,
    updateProjectSelectedPins,
    getCurrentProjectSelectedPins
  };
} 