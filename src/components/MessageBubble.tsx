import {
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
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
  const timestamp =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp);
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

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {/* File Icon/Preview */}
                      <div className="flex-shrink-0">
                        {attachment.type === 'image' && attachment.preview ? (
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : attachment.type === 'pdf' ? (
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <DocumentIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <PhotoIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (attachment.url) {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.name;
                            link.click();
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                        aria-label={`Download ${attachment.name}`}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              {!isUser && message.isStopped && (
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                  (stopped)
                </span>
              )}
              <div
                className={`text-xs text-right ${isUser ? 'text-primary-100' : 'text-slate-400'}`}
              >
                {formattedTime}
              </div>
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
