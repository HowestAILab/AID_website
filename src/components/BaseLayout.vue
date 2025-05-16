<template>
  <div class="flex flex-col min-h-screen">
    <header class="flex items-center justify-between bg-white shadow px-4 py-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleToggleSidebar"
          class="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          tabindex="0"
          @keydown.enter.space="handleToggleSidebar"
        >
          <span v-if="sidebarCollapsed" aria-hidden="true">☰</span>
          <span v-else aria-hidden="true">⮜</span>
        </button>
        <h1 class="text-xl font-bold text-blue-700">AID Platform</h1>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="handleLoadState"
          class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Load state from JSON file"
          tabindex="0"
          @keydown.enter.space="handleLoadState"
        >
          Load
        </button>
        <button
          type="button"
          @click="handleSaveState"
          class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Save state to JSON file"
          tabindex="0"
          @keydown.enter.space="handleSaveState"
        >
          Save
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="application/json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </header>
    <div class="flex flex-1">
      <aside
        :class="[
          'transition-all duration-200 bg-white shadow h-full',
          sidebarCollapsed ? 'w-16' : 'w-64',
        ]"
        aria-label="Sidebar navigation"
      >
        <nav class="flex flex-col h-full py-4" aria-label="Main menu">
          <ul class="space-y-2">
            <li>
              <RouterLink
                to="/projects"
                class="block px-4 py-2 rounded hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                tabindex="0"
                aria-label="Projects page"
              >
                PROJECTS
              </RouterLink>
            </li>
            <li>
              <div
                class="px-4 py-2 font-semibold text-gray-700 flex items-center gap-2"
              >
                DIAMOND
                <span class="text-xs text-blue-500"
                  >General model double diamond</span
                >
              </div>
              <ul class="pl-4 space-y-1">
                <li>
                  <RouterLink
                    to="/diamond/exercises"
                    class="block px-4 py-1 rounded hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                    tabindex="0"
                    aria-label="Diamond Exercises page"
                  >
                    EXERCISES
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    to="/diamond/pipeline"
                    class="block px-4 py-1 rounded hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                    tabindex="0"
                    aria-label="Diamond Pipeline page"
                  >
                    PIPELINE
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    to="/diamond/reflexion"
                    class="block px-4 py-1 rounded hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                    tabindex="0"
                    aria-label="Diamond Reflexion page"
                  >
                    REFLEXION
                  </RouterLink>
                </li>
              </ul>
            </li>
            <li>
              <RouterLink
                to="/tools"
                class="block px-4 py-2 rounded hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                tabindex="0"
                aria-label="Tools page"
              >
                TOOLS
              </RouterLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main class="flex-1 bg-blue-50 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink, RouterView } from "vue-router";
import { useAppState } from "../composables/useAppState";

const sidebarCollapsed = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const { state, loadState, saveState } = useAppState();

const handleToggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleLoadState = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      loadState(json);
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

const handleSaveState = () => {
  const dataStr = JSON.stringify(state.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aid_state.json";
  a.click();
  URL.revokeObjectURL(url);
};
</script>
