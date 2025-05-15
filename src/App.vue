<template>
  <div class="flex flex-col h-screen">
    <Header />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 flex flex-col overflow-y-auto">
        <div class="border-b border-[#A1824A]">
          <nav class="flex -mb-px" aria-label="Tabs">
            <div class="flex-grow border-r border-gray-300"></div>
            <button
              v-for="(tab, index) in tabs"
              :key="tab"
              @click="setActiveTab(tab)"
              :class="[
                'flex-grow-[2]',
                'whitespace-nowrap',
                'py-4',
                'px-1',
                'text-center',
                'text-sm',
                'font-bold',
                'focus:outline-none',
                activeTab === tab
                  ? [
                      'border-b-2',
                      'border-b-[#A1824A]',
                      'text-[#A1824A]',
                      'border-x',
                    ]
                  : [
                      'border-b',
                      'border-b-[#A1824A]',
                      'border-x',
                      'text-[#1C170D]',
                    ],
              ]"
            >
              {{ tab }}
            </button>
            <div class="flex-grow border-r border-gray-300"></div>
          </nav>
        </div>
        <div class="p-6">
          <p>Content for {{ activeTab }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { ref } from "vue";

const tabs = ["Discover", "Define", "Develop", "Deliver"];
const activeTab = ref("Discover");

const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent body scrollbars when h-screen is used */
}
</style>
