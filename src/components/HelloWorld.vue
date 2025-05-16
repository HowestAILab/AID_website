<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8"
  >
    <div class="w-full max-w-md">
      <h1
        class="text-4xl font-extrabold text-center text-blue-700 mb-6 drop-shadow"
      >
        {{ msg }}
      </h1>

      <div
        class="card p-8 rounded-2xl shadow-xl bg-white mb-6 flex flex-col items-center"
      >
        <button
          type="button"
          @click="count++"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-indigo-600 transition-all mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          count is {{ count }}
        </button>
        <p class="text-gray-600 text-sm">
          Edit
          <code class="bg-gray-100 px-2 py-1 rounded text-xs font-mono"
            >components/HelloWorld.vue</code
          >
          to test HMR
        </p>
      </div>

      <div class="space-y-3">
        <p>
          Check out
          <a
            href="https://vuejs.org/guide/quick-start.html#local"
            target="_blank"
            class="text-blue-600 underline hover:text-blue-800 font-medium"
            >create-vue</a
          >, the official Vue + Vite starter
        </p>
        <p>
          Learn more about IDE Support for Vue in the
          <a
            href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
            target="_blank"
            class="text-blue-600 underline hover:text-blue-800 font-medium"
            >Vue Docs Scaling up Guide</a
          >.
        </p>
        <p class="text-gray-500 text-center italic">
          Click on the Vite and Vue logos to learn more
        </p>
      </div>
    </div>
  </div>
</template>
