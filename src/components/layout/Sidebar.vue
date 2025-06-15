<template>
  <div class="relative flex flex-col h-full">
    <div
      :class="[
        'flex flex-col h-full transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-54',
        'bg-white border-r border-gray-200',
        isCollapsed ? 'px-2 py-4' : 'p-4',
        'space-y-4',
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
          <div :class="{ hidden: isCollapsed }">
            <p class="font-semibold text-sm text-on-light-default">Will Inno</p>
            <p class="text-xs text-on-light-accent">UX designer</p>
          </div>
        </div>
        <!-- Project info moved to navigation below -->
      </div>
      <nav class="flex-grow space-y-1">
        <a
          href="#"
          @click.prevent="setActive('overview')"
          :class="[
            'flex items-center text-sm font-medium rounded-full text-on-light-default',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'overview' ? 'bg-light' : 'hover:bg-gray-100',
          ]"
        >
          <LayoutDashboard
            :class="[isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3']"
          />
          <span :class="{ hidden: isCollapsed }">Overview</span>
        </a>

        <!-- Diamond with sub-items -->
        <div class="space-y-1">
          <Popover v-model:open="showDiamondPopover" v-if="isCollapsed">
            <PopoverTrigger asChild>
              <a
                href="#"
                @click.prevent="handleDiamondClick"
                @mouseenter="handleDiamondMouseEnter"
                @mouseleave="handleDiamondMouseLeave"
                :class="[
                  'flex items-center text-sm font-medium rounded-full text-[#1C170D] transition-colors',
                  'p-2 justify-center',
                  activeItem === 'diamond' || activeItem.startsWith('diamond-')
                    ? 'bg-light hover:bg-[#EDE6D3]'
                    : 'hover:bg-gray-100',
                ]"
              >
                <Gem class="w-6 h-6" />
              </a>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              class="w-56 p-2"
              @mouseenter="handleDiamondMouseEnter"
              @mouseleave="handleDiamondMouseLeave"
            >
              <div class="space-y-1">
                <h4
                  class="font-medium text-sm text-[#1C170D] px-2 py-1 truncate"
                  :title="currentProject?.name"
                >
                  {{ currentProject?.name || "No Project" }}
                </h4>
                <!-- <p v-if="currentProject?.description" class="text-xs text-on-light-accent px-2 truncate mb-1">
                  {{ currentProject?.description }}
                </p> -->
                <Button
                  v-if="currentProject"
                  class="w-full mb-2 bg-white rounded border text-xs py-1 text-on-light-default cursor-pointer flex items-center justify-center gap-2"
                  @click="handleExportProject"
                >
                  <ArrowUpFromLine class="w-4 h-4" />
                  Export project
                </Button>
                <a
                  href="#"
                  @click.prevent="setActive('diamond')"
                  :class="[
                    'flex items-center text-sm font-medium rounded-lg text-[#1C170D] px-2 py-2 w-full',
                    activeItem === 'diamond' ? 'bg-light' : 'hover:bg-gray-100',
                  ]"
                >
                  <RectangleHorizontal class="w-4 h-4 mr-3" />
                  <span>Canvas</span>
                </a>
                <a
                  href="#"
                  @click.prevent="setActive('diamond-exercises')"
                  :class="[
                    'flex items-center text-sm font-medium rounded-lg text-[#1C170D] px-2 py-2 w-full',
                    activeItem === 'diamond-exercises'
                      ? 'bg-light'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  <FileText class="w-4 h-4 mr-3" />
                  <span>Exercises</span>
                </a>
                <a
                  href="#"
                  @click.prevent="setActive('diamond-pipeline')"
                  :class="[
                    'flex items-center text-sm font-medium rounded-lg text-[#1C170D] px-2 py-2 w-full',
                    activeItem === 'diamond-pipeline'
                      ? 'bg-light'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  <GitFork class="w-4 h-4 mr-3" />
                  <span>Pipeline</span>
                </a>
                <a
                  href="#"
                  @click.prevent="setActive('diamond-reflexion')"
                  :class="[
                    'flex items-center text-sm font-medium rounded-lg text-[#1C170D] px-2 py-2 w-full',
                    activeItem === 'diamond-reflexion'
                      ? 'bg-light'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  <ChartLine class="w-4 h-4 mr-3" />
                  <span>Reflexion</span>
                </a>
              </div>
            </PopoverContent>
          </Popover>

          <a
            v-else
            href="#"
            @click.prevent="handleDiamondClick"
            :class="[
              'flex items-center text-sm font-medium rounded-full text-[#1C170D] transition-colors',
              isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
              activeItem === 'diamond-exercises' ||
              activeItem === 'diamond-pipeline' ||
              activeItem === 'diamond-reflexion'
                ? 'bg-white border border-primary-accent hover:bg-gray-50'
                : activeItem === 'diamond'
                ? 'bg-light hover:bg-light/80'
                : 'hover:bg-gray-100',
            ]"
          >
            <Gem :class="[isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3']" />
            <span
              :class="['truncate', { hidden: isCollapsed }]"
              :title="currentProject?.name"
            >
              {{ currentProject?.name || "No Project" }}
            </span>
            <ChevronDown
              v-if="!isCollapsed"
              :class="[
                'w-4 h-4 ml-auto transition-transform duration-200',
                isDiamondExpanded ? 'rotate-180' : '',
              ]"
            />
          </a>

          <div v-if="!isCollapsed && isDiamondExpanded" class="ml-8 space-y-1">
            <a
              href="#"
              @click.prevent="setActive('diamond-exercises')"
              :class="[
                'flex items-center text-sm font-medium rounded-full text-[#1C170D] px-3 py-2',
                activeItem === 'diamond-exercises'
                  ? 'bg-light'
                  : 'hover:bg-gray-100',
              ]"
            >
              <FileText class="w-4 h-4 mr-3" />
              <span>Exercises</span>
            </a>
            <a
              href="#"
              @click.prevent="setActive('diamond-pipeline')"
              :class="[
                'flex items-center text-sm font-medium rounded-full text-[#1C170D] px-3 py-2',
                activeItem === 'diamond-pipeline'
                  ? 'bg-light'
                  : 'hover:bg-gray-100',
              ]"
            >
              <GitFork class="w-4 h-4 mr-3" />
              <span>Pipeline</span>
            </a>
            <a
              href="#"
              @click.prevent="setActive('diamond-reflexion')"
              :class="[
                'flex items-center text-sm font-medium rounded-full text-[#1C170D] px-3 py-2',
                activeItem === 'diamond-reflexion'
                  ? 'bg-light'
                  : 'hover:bg-gray-100',
              ]"
            >
              <BarChart class="w-4 h-4 mr-3" />
              <span>Reflexion</span>
            </a>
            <div v-if="currentProject" class="mt-2 bg-light rounded-lg p-2">
              <p
                class="text-xs font-medium text-on-light-accent mb-1 truncate"
                :title="currentProject?.name"
              >
                {{ currentProject?.name }}
              </p>

              <Button
                class="w-full mt-1 bg-white rounded border text-xs py-1 text-on-light-default cursor-pointer flex items-center justify-center gap-2"
                @click="handleExportProject"
              >
                <ArrowUpFromLine class="w-4 h-4" />
                Export project
              </Button>
            </div>
          </div>
        </div>

        <!-- <a
          href="#"
          @click.prevent="setActive('tools')"
          :class="[
            'flex items-center text-sm font-medium rounded-full text-[#1C170D]',
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5',
            activeItem === 'tools' ? 'bg-light' : 'hover:bg-gray-100',
          ]"
        >
          <Wrench :class="[isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3']" />
          <span :class="{ hidden: isCollapsed }">Tools</span>
        </a> -->
      </nav>

      <div
        :class="[
          'mt-auto text-[#1C170D]',
          isCollapsed
            ? 'flex flex-col space-y-4 items-center'
            : 'flex justify-between',
        ]"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                class="flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100"
              >
                <Settings :class="[isCollapsed ? 'w-6 h-6' : 'w-5 h-5']" />
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
              <button
                @click="handleLogout"
                class="flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100"
              >
                <LogOut :class="[isCollapsed ? 'w-6 h-6' : 'w-5 h-5']" />
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
import { ref, watch } from "vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Gem,
  GitFork,
  Wrench,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  FileText,
  ChartLine,
  RectangleHorizontal,
  ArrowUpFromLine,
  BarChart,
} from "lucide-vue-next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProjects } from "@/composables/useProjects";
import { useAuth } from "@/composables/useAuth";
import { toast } from "vue-sonner";

