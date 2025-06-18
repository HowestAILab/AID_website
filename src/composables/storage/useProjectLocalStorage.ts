import { watch, computed } from 'vue';
import { useProjects } from '@/composables/useProjects';

const { currentProject } = useProjects();

// Helper function to create a storage key
const createStorageKey = (key: string, projectId: string | null) => {
  if (!projectId) {
    // If there's no project ID, we can either throw an error or handle it gracefully.
    // For now, let's return a key that won't collide with project-specific data.
    // This might be useful for global settings that aren't project-specific.
    console.warn(`Storage key "${key}" is not associated with a project.`);
    return `global-${key}`;
  }
  return `project-${projectId}-${key}`;
};

export function useProjectLocalStorage(key: string) {
  const projectId = computed(() => currentProject.value?.id || null);

  const storageKey = computed(() => createStorageKey(key, projectId.value));

  const getItem = <T>(): T | null => {
    try {
      const storedValue = localStorage.getItem(storageKey.value);
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.error(`Failed to get item "${key}" from localStorage:`, error);
      return null;
    }
  };

  const setItem = <T>(value: T): void => {
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item "${key}" to localStorage:`, error);
    }
  };

  const removeItem = (): void => {
    try {
      localStorage.removeItem(storageKey.value);
    } catch (error) {
      console.error(`Failed to remove item "${key}" from localStorage:`, error);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    storageKey, // Exposing for debugging or advanced use
  };
}

// Function to clear all data for a specific project
export const clearProjectData = (projectId: string) => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`project-${projectId}-`)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error(`Failed to clear project data for project ID "${projectId}":`, error);
  }
}; 