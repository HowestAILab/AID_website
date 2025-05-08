<template>
  <div class="p-4 w-full h-full overflow-y-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-start">
      <DirectoryCard
        v-for="(card, index) in directoryData"
        :key="index"
        :title="card.name"
        :content="card.description"
        :tag="card.diamond_position"
        :color="card.color"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DirectoryCard from "@/components/DirectoryCard.vue";
import dummyData from "../../dummy.json";

interface Tool {
  name: string;
  description: string;
  icon: string;
  location: number[];
  diamond_position: string;
  color: string;
  prompt_list: string[];
  ethical: {
    before: string[];
    after: string[];
  };
}

// Assuming dummyData.tools is the array we need
const directoryData = computed(() => {
  if (Array.isArray(dummyData.tools)) {
    return dummyData.tools as Tool[];
  }
  return [];
});

</script>
