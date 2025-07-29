import { useState } from 'react';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { ClearHistoryModal } from './components/ClearHistoryModal';
import { HistorySidebar } from './components/HistorySidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChat } from './hooks/useChat';
import { useChatStore } from './store/chatStore';

function App(): JSX.Element {
  const [showClearModal, setShowClearModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    messages,
    isLoading,
    error,
    streamingMessage,
    sendMessage,
    cancelRequest,
  } = useChat();
  const { clearHistory } = useChatStore();

  const handleClearHistory = () => {
    clearHistory();
    setShowClearModal(false);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleCancelRequest = () => {
    cancelRequest();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <HistorySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col lg:ml-0">
          <Header
            onClearHistory={() => setShowClearModal(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 flex flex-col">
            <ChatContainer
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
            />

            <ChatInput
              onSendMessage={handleSendMessage}
              onCancelRequest={handleCancelRequest}
              isLoading={isLoading}
              disabled={!!error}
            />
          </main>
        </div>

        <ClearHistoryModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearHistory}
        />

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-md animate-fade-in">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
