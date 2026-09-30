import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Moon,
  Sun,
  Database,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  HelpCircle,
  FileJson,
  BrainCircuit
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useTheme } from '../../hooks/useTheme';

interface SettingsViewProps {
  onDataChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataChanged }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const jsonStr = await dbService.exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flashai_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('success', 'Backup exported successfully!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await dbService.importDatabaseJSON(text, 'merge');
      showNotification('success', `Imported ${result.decksCount} decks and ${result.cardsCount} cards!`);
      onDataChanged();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to import backup JSON file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetStarter = async () => {
    if (window.confirm('Restore default starter decks? This will reset the database to sample decks.')) {
      try {
        await dbService.resetToStarterDecks();
        showNotification('success', 'Starter decks reloaded!');
        onDataChanged();
      } catch (err: any) {
        showNotification('error', err?.message || 'Failed to reset decks');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Local Storage
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your offline storage, backups, and display preferences.
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Dark Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Current: {theme === 'dark' ? 'Dark' : 'Light'} theme
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Local Storage & Backup Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Local Data & Backups
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" /> No Account Needed
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          All your flashcards, decks, and review scores are saved locally inside your browser&apos;s IndexedDB. You can export a full JSON backup anytime to transfer to another device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800/60 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup (JSON)</span>
          </button>
        </div>

        {/* Reload Starters */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Restore Sample Decks
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Load Biology, CS Algorithms, and Spanish decks
            </div>
          </div>

          <button
            onClick={handleResetStarter}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* AI & OCR Info Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent p-5 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <BrainCircuit className="w-4 h-4" />
          <span>Multimodal OCR & AI Synthesis</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          When taking or uploading photos of handwritten notes, ensure proper lighting and avoid heavy shadows for maximum OCR accuracy. The AI automatically ignores formatting artifacts and synthesizes concise, high-yield active recall flashcards.
        </p>
      </div>

      <div className="text-center text-xs text-slate-400 dark:text-slate-600 pt-4">
        FlashAI • Local-First Active Recall & Spaced Repetition
      </div>
    </div>
  );
};
