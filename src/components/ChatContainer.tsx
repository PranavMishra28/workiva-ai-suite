import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader } from './Loader';
import { Message } from '../types';

interface ChatContainerProps {
  messages: Message[];
  streamingMessage?: string;
  isLoading: boolean;
}

export function ChatContainer({
  messages,
  streamingMessage,
  isLoading,
}: ChatContainerProps): JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to Workiva AI Suite
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start a conversation with DeepSeek R1. Ask questions, get help with
            coding, or explore ideas together.
          </p>

          <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span>Powered by advanced AI technology</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span>Real-time streaming responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span>Secure and private conversations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <div className="flex justify-start mb-4 animate-slide-up">
            <div className="chat-bubble chat-bubble-ai">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">AI</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap break-words">
                      {streamingMessage}
                      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingMessage && (
          <div className="flex justify-start mb-4 animate-slide-up">
            <div className="chat-bubble chat-bubble-ai">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">AI</span>
                </div>

                <div className="flex-1 min-w-0">
                  <Loader text="DeepSeek is thinking..." size="sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
