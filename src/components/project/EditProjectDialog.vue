<template>
  <Dialog v-model:open="localOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogDescription>
          Update the details of your project. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="project-name" class="text-sm font-medium">Project Name</label>
          <Input
            id="project-name"
            v-model="formData.name"
            placeholder="Enter project name"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="project-description" class="text-sm font-medium">Description</label>
          <Textarea
            id="project-description"
            v-model="formData.description"
            placeholder="Enter project description"
            rows="3"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="localOpen = false">
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/composables/useProjects';

const props = defineProps<{
  open: boolean;
  projectData: Project | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'update-project', projectData: { id: string; name: string; description: string }): void;
}>();

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const formData = ref({
  name: '',
  description: ''
});

watch(() => props.projectData, (newVal) => {
  if (newVal) {
    formData.value.name = newVal.name;
    formData.value.description = newVal.description;
  } else {
    formData.value.name = '';
    formData.value.description = '';
  }
}, { immediate: true });

const handleSubmit = () => {
  if (formData.value.name.trim() && props.projectData) {
    emit('update-project', {
      id: props.projectData.id,
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
    });
    localOpen.value = false;
  }
};

// Reset form when dialog closes and projectData is not provided (e.g. initial state)
watch(localOpen, (isOpen) => {
  if (!isOpen && !props.projectData) {
    formData.value = {
      name: '',
      description: ''
    };
  }
});

</script> 