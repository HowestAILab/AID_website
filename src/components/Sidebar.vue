<template>
  <div
    class="flex flex-col h-full w-54 bg-white border-r border-gray-200 p-4 space-y-4"
  >
    <div class="flex flex-col items-start mb-6">
      <div class="flex items-center space-x-3 mb-1">
        <Avatar>
          <AvatarImage
            src="https://i.pravatar.cc/40?u=willinno"
            alt="Will Inno"
          />
          <AvatarFallback>WI</AvatarFallback>
        </Avatar>
        <div>
          <p class="font-semibold text-sm text-gray-800">Will Inno</p>
          <p class="text-xs text-[#A1824A]">UX designer</p>
        </div>
      </div>
    </div>

    <nav class="flex-grow space-y-1">
      <a
        href="#"
        @click.prevent="setActive('overview')"
        :class="[
          'flex items-center px-3 py-2.5 text-sm font-medium rounded-full text-[#1C170D]',
          activeItem === 'overview' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
        ]"
      >
        <LayoutDashboard class="w-5 h-5 mr-3" />
        Overview
      </a>
      <a
        href="#"
        @click.prevent="setActive('diamond')"
        :class="[
          'flex items-center px-3 py-2.5 text-sm font-medium rounded-full text-[#1C170D]',
          activeItem === 'diamond' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
        ]"
      >
        <Gem class="w-5 h-5 mr-3" />
        Diamond
      </a>
      <a
        href="#"
        @click.prevent="setActive('pipeline')"
        :class="[
          'flex items-center px-3 py-2.5 text-sm font-medium rounded-full text-[#1C170D]',
          activeItem === 'pipeline' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
        ]"
      >
        <GitFork class="w-5 h-5 mr-3" />
        Pipeline
      </a>
      <a
        href="#"
        @click.prevent="setActive('tools')"
        :class="[
          'flex items-center px-3 py-2.5 text-sm font-medium rounded-full text-[#1C170D]',
          activeItem === 'tools' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
        ]"
      >
        <Briefcase class="w-5 h-5 mr-3" />
        Tools
      </a>
    </nav>

    <div class="mt-auto"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import { LayoutDashboard, Gem, GitFork, Briefcase } from "lucide-vue-next";

type ActiveItem = "overview" | "diamond" | "pipeline" | "tools";

const activeItem = ref<ActiveItem>("diamond");

const setActive = (item: ActiveItem) => {
  activeItem.value = item;
};
</script>
