<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogDescription>
          A project named "{{ originalName }}" already exists. Please enter a new name for the imported project.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <label for="name" class="text-right col-span-1"> New Name </label>
          <Input id="name" v-model="newName" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
        <Button type="submit" @click="handleConfirm" :disabled="!newName.trim()">Confirm and Import</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  open: boolean;
  projectData: { name: string } | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "confirm-rename-and-import", newName: string): void;
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const newName = ref("");
const originalName = ref("");

watch(
  () => props.open,
  (newVal) => {
    if (newVal && props.projectData) {
      originalName.value = props.projectData.name;
      newName.value = props.projectData.name + " (Copy)";
    } else if (!newVal) {
      newName.value = "";
      originalName.value = "";
    }
  }
);

watch(
  () => props.projectData,
  (newData) => {
    if (props.open && newData) {
      originalName.value = newData.name;
      newName.value = newData.name + " (Copy)";
    }
  }
);

const handleConfirm = () => {
  if (newName.value.trim()) {
    emit("confirm-rename-and-import", newName.value.trim());
    isOpen.value = false;
  }
};

const handleCancel = () => {
  isOpen.value = false;
};
</script> 