import { useCallback, useRef, useState } from 'react';
import { deepSeekAPI } from '../api/deepseek';
import { useChatStore } from '../store/chatStore';

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    sessions,
    currentSessionId,
    createSession,
  } = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim()) return;

      // Create session if this is the first message
      if (!currentSessionId && sessions.length === 0) {
        createSession(messageContent.trim().substring(0, 30));
      }

      // Add user message
      addMessage({ role: 'user', content: messageContent.trim() });

      // Prepare messages for API
      const apiMessages = [
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: 'user' as const, content: messageContent.trim() },
      ];

      setLoading(true);
      setError(null);
      setStreamingMessage('');

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        let finalStreamingMessage = '';

        await deepSeekAPI.streamChatCompletion(
          apiMessages,
          chunk => {
            setStreamingMessage(prev => {
              const newMessage = prev + chunk;
              finalStreamingMessage = newMessage;
              return newMessage;
            });
          },
          () => {
            // Add the complete AI message to store
            if (finalStreamingMessage) {
              addMessage({ role: 'assistant', content: finalStreamingMessage });
            }
            setStreamingMessage('');
            setLoading(false);
            abortControllerRef.current = null;
          },
          errorMessage => {
            setError(errorMessage);
            setStreamingMessage('');
            setLoading(false);
            abortControllerRef.current = null;
          },
          abortControllerRef.current
        );
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
        setStreamingMessage('');
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      addMessage,
      setLoading,
      setError,
      currentSessionId,
      sessions,
      createSession,
    ]
  );

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setStreamingMessage('');
    }
  }, [setLoading]);

  return {
    messages,
    isLoading,
    error,
    streamingMessage,
    sendMessage,
    cancelRequest,
  };
};
