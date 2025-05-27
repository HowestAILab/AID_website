<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 relative group h-full flex flex-col">
    <!-- Delete Button -->
    <button
      @click="$emit('delete-project')"
      class="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
    >
      <Trash2 class="w-4 h-4" />
    </button>
    <div class="flex-grow space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 pr-8">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ description }}</p>
    </div>
    <div class="mt-auto space-y-4 pt-4">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <span class="text-sm text-gray-500">Created: {{ formattedCreatedDate }}</span>
      </div>
      <div>
        <button 
          @click="$emit('open-project')"
          class="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Open Project
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  title: string;
  description: string;
  createdDate: string;
}>();

defineEmits<{
  (e: 'open-project'): void;
  (e: 'delete-project'): void;
}>();

const formattedCreatedDate = computed(() => {
  const date = new Date(props.createdDate);
  if (isNaN(date.getTime())) {
    const parts = props.createdDate.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        return `${parsedDate.getDate().toString().padStart(2, '0')}/${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}/${parsedDate.getFullYear()}`;
      }
    }
    return props.createdDate;
  }
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

</script> 