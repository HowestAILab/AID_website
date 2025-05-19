<template>
  <div class="p-4 border border-[#E5E7EB] rounded-lg shadow-sm">
    <p class="text-lg font-medium mb-1">{{ title }}</p>
    <p class="text-[#4B5563] mb-4">{{ description }}</p>
    <button class="flex items-center gap-2 text-[#F59E0C]" @click="$emit('addToDiamond')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m1 5h-2v4H7v2h4v4h2v-4h4v-2h-4z"
        />
      </svg>
      <p>Add to Diamond</p>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();

defineEmits<{
  (e: 'addToDiamond'): void;
}>();
</script> 