const props = defineProps<{
  currentPage?: string;
}>();

const { currentProject } = useProjects();
const { logout } = useAuth();

type ActiveItem =
  | "overview"
  | "diamond"
  | "diamond-exercises"
  | "diamond-pipeline"
  | "diamond-reflexion"
  | "tools";

const emit = defineEmits<{
  (e: "navigate", page: string): void;
}>();

const activeItem = ref<ActiveItem>("overview");
const isCollapsed = ref(false);
const isDiamondExpanded = ref(false);
const showDiamondPopover = ref(false);
let popoverTimeout: ReturnType<typeof setTimeout> | null = null;

// Watch for currentPage changes and update activeItem accordingly
watch(
  () => props.currentPage,
  (newPage) => {
    if (newPage === "diamond") {
      activeItem.value = "diamond";
      isDiamondExpanded.value = true;
    } else if (newPage === "exercises") {
      activeItem.value = "diamond-exercises";
      isDiamondExpanded.value = true;
    } else if (newPage === "pipeline") {
      activeItem.value = "diamond-pipeline";
      isDiamondExpanded.value = true;
    } else if (newPage === "reflexion") {
      activeItem.value = "diamond-reflexion";
      isDiamondExpanded.value = true;
    } else if (newPage === "overview") {
      activeItem.value = "overview";
      isDiamondExpanded.value = false;
    } else if (newPage === "tools") {
      activeItem.value = "tools";
      isDiamondExpanded.value = false;
    }
  },
  { immediate: true }
);

