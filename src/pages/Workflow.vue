<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="flex h-full rounded-tr-xl rounded-br-xl rounded-bl-xl"
  >
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
            <Icon icon="ic:round-add" class="text-white w-6 h-6 cursor-pointer" @click="resetChat" />
          </div>
        </div>
        <div
          ref="chatContainerRef"
          class="flex-grow p-4 overflow-y-auto bg-[#383838] flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#555] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-[#383838]"
        >
          <div class="mt-auto flex flex-col gap-2">
            <div
              v-for="(message, index) in chatMessages"
              :key="index"
              :class="[
                'py-[10px]', 'px-[14px]', 'rounded-lg', 'break-words', 'leading-[1.4]',
                message.role === 'user'
                  ? 'bg-[#007AFF] text-white self-end max-w-[75%]'
                  : 'text-white self-start'
              ]"
            >
              <div class="text-sm" v-html="formatMessageContent(message.content)"></div>
            </div>
          </div>
        </div>
        <div class="mt-auto p-4 flex items-end border-t border-gray-500">
          <Textarea
            v-model="userInput"
            @keyup.enter.prevent="sendChatMessage"
            class="text-white w-full mr-2 bg-[#404040] border-gray-500 placeholder-gray-400"
            placeholder="Write your prompt here"
            :disabled="isLoadingChatResponse"
          />
          <Button
            @click="sendChatMessage"
            class="flex-shrink-0 w-10 h-10 cursor-pointer"
            :disabled="isLoadingChatResponse || !userInput.trim()"
          >
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
import { inject, computed, ref, watch, nextTick } from "vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

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

const currentStep = inject("currentStep", ref(0));
const tools = inject<Tool[]>("tools", []);

const currentTool = computed<Tool | undefined>(() => tools[currentStep.value]);

const userInput = ref("");
const chatMessages = ref<ChatMessage[]>([]);
const isLoadingChatResponse = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);

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

const resetChat = () => {
  chatMessages.value = [];
  toast.success("Chat has been reset.");
};

function formatMessageContent(text: string): string {
  let processedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  processedText = processedText.replace(/\*\*\*(.*?)\*\*\*/g, "<h3 class='text-xl font-semibold my-2'>$1</h3>");

  processedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  const lines = processedText.split('\n');
  let outputHtml = "";
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
        if (inUl) { outputHtml += '</ul>'; inUl = false; }
        if (inOl) { outputHtml += '</ol>'; inOl = false; }
        continue; 
    }

    const isUlItem = trimmedLine.startsWith('* ');
    const isOlItem = /^\d+\.\s/.test(trimmedLine);

    if (inUl && !isUlItem) {
      outputHtml += '</ul>';
      inUl = false;
    }
    if (inOl && !isOlItem) {
      outputHtml += '</ol>';
      inOl = false;
    }

    if (isUlItem) {
      if (!inUl) {
        outputHtml += '<ul class="list-disc list-inside pl-4 my-1">';
        inUl = true;
      }
      outputHtml += `<li>${trimmedLine.substring(trimmedLine.indexOf('* ') + 2)}</li>`;
    } else if (isOlItem) {
      if (!inOl) {
        outputHtml += '<ol class="list-decimal list-inside pl-4 my-1">';
        inOl = true;
      }
      outputHtml += `<li>${trimmedLine.replace(/^\d+\.\s/, '')}</li>`;
    } else {
      if (line.includes("<h3 class='text-xl font-semibold my-2'>")) {
        outputHtml += line;
      } else if (line.length > 0 && trimmedLine.length === 0) { 
         outputHtml += `<p class="my-1">&nbsp;</p>`;
      } else if (trimmedLine.length > 0) {
        outputHtml += `<p class="my-1">${line}</p>`;
      }
    }
  }

  if (inUl) outputHtml += '</ul>';
  if (inOl) outputHtml += '</ol>';

  return outputHtml;
}

const sendChatMessage = async () => {
  if (!userInput.value.trim() || isLoadingChatResponse.value) return;

  const userMessageContent = userInput.value.trim();
  const currentUserMessage: ChatMessage = {
    role: "user",
    content: userMessageContent,
  };
  chatMessages.value.push(currentUserMessage);

  isLoadingChatResponse.value = true;
  userInput.value = "";

  let assistantMessageIndex = -1;

  try {
    const history = chatMessages.value.filter(msg => msg.role === 'user' || msg.role === 'assistant').slice(-10);
    const messagesForAPICall = history;

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        messages: messagesForAPICall,
        stream: true,
      }),
    });

    if (!response.ok) {
      let errorDetail = "API request failed";
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    if (!response.body) {
      throw new Error("Response body is null, cannot stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
            try {
                const streamResponse = JSON.parse(buffer.trim());
                if (streamResponse.message && typeof streamResponse.message.content === 'string' && assistantMessageIndex !== -1) {
                    chatMessages.value[assistantMessageIndex].content += streamResponse.message.content;
                }
            } catch (e) {
            }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      let newlineIndex;

      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);

        if (line) {
          try {
            const streamResponse = JSON.parse(line);

            if (streamResponse.message && typeof streamResponse.message.content === 'string') {
              if (assistantMessageIndex === -1) {
                chatMessages.value.push({
                  role: "assistant",
                  content: streamResponse.message.content,
                });
                assistantMessageIndex = chatMessages.value.length - 1;
              } else {
                chatMessages.value[assistantMessageIndex].content += streamResponse.message.content;
              }
            }
            if (streamResponse.done === true) {
            }
          } catch (e) {
            console.error("Error parsing streamed JSON line:", e, "Line:", line);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to send or process chat message:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isLoadingChatResponse.value = false;
  }
};

watch(chatMessages, () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
}, { deep: true });
</script>
