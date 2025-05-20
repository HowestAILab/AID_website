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
            for="exerciseTitle"
            class="text-right text-sm font-medium col-span-1"
            >Title</label
          >
          <Input
            id="exerciseTitle"
            type="text"
            v-model="exerciseData.title"
            placeholder="Exercise title"
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
        <div class="grid grid-cols-4 items-center gap-4">
          <label class="text-right text-sm font-medium col-span-1">Type</label>
          <div class="col-span-3 w-full">
            <Select v-model="exerciseData.driveType" class="w-full">
              <SelectTrigger class="!w-full">
                <SelectValue placeholder="Select exercise type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel class="font-semibold">Exercise Types</SelectLabel>
                  <SelectItem value="human">Human</SelectItem>
                  <SelectItem value="human-ai">Human + AI</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <label
            for="exerciseX"
            class="text-right text-sm font-medium col-span-1"
            >X Position</label
          >
          <Input
            id="exerciseX"
            type="number"
            v-model.number="exerciseData.x"
            placeholder="0 - 1400"
            min="0"
            max="1400"
            class="col-span-3"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <label
            for="exerciseY"
            class="text-right text-sm font-medium col-span-1"
            >Y Position</label
          >
          <Input
            id="exerciseY"
            type="number"
            v-model.number="exerciseData.y"
            placeholder="0 - 700"
            min="0"
            max="700"
            class="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">Cancel</Button>
        <Button @click="handleAddExercise">Add Exercise</Button>
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
  title: string;
  description: string;
  driveType: "human" | "human-ai" | "ai";
  x?: number;
  y?: number;
}

const props = defineProps<{
  open: boolean;
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "add-exercise", exercise: ExerciseData): void;
}>();

const isOpen = ref(props.open);
const exerciseData = reactive<ExerciseData>({
  title: "",
  description: "",
  driveType: "human",
  x: undefined,
  y: undefined,
});

watch(
  () => props.open,
  (newValue) => {
    isOpen.value = newValue;
  }
);

watch(isOpen, (newValue) => {
  emit("update:open", newValue);
  if (!newValue) {
    exerciseData.title = "";
    exerciseData.description = "";
    exerciseData.driveType = "human";
    exerciseData.x = undefined;
    exerciseData.y = undefined;
  }
});

const handleAddExercise = () => {
  if (!exerciseData.title.trim()) {
    toast.error("Exercise title is required.");
    return;
  }
  if (!exerciseData.description.trim()) {
    toast.error("Exercise description is required.");
    return;
  }
  if (exerciseData.x === undefined || exerciseData.x === null) {
    toast.error("X Position is required and must be a number.");
    return;
  }
  if (exerciseData.x < 0 || exerciseData.x > 1400) {
    toast.error("X Position must be between 0 and 1400.");
    return;
  }
  if (exerciseData.y === undefined || exerciseData.y === null) {
    toast.error("Y Position is required and must be a number.");
    return;
  }
  if (exerciseData.y < 0 || exerciseData.y > 700) {
    toast.error("Y Position must be between 0 and 700.");
    return;
  }

  if (
    typeof exerciseData.x !== "number" ||
    typeof exerciseData.y !== "number"
  ) {
    toast.error("X and Y Positions must be valid numbers.");
    return;
  }

  emit("add-exercise", {
    title: exerciseData.title,
    description: exerciseData.description,
    driveType: exerciseData.driveType,
    x: exerciseData.x,
    y: exerciseData.y,
  });
  isOpen.value = false;
};
</script>
