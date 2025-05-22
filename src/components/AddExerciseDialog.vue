<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger asChild>
      <slot name="trigger"></slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <label
            for="exerciseName"
            class="text-right text-sm font-medium col-span-1"
            >Name</label
          >
          <Input
            id="exerciseName"
            type="text"
            v-model="exerciseData.name"
            placeholder="Exercise name"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <label
            for="exerciseDescription"
            class="text-right text-sm font-medium col-span-1"
            >Description</label
          >
          <Textarea
            id="exerciseDescription"
            v-model="exerciseData.description"
            placeholder="Exercise description"
            class="col-span-3 min-h-[80px]"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">Cancel</Button>
        <Button @click="handleSubmit">{{ mode === 'edit' ? 'Save Changes' : 'Add Exercise' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/index.ts";
import { toast } from "vue-sonner";

interface ExerciseData {
  name: string;
  description: string;
  location?: {
    phase?: string;
    step?: string;
    human_ai_scale?: number;
  };
}

const props = defineProps<{
  open: boolean;
  title: string;
  description: string;
  mode?: 'add' | 'edit';
  initialData?: ExerciseData;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "add-exercise", exercise: ExerciseData): void;
  (e: "edit-exercise", exercise: ExerciseData): void;
}>();

const isOpen = ref(props.open);
const exerciseData = reactive<ExerciseData>({
  name: "",
  description: "",
  location: {
    phase: "",
    step: "",
    human_ai_scale: 3,
  },
});

watch(
  () => props.open,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue && props.mode === 'edit' && props.initialData) {
      // Populate form with initial data when editing
      Object.assign(exerciseData, props.initialData);
    }
  }
);

watch(isOpen, (newValue) => {
  emit("update:open", newValue);
  if (!newValue) {
    resetForm();
  }
});

const resetForm = () => {
  exerciseData.name = "";
  exerciseData.description = "";
  exerciseData.location = { phase: "", step: "", human_ai_scale: 3 };
};

const validateForm = () => {
  if (!exerciseData.name.trim()) {
    toast.error("Exercise name is required.");
    return false;
  }
  if (!exerciseData.description.trim()) {
    toast.error("Exercise description is required.");
    return false;
  }
  return true;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  const exercisePayload: ExerciseData = {
    name: exerciseData.name,
    description: exerciseData.description,
    location: {
      phase: exerciseData.location?.phase || "",
      step: exerciseData.location?.step || "",
      human_ai_scale: exerciseData.location?.human_ai_scale ?? 3,
    },
  };

  if (props.mode === 'edit') {
    emit("edit-exercise", exercisePayload);
  } else {
    emit("add-exercise", exercisePayload);
  }
  
  isOpen.value = false;
};
</script>
