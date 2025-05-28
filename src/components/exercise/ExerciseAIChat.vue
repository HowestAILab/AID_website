<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="p-4 border-b bg-white">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">RefraxionGPT</h3>
        <div class="flex items-center gap-2">
          <Popover>
            <PopoverTrigger as-child>
              <Button
                class="flex items-center gap-1 text-black bg-white hover:bg-gray-100 cursor-pointer border"
              >
                <Book class="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-0" side="bottom" align="end">
              <div class="p-4">
                <h4 class="font-semibold mb-3">Chat History</h4>
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <div
                    v-for="(chat, index) in chatHistory"
                    :key="index"
                    class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group relative"
                    :class="{
                      'bg-[#F5F0E5] border-[#A1824A]':
                        chat.id === currentChatId,
                    }"
                  >
                    <div @click="loadChatFromHistory(chat)" class="pr-8">
                      <div class="text-sm font-medium truncate">
                        {{ chat.title || `Chat ${index + 1}` }}
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ formatDate(chat.timestamp) }}
                      </div>
                    </div>
                    <Button
                      @click.stop="deleteChatFromHistory(chat.id)"
                      class="absolute top-0 right-0 rounded-l-none opacity-0 group-hover:opacity-100 transition-opacity h-full w-auto hover:bg-red-100 hover:text-red-600"
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 class="w-3 h-3" />
                    </Button>
                  </div>
                  <div
                    v-if="chatHistory.length === 0"
                    class="text-gray-500 text-sm text-center py-4"
                  >
                    No chat history yet
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            @click="startNewChat"
            class="flex items-center gap-1 text-black bg-white hover:bg-gray-100 cursor-pointer border"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </div>
    <div class="flex-grow flex flex-col">
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
          <Button
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim()"
          >
            <Send class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { Send, Plus, Book, Trash2 } from "lucide-vue-next";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

const userInput = ref<string>("");
const messages = ref<ChatMessage[]>([]);
const isLoading = ref<boolean>(false);
const selectedModel = ref<string>("llama3.1");
const chatContainer = ref<HTMLElement | null>(null);
const chatHistory = ref<SavedChat[]>([]);
const currentChatId = ref<string | null>(null);

// Load chat history from localStorage
onMounted(() => {
  loadChatHistory();
});

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

const loadChatHistory = () => {
  try {
    const stored = localStorage.getItem("aidgpt-chat-history");
    if (stored) {
      chatHistory.value = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading chat history:", error);
    chatHistory.value = [];
  }
};

const saveChatHistory = () => {
  try {
    localStorage.setItem(
      "aidgpt-chat-history",
      JSON.stringify(chatHistory.value)
    );
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

const saveCurrentChatToHistory = () => {
  if (messages.value.length === 0) return;

  const chatToSave: SavedChat = {
    id: currentChatId.value || generateChatId(),
    title: generateChatTitle(messages.value),
    messages: [...messages.value],
    timestamp: Date.now(),
  };

  // If this is an existing chat, update it otherwise add new
  const existingIndex = chatHistory.value.findIndex(
    (chat) => chat.id === chatToSave.id
  );
  if (existingIndex !== -1) {
    chatHistory.value[existingIndex] = chatToSave;
  } else {
    chatHistory.value.unshift(chatToSave);
  }

  saveChatHistory();
};

const generateChatId = (): string => {
  return "chat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

const generateChatTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find((msg) => msg.role === "user");
  if (firstUserMessage) {
    return (
      firstUserMessage.content.substring(0, 50) +
      (firstUserMessage.content.length > 50 ? "..." : "")
    );
  }
  return "New Chat";
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Today";
  } else if (diffDays === 2) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const loadChatFromHistory = (chat: SavedChat) => {
  // Prevent changing to a previous chat while a response is being generated because changing chats during response generation would insert the response into the chat being changed to instead of the original chat
  if (isLoading.value) {
    return;
  }

  // Save current chat to history if it has messages and is not already saved
  if (messages.value.length > 0 && !currentChatId.value) {
    saveCurrentChatToHistory();
  }

  messages.value = [...chat.messages];
  currentChatId.value = chat.id;
  scrollToBottom();
};

const getPreviousChatsContext = (): ChatMessage[] => {
  // Get the last 3 chats for context (excluding current chat)
  const relevantChats = chatHistory.value
    .filter((chat) => chat.id !== currentChatId.value)
    .slice(0, 3);

  const contextMessages: ChatMessage[] = [];

  relevantChats.forEach((chat, index) => {
    // Add a context separator
    contextMessages.push({
      role: "system",
      content: `Previous conversation ${index + 1}:`,
    });

    // Add the last few messages from each previous chat
    const lastMessages = chat.messages.slice(-4); // Last 4 messages
    contextMessages.push(...lastMessages);
  });

  return contextMessages;
};

const deleteChatFromHistory = (id: string) => {
  chatHistory.value = chatHistory.value.filter((chat) => chat.id !== id);
  saveChatHistory();

  // If we're deleting the currently active chat, clear the current chat
  if (currentChatId.value === id) {
    currentChatId.value = null;
  }
};

const sendMessage = async () => {
  const trimmedInput = userInput.value.trim();
  if (!trimmedInput || isLoading.value) return;

  messages.value.push({ role: "user", content: trimmedInput });
  userInput.value = "";
  scrollToBottom();
  isLoading.value = true;

  // Get previous chats context
  const previousChatsContext = getPreviousChatsContext();

  const apiMessages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful and concise assistant. You can reference previous conversations when relevant.",
    },
    ...previousChatsContext, // Include previous chats context
    { role: "system", content: "Current conversation:" },
    ...messages.value.slice(-10), // Current conversation last 10 messages
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

    // Removed auto-save - chats are now only saved when new chat button is pressed
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
  // Save current chat to history if it has messages
  if (messages.value.length > 0) {
    saveCurrentChatToHistory();
  }

  // Start fresh
  messages.value = [];
  currentChatId.value = null;
  scrollToBottom();
};
</script>
