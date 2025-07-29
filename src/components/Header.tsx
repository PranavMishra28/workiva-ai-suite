import React from 'react';
import {
  SunIcon,
  MoonIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';

interface HeaderProps {
  onClearHistory: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  onClearHistory,
  onToggleSidebar,
}: HeaderProps): JSX.Element {
  const [isDark, setIsDark] = React.useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  React.useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <img
            src={logo}
            alt="Workiva logo"
            className="w-6 h-6 inline-block mr-2 rounded"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Workiva AI Suite
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by DeepSeek R1 0528 (Free)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClearHistory}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            aria-label="Clear chat history"
          >
            <TrashIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
