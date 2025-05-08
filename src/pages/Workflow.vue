<template>
  <ResizablePanelGroup direction="horizontal" class="flex h-full rounded-tr-xl rounded-br-xl rounded-bl-xl">
    <ResizablePanel :default-size="75" :min-size="75">
      <ResizablePanelGroup direction="horizontal" class="w-full h-full flex">
        <ResizablePanel :default-size="50" :min-size="25">
          <div class="bg-[#6C6C6C] h-full flex rounded-bl-xl">
            <div class="w-full overflow-y-auto relative">
              <div class="sticky top-0 z-10 backdrop-blur-sm p-4">
                <h3 class="text-3xl font-semibold text-white">
                  {{ currentTool?.name || "Select a tool" }}
                </h3>
              </div>

              <div class="p-4">
                <div>
                  <h4 class="text-xl font-semibold text-white">Prompts</h4>
                  <div
                    v-if="currentTool && currentTool.prompt_list"
                    v-for="(prompt, index) in currentTool.prompt_list"
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
                <div class="my-6" v-if="currentTool && currentTool.ethical">
                  <h4 class="text-xl font-semibold text-white">Ethical</h4>
                  <div>
                    <p class="text-lg font-medium text-white">Before</p>
                    <div
                      v-if="
                        currentTool &&
                        currentTool.ethical &&
                        currentTool.ethical.before
                      "
                      v-for="(prompt, index) in currentTool.ethical.before"
                      :key="index"
                      class="flex items-center mb-2 group"
                    >
                      <p class="text-neutral-300 font-normal flex-grow mr-2">
                        {{ prompt }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p class="text-lg font-medium text-white">After</p>
                    <div
                      v-if="
                        currentTool &&
                        currentTool.ethical &&
                        currentTool.ethical.after
                      "
                      v-for="(prompt, index) in currentTool.ethical.after"
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
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel :default-size="35" :min-size="35">
          <div
            class="bg-gray-300 h-full w-full text-center flex items-center justify-center"
          >
            <div>Miro board</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="25" :min-size="10" collapsible>
      <div class="bg-[#303030] h-full w-full flex flex-col rounded-r-xl">
        <div class="flex border-b pb-2 pt-4 px-4">
          <p class="text-white">FlowGPT</p>
          <div class="flex ml-auto">
            <Icon icon="mynaui:book-solid" class="text-white w-6 h-6" />
            <Icon icon="ic:round-add" class="text-white w-6 h-6" />
          </div>
        </div>
        <div class="mt-auto p-4 flex items-end">
          <Textarea
            class="text-white w-full mr-2"
            placeholder="Write your prompt here"
          />
          <Button class="flex-shrink-0 w-10 h-10 cursor-pointer">
            <div class="bg-white rounded-lg p-2">
              <Icon icon="ic:round-send" class="text-black w-6 h-6" />
            </div>
          </Button>
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { toast } from "vue-sonner";
import { inject, computed, ref } from "vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const currentStep = inject("currentStep", ref(0));
const tools = inject("tools", []);

const currentTool = computed(() => tools[currentStep.value] || {});

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
</script>
