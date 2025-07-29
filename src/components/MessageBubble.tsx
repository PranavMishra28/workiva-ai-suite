
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps): JSX.Element {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
    >
      <div
        className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
      >
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-medium">AI</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap break-words">
                {message.content}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                )}
              </p>
            </div>

            <div
              className={`text-xs mt-2 ${isUser ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {formattedTime}
            </div>
          </div>

          {isUser && (
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-medium">You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
