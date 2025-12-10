/**
 * Header Component
 * Logo and navigation links with dark mode toggle
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference on mount
    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  return (
    <header className="bg-white dark:bg-transparent shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-gray-900 dark:text-tuscan-sun">
            BingeScore
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-800 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <a
              href="#about"
              className="text-gray-800 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors font-medium"
            >
              Disclaimer
            </a>
            <div className="flex gap-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-shadow-gray hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800" />
                )}
              </button>
              <a
                href="https://github.com/AleBonatti/BingScore2026"
                target="_blank"
                className="p-2 rounded-lg bg-gray-200 text-ivory dark:bg-shadow-gray hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-github-icon lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>{' '}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