const setActive = (item: ActiveItem) => {
  activeItem.value = item;

  // Close popover when item is selected
  showDiamondPopover.value = false;

  // Manage Diamond expansion based on active item
  if (item === "diamond" || item.startsWith("diamond-")) {
    isDiamondExpanded.value = true;
  } else {
    isDiamondExpanded.value = false;
  }

  switch (item) {
    case "diamond-exercises":
      emit("navigate", "exercises");
      break;
    case "diamond":
      emit("navigate", "diamond");
      break;
    case "diamond-pipeline":
      emit("navigate", "pipeline");
      break;
    case "diamond-reflexion":
      emit("navigate", "reflexion");
      break;
    case "overview":
      emit("navigate", "overview");
      break;
    case "tools":
      emit("navigate", "tools");
      break;
  }
};

const handleDiamondClick = () => {
  setActive("diamond");
};

const handleDiamondMouseLeave = () => {
  popoverTimeout = setTimeout(() => {
    showDiamondPopover.value = false;
  }, 150);
};

const handleDiamondMouseEnter = () => {
  // Clear any pending timeout when re-entering
  if (popoverTimeout) {
    clearTimeout(popoverTimeout);
    popoverTimeout = null;
  }
  showDiamondPopover.value = true;
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  // When collapsing, close diamond expansion
  if (isCollapsed.value) {
    isDiamondExpanded.value = false;
  } else {
    // When expanding, if we're on a diamond item, expand diamond
    if (
      activeItem.value === "diamond" ||
      activeItem.value.startsWith("diamond-")
    ) {
      isDiamondExpanded.value = true;
    }
  }
};

const handleExportProject = async () => {
  if (
    currentProject.value &&
    currentProject.value.selectedPins &&
    currentProject.value.selectedPins.length > 0
  ) {
    try {
      // Import composables dynamically to avoid circular dependencies
      const { useExerciseChat } = await import('@/composables/useExerciseChat');
      const { useEthics } = await import('@/composables/useEthics');
      const { usePipelineProgress } = await import('@/composables/usePipelineProgress');
      
      const exerciseChat = useExerciseChat();
      const ethics = useEthics();
      const pipelineProgress = usePipelineProgress();

      const projectData = {
        // Basic project info
        name: currentProject.value.name,
        description: currentProject.value.description,
        createdDate: currentProject.value.createdDate,
        selectedPins: currentProject.value.selectedPins,
        
        // Enhanced data
        exerciseChatSessions: exerciseChat.exportChatSessions(),
        ethicsData: ethics.ethicsData.value,
        pipelineProgress: pipelineProgress.exportPipelineData(),
        
        // Export metadata
        exportedAt: new Date().toISOString(),
        version: '2.0' // Updated version to reflect enhanced export
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject.value.name || "project"}-export-v2.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export Successful", {
        description: "Project exported with chat history and ethics data.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Export Error", {
        description: "Failed to export project data. Please try again.",
      });
    }
  } else {
    toast.error("Export Error", {
      description:
        "No exercises selected to export. Please select exercise to the pipeline.",
    });
    console.warn("No project data or selected pins to export.");
  }
};

const handleLogout = () => {
  logout();
};
</script>
