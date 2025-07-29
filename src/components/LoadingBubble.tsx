import { StopIcon } from '@heroicons/react/24/outline';

interface LoadingBubbleProps {
  onStop: () => void;
  onRedo?: (() => void) | undefined;
  isStreaming: boolean;
  isStopped?: boolean;
}

export function LoadingBubble({
  onStop,
  onRedo,
  isStreaming,
  isStopped = false,
}: LoadingBubbleProps): JSX.Element | null {
  if (!isStreaming && !isStopped) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4 animate-slide-up">
      <div className="chat-bubble chat-bubble-ai">
        <div className="flex items-center justify-between min-w-0">
          {isStreaming ? (
            <>
              <div className="flex items-center space-x-3">
                {/* Spinner */}
                <div
                  className="w-4 h-4 border-2 border-primary-500/60 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-label="Generating response"
                >
                  <span className="sr-only">Generating...</span>
                </div>

                {/* Typing indicator */}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  DeepSeek is thinking...
                </span>
              </div>

              {/* Stop Button */}
              <button
                type="button"
                onClick={onStop}
                className="ml-4 p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <StopIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                {/* Status message */}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Generation stopped
                </span>
              </div>

              {/* Redo Button */}
              {onRedo && !isStreaming && (
                <button
                  type="button"
                  onClick={onRedo}
                  className="ml-4 p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                  aria-label="Redo generation"
                  title="Redo generation"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
