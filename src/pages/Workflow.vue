<template>
  <div class="flex h-full">
    <div class="bg-[#6C6C6C] w-3/4 p-4 flex rounded-l-xl">
      <div class="w-1/2 overflow-y-auto">
        <h3 class="text-3xl font-semibold text-white">User personas</h3>
        <div class="mt-4">
          <div>
            <h4 class="text-xl font-semibold text-white">Prompts</h4>
            <div
              v-for="(prompt, index) in tools[0].prompt_list"
              :key="index"
              class="flex items-center mb-2 group"
            >
              <p class="text-neutral-300 font-normal flex-grow mr-2">
                {{ prompt }}
              </p>
              <button
                @click="copyPrompt(prompt)"
                class="text-gray-200 p-4 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy prompt"
              >
                <Icon icon="ic:round-content-copy" />
              </button>
            </div>
          </div>
          <div class="my-6">
            <h4 class="text-xl font-semibold text-white">Ethical</h4>
            <div>
              <p class="text-lg font-medium text-white">Before</p>
              <div
                v-for="(prompt, index) in tools[0].ethical.before"
                :key="index"
                class="flex items-center mb-2 group"
              >
                <p class="text-neutral-300 font-normal flex-grow mr-2">
                  {{ prompt }}
                </p>
              </div>
            </div>
            <div>
              <p>After</p>
              <div
                v-for="(prompt, index) in tools[0].ethical.after"
                :key="index"
                class="flex items-center mb-2 group"
              >
                <p class="text-neutral-300 font-normal flex-grow mr-2">
                  {{ prompt }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="bg-gray-300 w-1/2 text-center flex items-center justify-center"
      >
        <div>Miro board</div>
      </div>
    </div>
    <div class="bg-[#303030] w-1/4 p-4 flex flex-col rounded-r-xl">
      <div class="flex">
        <p class="text-white">FlowGPT</p>
        <div class="flex ml-auto">
          <Icon icon="mynaui:book-solid" class="text-white" />
          <Icon icon="ic:round-add" class="text-white" />
        </div>
      </div>
      <Separator class="bg-gray-500" />
      <div class="mt-auto">
        <Input class="text-white" placeholder="Write your prompt here" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Input } from "@/components/ui/input";
import { toast } from "vue-sonner";
import Separator from "@/components/ui/separator/Separator.vue";

const copyPrompt = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("Prompt copied!");
    })
    .catch((err) => {
      toast("Error: Could not copy prompt.");
      console.error("Failed to copy text: ", err);
    });
};

let tools = [
  {
    name: "User Personas",
    description: "Create user personas based on the given prompt",
    prompt_list: [
      "Enim nulla ullamco eiusmod magna dolor fugiat laboris do non quis excepteur minim ad. Minim non anim anim sunt proident in eu laboris esse amet quis reprehenderit enim. Laborum occaecat consectetur velit magna. Dolore elit irure amet deserunt laborum. Cillum sit esse nisi ipsum mollit sint occaecat ullamco nisi nulla sint reprehenderit officia qui.",
      "Irure veniam incididunt laboris Lorem officia proident exercitation occaecat eu dolore reprehenderit consectetur. Culpa est nisi fugiat consectetur cupidatat aute Lorem ad exercitation ex pariatur ad irure. Ad elit fugiat elit amet irure culpa eiusmod.",
    ],
    ethical: {
      before: ["Question 1", "Question 2"],
      after: ["Question 3"],
    },
  },
];
</script>
