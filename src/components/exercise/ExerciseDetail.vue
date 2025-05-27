<template>
  <ResizablePanelGroup direction="horizontal" class="h-screen w-full">
    <ResizablePanel>
      <div class="flex flex-col h-full">
        <div class="p-6 pb-4">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft />
            <h1 class="ml-2 text-lg font-medium">Back to Pipeline</h1>
          </button>
        </div>
        <div class="px-6 flex items-center gap-4 mb-2">
          <h2 class="text-2xl font-semibold">{{ exerciseTitle }}</h2>
          <div
            v-if="driveTypeConfig"
            class="flex items-center gap-2 rounded-sm px-2 py-0.5 text-sm"
            :class="[driveTypeConfig.bgColor, driveTypeConfig.textColor]"
          >
            <UserRound v-if="props.driveType === 'human'" />
            <Bot v-else-if="props.driveType === 'ai'" />
            <UserCog v-else-if="props.driveType === 'human-ai'" />
            <p>{{ driveTypeConfig.text }}</p>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <div class="bg-gray-200 h-full flex items-center justify-center">
            <p>Miro Board Area</p>
          </div>
        </div>
      </div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="20" :min-size="20" :max-size="40">
      <div class="h-full bg-gray-50 flex flex-col">
        <div class="p-4 border-b bg-white">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">AIDgpt</h3>
          </div>
        </div>
        <!-- Temporary quick chat with Ollama -->
        <div
          ref="chatContainer"
          class="flex-grow p-4 overflow-y-auto space-y-4"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex"
            :class="{ 'justify-end': msg.role === 'user' }"
          >
            <div
              :class="[
                'p-3 rounded-lg max-w-full break-words',
                msg.role === 'user'
                  ? 'bg-[#F5F0E5] text-black w-3/4'
                  : 'text-gray-800 w-full',
              ]"
            >
              <pre class="whitespace-pre-wrap font-sans">{{ msg.content }}</pre>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-white">
          <div class="flex items-center space-x-2">
            <Textarea
              v-model="userInput"
              placeholder="Type your message here..."
              class="w-full flex-grow resize-none"
              rows="2"
              @keydown.enter.prevent="handleEnter"
            />
            <Button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
            >
              <Send class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import { Send, ArrowLeft, UserRound, Bot, UserCog } from "lucide-vue-next";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

type DriveType = "human" | "human-ai" | "ai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const props = defineProps<{
  exerciseTitle: string;
  driveType: DriveType;
}>();

const emit = defineEmits(["back"]);

const userInput = ref<string>("");
const messages = ref<ChatMessage[]>([]);
const isLoading = ref<boolean>(false);
const selectedModel = ref<string>("llama3.1");
const chatContainer = ref<HTMLElement | null>(null);

const driveTypeConfig = computed(() => {
  if (!props.driveType) return null;
  switch (props.driveType) {
    case "human-ai":
      return {
        text: "Human+AI Collaboration",
        bgColor: "bg-[#F3E8FF]",
        textColor: "text-[#6B21A8]",
      };
    case "ai":
      return {
        text: "AI-driven",
        bgColor: "bg-[#D1FAE5]",
        textColor: "text-[#076046]",
      };
    case "human":
    default:
      return {
        text: "Human-driven",
        bgColor: "bg-[#DBE9FE]",
        textColor: "text-[#1D40AE]",
      };
  }
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const goBack = () => {
  emit("back");
};

const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey && userInput.value.trim() && !isLoading.value) {
    sendMessage();
  }
};

const sendMessage = async () => {
  const trimmedInput = userInput.value.trim();
  if (!trimmedInput || isLoading.value) return;

  messages.value.push({ role: "user", content: trimmedInput });
  userInput.value = "";
  scrollToBottom();
  isLoading.value = true;

  const apiMessages: ChatMessage[] = [
    { role: "system", content: "You are a helpful and concise assistant." },
    ...messages.value.slice(-10),
  ];

  messages.value.push({ role: "assistant", content: "" });
  scrollToBottom();

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel.value,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response body");
    }

    const decoder = new TextDecoder();
    let currentAssistantMessageIndex = messages.value.length - 1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            messages.value[currentAssistantMessageIndex].content +=
              parsed.message.content;
            scrollToBottom();
          }
        } catch (e) {
          console.error("Failed to parse JSON line:", line, e);
        }
      }
    }
  } catch (error) {
    console.error("Error sending message to Ollama:", error);
    messages.value[messages.value.length - 1].content =
      "Error: Could not connect to Ollama or an API error occurred.";
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>
