<template>
  <div class="flex-1 bg-gray-50 overflow-y-auto">
    <div class="max-w-7xl mx-auto p-8">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Projects Overview</h1>
          <p class="text-gray-600 mt-1">Manage your human-AI collaboration design projects</p>
        </div>
        <button 
          @click="showNewProjectDialog = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus class="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <!-- Projects Grid -->
      <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :title="project.name"
          :description="project.description"
          :created-date="project.createdDate"
          @open-project="() => handleOpenProject(project.id)"
          @delete-project="() => handleDeleteProject(project.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <div class="text-gray-400 mb-4">
          <Gem class="w-16 h-16" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
        <p class="text-gray-600 mb-6 text-center max-w-md">
          Get started by creating your first human-AI collaboration design project
        </p>
        <button 
          @click="showNewProjectDialog = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus class="w-5 h-5" />
          <span>Create Your First Project</span>
        </button>
      </div>
    </div>

    <!-- New Project Dialog -->
    <NewProjectDialog
      v-model:open="showNewProjectDialog"
      @create-project="handleCreateProject"
    />

    <!-- Delete Confirmation Alert Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project 
            <strong>"{{ projectToDelete?.name }}"</strong> and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteProject" class="bg-red-600 hover:bg-red-700">
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Gem } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import ProjectCard from './ProjectCard.vue';
import NewProjectDialog from './NewProjectDialog.vue';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProjects } from '@/composables/useProjects';
import type { Project } from '@/composables/useProjects';

const emit = defineEmits<{
  (e: 'navigate-to-project', projectId: string): void;
}>();

const { projects, createProject, setCurrentProject, deleteProject } = useProjects();

const showNewProjectDialog = ref(false);
const showDeleteDialog = ref(false);
const projectToDelete = ref<Project | null>(null);

const handleCreateProject = (projectData: { name: string; description: string; createdDate: string }) => {
  const newProject = createProject(projectData);
  toast.success(`Project "${newProject.name}" created successfully!`);
  // Navigate to diamond view with the new project
  emit('navigate-to-project', newProject.id);
};

const handleOpenProject = (projectId: string) => {
  setCurrentProject(projectId);
  // Navigate to diamond view with the selected project
  emit('navigate-to-project', projectId);
};

const handleDeleteProject = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId);
  if (project) {
    projectToDelete.value = project;
    showDeleteDialog.value = true;
  }
};

const confirmDeleteProject = () => {
  if (projectToDelete.value) {
    deleteProject(projectToDelete.value.id);
    toast.success(`Project "${projectToDelete.value.name}" deleted successfully!`);
    projectToDelete.value = null;
    showDeleteDialog.value = false;
  }
};
</script> 