<template>
  <div
    class="border-t border-gray-200 bg-white px-4 py-3 h-20 flex items-center"
  >
    <Network class="w-5 h-5 mr-3 text-gray-500" />
    <span class="text-sm font-medium text-gray-700">Current pipeline</span>
    <div class="flex-grow"></div>
    <ChevronUp class="w-5 h-5 text-gray-500" />
  </div>
</template>

<script setup lang="ts">
import { Network, ChevronUp } from "lucide-vue-next";
</script>
