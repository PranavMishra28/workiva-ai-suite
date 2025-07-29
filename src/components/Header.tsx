import React from 'react';
import { SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { useChatStore } from '../store/chatStore';

export function Header(): JSX.Element {
  const { toggleSidebar } = useChatStore();
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
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg">
      <div className="flex justify-between items-center h-14 pl-2 sm:pl-4 pr-4">
        {/* Left-anchored logo and text */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg sm:hidden"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="p-1 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <img
              src={logo}
              alt="Workiva logo"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Workiva AI Suite
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Powered by DeepSeek R1 0528 (Free)
            </p>
          </div>
        </div>

        {/* Right-aligned controls */}
        <div className="flex items-center ml-auto">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
