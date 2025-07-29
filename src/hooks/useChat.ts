import { useCallback, useRef, useState } from 'react';
import { deepSeekAPI } from '../api/deepseek';
import { useChatStore } from '../store/chatStore';

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    sessions,
    currentSessionId,
    createSession,
  } = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [lastUserMessageId, setLastUserMessageId] = useState<string>('');
  const currentAssistantMessageIdRef = useRef<string>('');

  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim()) return;

      // Create session if this is the first message
      if (!currentSessionId && sessions.length === 0) {
        createSession(messageContent.trim().substring(0, 30));
      }

      // Add user message
      const userMessageId = crypto.randomUUID();
      addMessage({
        role: 'user',
        content: messageContent.trim(),
      });
      setLastUserMessageId(userMessageId);

      // Prepare messages for API
      const apiMessages = [
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: 'user' as const, content: messageContent.trim() },
      ];

      setLoading(true);
      setIsStreaming(true);
      setIsStopped(false);
      setError(null);
      setStreamingMessage('');
      setLastUserMessage(messageContent.trim());

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
              addMessage({
                role: 'assistant',
                content: finalStreamingMessage,
              });
            }
            setStreamingMessage('');
            setLoading(false);
            setIsStreaming(false);
            setIsStopped(false);
            currentAssistantMessageIdRef.current = '';
            abortControllerRef.current = null;
          },
          errorMessage => {
            setError(errorMessage);
            setStreamingMessage('');
            setLoading(false);
            setIsStreaming(false);
            setIsStopped(false);
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
        setIsStreaming(false);
        setIsStopped(false);
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
      setIsStreaming(false);
      setIsStopped(true);
      // Keep streaming message visible
    }
  }, [setLoading]);

  const redoRequest = useCallback(() => {
    if (lastUserMessage && lastUserMessageId) {
      // Mark the current assistant message as stopped
      const currentMessages = messages.filter(msg => msg.role === 'assistant');
      if (currentMessages.length > 0) {
        const lastAssistantMessage =
          currentMessages[currentMessages.length - 1];
        updateMessage(lastAssistantMessage.id, { isStopped: true });
      }

      // Create a new assistant message for the fresh response
      addMessage({
        role: 'assistant',
        content: '',
      });

      // Store the ID of the newly created message for later updates
      currentAssistantMessageIdRef.current =
        messages.length > 0 ? messages[messages.length - 1].id : '';

      // Prepare messages for API (include all previous messages + user message)
      const apiMessages = [
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: 'user' as const, content: lastUserMessage },
      ];

      setLoading(true);
      setIsStreaming(true);
      setIsStopped(false);
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

        deepSeekAPI.streamChatCompletion(
          apiMessages,
          chunk => {
            setStreamingMessage(prev => {
              const newMessage = prev + chunk;
              finalStreamingMessage = newMessage;
              return newMessage;
            });
          },
          () => {
            // Update the assistant message with complete content
            if (finalStreamingMessage && currentAssistantMessageIdRef.current) {
              updateMessage(currentAssistantMessageIdRef.current, {
                content: finalStreamingMessage,
              });
            }
            setStreamingMessage('');
            setLoading(false);
            setIsStreaming(false);
            setIsStopped(false);
            currentAssistantMessageIdRef.current = '';
            abortControllerRef.current = null;
          },
          errorMessage => {
            setError(errorMessage);
            setStreamingMessage('');
            setLoading(false);
            setIsStreaming(false);
            setIsStopped(false);
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
        setIsStreaming(false);
        setIsStopped(false);
        abortControllerRef.current = null;
      }
    }
  }, [
    lastUserMessage,
    lastUserMessageId,
    messages,
    addMessage,
    updateMessage,
    setLoading,
    setError,
  ]);

  return {
    messages,
    isLoading,
    error,
    streamingMessage,
    isStreaming,
    isStopped,
    sendMessage,
    cancelRequest,
    redoRequest,
  };
};
