<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="p-4 border-b bg-white">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">AIDgpt</h3>
        <Button
          @click="startNewChat"
          class="flex items-center gap-1 text-black bg-white hover:bg-gray-100 cursor-pointer border"
        >
          <Plus />
        </Button>
      </div>
    </div>
    <div ref="chatContainer" class="flex-grow p-4 overflow-y-auto space-y-4">
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
              ? 'bg-[#F5F0E5] text-black'
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
        <Button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          <Send class="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Send, Plus } from "lucide-vue-next";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const userInput = ref<string>("");
const messages = ref<ChatMessage[]>([]);
const isLoading = ref<boolean>(false);
const selectedModel = ref<string>("llama3.1");
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
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

const startNewChat = () => {
  messages.value = [];
  scrollToBottom();
};
</script>
