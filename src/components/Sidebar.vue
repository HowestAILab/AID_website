<template>
  <div
    class="relative flex flex-col h-full"
  >
    <div
      :class="[
        'flex flex-col h-full transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-54',
        'bg-white border-r border-gray-200',
        isCollapsed ? 'px-2 py-4' : 'p-4',
        'space-y-4'
      ]"
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
          <div :class="{ 'hidden': isCollapsed }">
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
            'flex items-center text-sm font-medium rounded-full text-[#1C170D]',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'overview' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
          ]"
        >
          <LayoutDashboard :class="[
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          ]" />
          <span :class="{ 'hidden': isCollapsed }">Overview</span>
        </a>
        <a
          href="#"
          @click.prevent="setActive('diamond')"
          :class="[
            'flex items-center text-sm font-medium rounded-full text-[#1C170D]',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'diamond' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
          ]"
        >
          <Gem :class="[
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          ]" />
          <span :class="{ 'hidden': isCollapsed }">Diamond</span>
        </a>
        <a
          href="#"
          @click.prevent="setActive('pipeline')"
          :class="[
            'flex items-center text-sm font-medium rounded-full text-[#1C170D]',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'pipeline' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
          ]"
        >
          <GitFork :class="[
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          ]" />
          <span :class="{ 'hidden': isCollapsed }">Pipeline</span>
        </a>
        <a
          href="#"
          @click.prevent="setActive('tools')"
          :class="[
            'flex items-center text-sm font-medium rounded-full text-[#1C170D]',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'tools' ? 'bg-[#F5F0E5]' : 'hover:bg-gray-100',
          ]"
        >
          <Briefcase :class="[
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          ]" />
          <span :class="{ 'hidden': isCollapsed }">Tools</span>
        </a>
      </nav>

      <div :class="[
        'mt-auto text-[#1C170D]',
        isCollapsed ? 'flex flex-col space-y-4 items-center' : 'flex justify-between'
      ]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button class="flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100">
                <Settings :class="[
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                ]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button class="flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100">
                <LogOut :class="[
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                ]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <!-- Collapse trigger button -->
    <button
      @click="toggleCollapse"
      class="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 z-10 cursor-pointer"
    >
      <ChevronLeft
        class="w-4 h-4 transition-transform duration-300"
        :class="{ 'rotate-180': isCollapsed }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import {
  LayoutDashboard,
  Gem,
  GitFork,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-vue-next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActiveItem = "overview" | "diamond" | "pipeline" | "tools";

const activeItem = ref<ActiveItem>("diamond");
const isCollapsed = ref(false);

const setActive = (item: ActiveItem) => {
  activeItem.value = item;
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
