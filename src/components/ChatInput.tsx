import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onCancelRequest: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onCancelRequest,
  isLoading,
  disabled = false,
}: ChatInputProps): JSX.Element {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!message.trim() || isLoading || disabled) return;

    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="input-field resize-none min-h-[44px] max-h-[120px] pr-12"
              rows={1}
              disabled={isLoading || disabled}
              aria-label="Chat message input"
            />

            {isLoading && (
              <div className="absolute right-3 bottom-3">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={isLoading ? onCancelRequest : handleSubmit}
            disabled={(!message.trim() && !isLoading) || disabled}
            className={`btn-primary flex items-center justify-center min-w-[44px] h-[44px] ${
              isLoading ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
            aria-label={isLoading ? 'Cancel request' : 'Send message'}
          >
            {isLoading ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {isLoading
            ? 'AI is thinking...'
            : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </div>
    </div>
  );
}
