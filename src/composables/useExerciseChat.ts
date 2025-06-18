import { ref, computed, watch } from 'vue';
import type { SelectedPinInfo } from '@/types/exercise';
import { useProjectLocalStorage } from './storage/useProjectLocalStorage';
import { useProjects } from './useProjects';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ExerciseChatSession {
  exerciseId: string;
  exerciseName: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ExerciseChatData {
  [exerciseId: string]: ExerciseChatSession;
}

const { currentProject } = useProjects();
const chatStorage = useProjectLocalStorage('exercise-chat-sessions');

export function useExerciseChat() {
  const exerciseChatSessions = ref<ExerciseChatData>(chatStorage.getItem() || {});
  const currentExerciseId = ref<string | null>(null);
  const isLoading = ref(false);

  // Watch for changes and auto-save
  watch(
    exerciseChatSessions,
    (newValue) => {
      chatStorage.setItem(newValue);
    },
    { deep: true }
  );

  // When the project changes, reload the chat sessions
  watch(
    () => currentProject.value?.id,
    (newProjectId, oldProjectId) => {
      if (newProjectId !== oldProjectId) {
        exerciseChatSessions.value = chatStorage.getItem() || {};
        currentExerciseId.value = null; // Reset current exercise
      }
    }
  );

  // Current session computed property
  const currentChatSession = computed(() => {
    if (!currentExerciseId.value) return null;
    return exerciseChatSessions.value[currentExerciseId.value] || null;
  });

  // Current messages computed property
  const currentMessages = computed(() => {
    return currentChatSession.value?.messages || [];
  });

  // Set current exercise
  const setCurrentExercise = (exercise: SelectedPinInfo) => {
    currentExerciseId.value = exercise.name;
    
    // Create session if it doesn't exist
    if (!exerciseChatSessions.value[exercise.name]) {
      exerciseChatSessions.value[exercise.name] = {
        exerciseId: exercise.name,
        exerciseName: exercise.name,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
  };

  // Add message to current exercise
  const addMessage = (message: Omit<ChatMessage, 'timestamp'>) => {
    if (!currentExerciseId.value) return;

    const chatMessage: ChatMessage = {
      ...message,
      timestamp: Date.now()
    };

    const session = exerciseChatSessions.value[currentExerciseId.value];
    if (session) {
      session.messages.push(chatMessage);
      session.updatedAt = Date.now();
    }
  };

  // Update last message (for streaming responses)
  const updateLastMessage = (content: string) => {
    if (!currentExerciseId.value) return;

    const session = exerciseChatSessions.value[currentExerciseId.value];
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = content;
        session.updatedAt = Date.now();
      }
    }
  };

  // Append to last message (for streaming)
  const appendToLastMessage = (content: string) => {
    if (!currentExerciseId.value) return;

    const session = exerciseChatSessions.value[currentExerciseId.value];
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content += content;
        session.updatedAt = Date.now();
      }
    }
  };

  // Get chat session for specific exercise
  const getChatSession = (exerciseId: string): ExerciseChatSession | null => {
    return exerciseChatSessions.value[exerciseId] || null;
  };

  // Get messages for specific exercise
  const getExerciseMessages = (exerciseId: string): ChatMessage[] => {
    const session = getChatSession(exerciseId);
    return session?.messages || [];
  };

  // Clear current exercise chat
  const clearCurrentChat = () => {
    if (!currentExerciseId.value) return;

    const session = exerciseChatSessions.value[currentExerciseId.value];
    if (session) {
      session.messages = [];
      session.updatedAt = Date.now();
    }
  };

  // Delete exercise chat session
  const deleteChatSession = (exerciseId: string) => {
    delete exerciseChatSessions.value[exerciseId];
  };

  // Get chat statistics
  const getChatStats = (exerciseId: string) => {
    const session = getChatSession(exerciseId);
    if (!session) {
      return { messageCount: 0, userMessages: 0, assistantMessages: 0, lastActivity: null };
    }

    const userMessages = session.messages.filter(m => m.role === 'user').length;
    const assistantMessages = session.messages.filter(m => m.role === 'assistant').length;
    const lastActivity = session.messages.length > 0 ? Math.max(...session.messages.map(m => m.timestamp)) : session.createdAt;

    return {
      messageCount: session.messages.length,
      userMessages,
      assistantMessages,
      lastActivity
    };
  };

  // Export all chat sessions
  const exportChatSessions = () => {
    return {
      exerciseChatSessions: exerciseChatSessions.value,
      exportedAt: Date.now(),
      version: '1.0'
    };
  };

  // Import chat sessions
  const importChatSessions = (data: any): boolean => {
    try {
      if (data.exerciseChatSessions) {
        exerciseChatSessions.value = data.exerciseChatSessions;
        chatStorage.setItem(exerciseChatSessions.value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import chat sessions:', error);
      return false;
    }
  };

  // Send message to AI (Ollama integration)
  const sendMessageToAI = async (userMessage: string, selectedModel: string = 'llama3.1') => {
    if (!currentExerciseId.value || !userMessage.trim()) return;

    isLoading.value = true;

    try {
      // Add user message
      addMessage({ role: 'user', content: userMessage.trim() });

      // Prepare context for AI
      const currentSession = currentChatSession.value;
      if (!currentSession) throw new Error('No current chat session');

      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant supporting a design thinking exercise: "${currentSession.exerciseName}". Provide concise, relevant guidance.`,
          timestamp: Date.now()
        },
        ...currentSession.messages.slice(-10) // Last 10 messages for context
      ];

      // Add empty assistant message for streaming
      addMessage({ role: 'assistant', content: '' });

      // Send to Ollama
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body');
      }

      const decoder = new TextDecoder();
      let assistantResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message && parsed.message.content) {
              assistantResponse += parsed.message.content;
              updateLastMessage(assistantResponse);
            }
          } catch (e) {
            console.error('Failed to parse JSON line:', line, e);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message to AI:', error);
      updateLastMessage('Error: Could not connect to AI service.');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    exerciseChatSessions,
    currentExerciseId,
    currentChatSession,
    currentMessages,
    isLoading,

    // Actions
    setCurrentExercise,
    addMessage,
    updateLastMessage,
    appendToLastMessage,
    clearCurrentChat,
    deleteChatSession,
    sendMessageToAI,

    // Getters
    getChatSession,
    getExerciseMessages,
    getChatStats,

    // Persistence
    exportChatSessions,
    importChatSessions,
  };
} 