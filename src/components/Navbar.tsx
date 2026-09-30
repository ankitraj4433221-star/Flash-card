import React from 'react';
import { BookOpen, Plus, Settings, Sparkles, Moon, Sun, Flame } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface NavbarProps {
  activeTab: 'practice' | 'settings';
  setActiveTab: (tab: 'practice' | 'settings') => void;
  onOpenAdd: () => void;
  totalMastered?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdd,
  totalMastered = 0,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-sky-300">
                  FlashAI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 uppercase tracking-wider">
                  Local-First
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart Flashcard Maker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak / Mastery pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{totalMastered} Mastered</span>
            </div>

            {/* Desktop Add button */}
            <button
              onClick={onOpenAdd}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Deck</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex justify-around items-center md:hidden transition-colors shadow-lg">
        {/* Practice Tab */}
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'practice'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px]">Practice</span>
        </button>

        {/* Elevated Center Add Button */}
        <button
          onClick={onOpenAdd}
          aria-label="Create flashcards"
          className="relative -top-5 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            + Add
          </span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">Settings</span>
        </button>
      </nav>
    </>
  );
};
