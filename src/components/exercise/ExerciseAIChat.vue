<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="p-4 border-b bg-white">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold">AI Assistant</h3>
          <p v-if="currentExercise" class="text-sm text-gray-600">{{ currentExercise.name }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {{ props.currentExercise ? getChatStats(props.currentExercise.name).userMessages : 0 }} user messages
          </div>
          <Button
            @click="clearCurrentChat"
            class="flex items-center gap-1 text-black bg-white hover:bg-gray-100 cursor-pointer border"
            size="sm"
            variant="outline"
          >
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div class="flex-grow flex flex-col">
      <div ref="chatContainer" class="flex-grow p-4 overflow-y-auto space-y-4">
        <!-- Welcome message for new chats -->
        <div v-if="currentMessages.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="w-8 h-8 text-blue-600" />
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Start a conversation</h4>
          <p class="text-sm text-gray-600 max-w-md mx-auto">
            Ask me anything about <strong>{{ currentExercise?.name }}</strong>. I'm here to help guide you through this exercise.
          </p>
        </div>

        <!-- Chat messages -->
        <div
          v-for="(msg, index) in currentMessages"
          :key="`${msg.timestamp}-${index}`"
          class="flex"
          :class="{ 'justify-end': msg.role === 'user' }"
        >
          <div
            :class="[
              'p-3 rounded-lg max-w-[85%] break-words',
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 shadow-sm border',
            ]"
          >
            <div class="flex items-start gap-2">
              <div v-if="msg.role === 'assistant'" class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot class="w-3 h-3 text-green-600" />
              </div>
              <div class="flex-1">
                <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed">{{ msg.content }}</pre>
                <div class="text-xs opacity-70 mt-2">
                  {{ formatMessageTime(msg.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex">
          <div class="bg-white text-gray-800 shadow-sm border p-3 rounded-lg max-w-[85%]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Bot class="w-3 h-3 text-green-600" />
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="p-4 border-t bg-white">
        <div class="flex items-end space-x-2">
          <div class="flex-1">
            <Textarea
              v-model="userInput"
              placeholder="Ask about this exercise, get guidance, or discuss your ideas..."
              class="w-full resize-none"
              rows="2"
              @keydown.enter.prevent="handleEnter"
              :disabled="isLoading || !currentExercise"
            />
          </div>
          <Button
            class="cursor-pointer flex-shrink-0"
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim() || !currentExercise"
          >
            <Send class="w-5 h-5" />
          </Button>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div class="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          <div class="text-xs text-gray-500">
            {{ userInput.length }}/1000
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from "vue";
import { Send, Trash2, MessageSquare, Bot } from "lucide-vue-next";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useExerciseChat } from "@/composables/useExerciseChat";
import type { SelectedPinInfo } from "@/types/exercise";

const props = defineProps<{
  currentExercise: SelectedPinInfo | null;
}>();

const emit = defineEmits<{
  (e: 'chat-updated', messageCount: number): void;
}>();

const {
  currentMessages,
  isLoading,
  setCurrentExercise,
  sendMessageToAI,
  clearCurrentChat: clearChatSession,
  getChatStats
} = useExerciseChat();

const userInput = ref<string>("");
const chatContainer = ref<HTMLElement | null>(null);

// Watch for exercise changes
watch(() => props.currentExercise, (newExercise) => {
  if (newExercise) {
    setCurrentExercise(newExercise);
  }
}, { immediate: true });

// Watch for message changes to emit updates
watch(currentMessages, (messages) => {
  if (props.currentExercise) {
    const stats = getChatStats(props.currentExercise.name);
    emit('chat-updated', stats.userMessages);
  }
  scrollToBottom();
}, { deep: true });

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
  if (!trimmedInput || isLoading.value || !props.currentExercise) return;

  const messageToSend = trimmedInput;
  userInput.value = "";

  try {
    await sendMessageToAI(messageToSend);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const clearCurrentChat = () => {
  if (confirm('Are you sure you want to clear the chat history for this exercise?')) {
    clearChatSession();
  }
};

const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // If this week, show day and time
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

onMounted(() => {
  if (props.currentExercise) {
    setCurrentExercise(props.currentExercise);
  }
});
</script>
