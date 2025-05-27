import { ref, computed, watch } from 'vue';

export interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
  description: string;
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

const PROJECTS_STORAGE_KEY = 'aid-projects';
const CURRENT_PROJECT_STORAGE_KEY = 'aid-current-project';

const saveProjectsToStorage = (projectsData: Project[]) => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsData));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

const loadProjectsFromStorage = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
    return [];
  }
};

const saveCurrentProjectIdToStorage = (projectId: string | null) => {
  try {
    if (projectId) {
      localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, projectId);
    } else {
      localStorage.removeItem(CURRENT_PROJECT_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save current project ID to localStorage:', error);
  }
};

const loadCurrentProjectIdFromStorage = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load current project ID from localStorage:', error);
    return null;
  }
};

const projects = ref<Project[]>(loadProjectsFromStorage());
const currentProjectId = ref<string | null>(loadCurrentProjectIdFromStorage());

// Watch for changes and save to localStorage
watch(projects, (newProjects) => {
  saveProjectsToStorage(newProjects);
}, { deep: true });

watch(currentProjectId, (newCurrentProjectId) => {
  saveCurrentProjectIdToStorage(newCurrentProjectId);
});

export function useProjects() {
  const currentProject = computed(() => 
    projects.value.find(p => p.id === currentProjectId.value) || null
  );

  const hasProjects = computed(() => projects.value.length > 0);

  const createProject = (
    projectData: { 
      name: string; 
      description: string; 
      createdDate: string 
    },
    importedSelectedPins?: SelectedPinInfo[]
  ): Project => {
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      selectedPins: importedSelectedPins || []
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

  const updateProject = (projectId: string, updatedData: { name: string; description: string }) => {
    const project = projects.value.find(p => p.id === projectId);
    if (project) {
      project.name = updatedData.name;
      project.description = updatedData.description;
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
    getCurrentProjectSelectedPins,
    updateProject
  };
} 