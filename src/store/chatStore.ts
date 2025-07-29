import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatState, ChatActions } from '../types';

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>()(
  persist(
    set => ({
      messages: [],
      isLoading: false,
      error: null,

      addMessage: message => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        console.log('Adding message to store:', newMessage);
        set(state => {
          const updatedMessages = [...state.messages, newMessage];
          console.log('Updated messages count:', updatedMessages.length);
          return {
            messages: updatedMessages,
            error: null,
          };
        });
      },

      clearHistory: () => {
        set({ messages: [], error: null });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },

      setError: error => {
        set({ error, isLoading: false });
      },
    }),
    {
      name: 'chat-storage',
      partialize: state => ({ messages: state.messages }),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrating store state:', state);
        if (state?.messages) {
          // Convert timestamp strings back to Date objects
          state.messages = state.messages.map(message => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }));
          console.log('Rehydrated messages count:', state.messages.length);
        }
      },
    }
  )
);
