import { useState } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useChatStore } from '../store/chatStore';
import { ChatSession } from '../types';
import { useSearch } from '../hooks/useSearch';

export function HistorySidebar(): JSX.Element {
  const {
    sessions,
    currentSessionId,
    createSession,
    loadSession,
    deleteSession,
    isSidebarOpen,
    toggleSidebar,
  } = useChatStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, filteredSessions } = useSearch(sessions);

  const handleNewChat = () => {
    createSession('New Chat');
    if (window.innerWidth < 640) {
      toggleSidebar();
    }
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    if (window.innerWidth < 640) {
      toggleSidebar();
    }
  };

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setIsDeleting(sessionId);

    // Small delay to show the deleting state
    setTimeout(() => {
      deleteSession(sessionId);
      setIsDeleting(null);
    }, 150);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncateTitle = (title: string) =>
    title.length > 30 ? `${title.substring(0, 30)}...` : title;

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={toggleSidebar}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              toggleSidebar();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Collapsible Toggle Button */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md dark:shadow-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:hidden"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <ChevronLeftIcon className="w-5 h-5" />
        ) : (
          <ChevronRightIcon className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-screen w-70 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-all duration-150 ease-in-out z-50 flex flex-col overflow-hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0 sm:static sm:z-auto
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sticky Header Zone */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat History
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                  aria-label="New chat"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl sm:hidden"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 pb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Chat List */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-140px)] p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No chat history yet
                </p>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSessions.map((session: ChatSession) => (
                  <button
                    type="button"
                    key={session.id}
                    onClick={() => handleLoadSession(session.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleLoadSession(session.id);
                      }
                    }}
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 w-full text-left
                      ${
                        currentSessionId === session.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {truncateTitle(session.title)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => handleDeleteSession(session.id, e)}
                      disabled={isDeleting === session.id}
                      className={`
                        p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200
                        ${isDeleting === session.id ? 'opacity-50' : ''}
                      `}
                      aria-label="Delete session"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
