import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Logo Icon: Dynamic SVG implementation to replace potentially broken external images */}
            <div className="relative flex items-center justify-center w-9 h-9">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl transform rotate-45 shadow-lg shadow-blue-500/30 transition-transform hover:scale-105"></div>
                 <svg className="w-4 h-4 text-white relative z-10 ml-0.5 fill-current" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z" />
                 </svg>
            </div>
            
            {/* Logo Text: Adapts color based on theme */}
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors select-none">
                Transcriber
            </span>
        </div>

        <div className="flex items-center space-x-4">
           <button
             onClick={toggleDarkMode}
             className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
             aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
           >
             {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;