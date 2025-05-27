<template>
  <Dialog v-model:open="localOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Create a new human-AI collaboration design project. You can always edit these details later.
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
            Create Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'create-project', projectData: { name: string; description: string; createdDate: string }): void;
}>();

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const formData = ref({
  name: '',
  description: ''
});

const handleSubmit = () => {
  if (formData.value.name.trim()) {
    const projectData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      createdDate: new Date().toLocaleDateString()
    };
    
    emit('create-project', projectData);
    
    formData.value = {
      name: '',
      description: ''
    };
    
    localOpen.value = false;
  }
};

// Reset form when dialog closes
watch(localOpen, (isOpen) => {
  if (!isOpen) {
    formData.value = {
      name: '',
      description: ''
    };
  }
});
</script> 