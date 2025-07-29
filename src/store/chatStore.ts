import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatSession, ChatState, ChatActions } from '../types';

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>()(
  persist(
    set => ({
      messages: [],
      isLoading: false,
      error: null,
      sessions: [],
      currentSessionId: null,

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

          // Update current session if it exists
          let updatedSessions = state.sessions;
          if (state.currentSessionId) {
            updatedSessions = state.sessions.map(session =>
              session.id === state.currentSessionId
                ? {
                    ...session,
                    messages: updatedMessages,
                    updatedAt: new Date(),
                    // Update title with first user message if it's still "New Chat"
                    title:
                      session.title === 'New Chat' && message.role === 'user'
                        ? message.content.substring(0, 30)
                        : session.title,
                  }
                : session
            );
          }

          return {
            messages: updatedMessages,
            sessions: updatedSessions,
            error: null,
          };
        });
      },

      clearHistory: () => {
        set({ messages: [], error: null });
      },

      createSession: (title: string) => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          messages: [],
          error: null,
        }));
      },

      loadSession: (sessionId: string) => {
        set(state => {
          const session = state.sessions.find(s => s.id === sessionId);
          if (session) {
            return {
              currentSessionId: sessionId,
              messages: session.messages,
              error: null,
            };
          }
          return state;
        });
      },

      deleteSession: (sessionId: string) => {
        set(state => {
          const updatedSessions = state.sessions.filter(
            s => s.id !== sessionId
          );
          const newCurrentSessionId =
            state.currentSessionId === sessionId
              ? updatedSessions[0]?.id || null
              : state.currentSessionId;

          return {
            sessions: updatedSessions,
            currentSessionId: newCurrentSessionId,
            messages: newCurrentSessionId
              ? updatedSessions.find(s => s.id === newCurrentSessionId)
                  ?.messages || []
              : [],
          };
        });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          ),
        }));
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
      partialize: state => ({
        messages: state.messages,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
      onRehydrateStorage: () => state => {
        console.log('Rehydrating store state:', state);
        if (state?.messages) {
          // Convert timestamp strings back to Date objects
          state.messages = state.messages.map(message => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }));
          console.log('Rehydrated messages count:', state.messages.length);
        }
        if (state?.sessions) {
          // Convert timestamp strings back to Date objects for sessions
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map(message => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }));
          console.log('Rehydrated sessions count:', state.sessions.length);
        }
      },
    }
  )
);
