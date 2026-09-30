import React, { useState, useMemo } from 'react';
import {
  Play,
  Search,
  BookOpen,
  Sparkles,
  MoreVertical,
  RotateCcw,
  Trash2,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Deck } from '../../types';

interface DeckListProps {
  decks: Deck[];
  loading: boolean;
  onSelectDeck: (deckId: string) => void;
  onOpenAdd: () => void;
  onDeleteDeck: (deckId: string) => void;
  onResetProgress: (deckId: string) => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  loading,
  onSelectDeck,
  onOpenAdd,
  onDeleteDeck,
  onResetProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    decks.forEach((d) => (d.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [decks]);

  // Filtered decks
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch =
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deck.tags && deck.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesTag = selectedTag === 'all' || (deck.tags && deck.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [decks, searchQuery, selectedTag]);

  // Overall Stats
  const totalCards = decks.reduce((acc, d) => acc + (d.cardsCount || 0), 0);
  const totalMastered = decks.reduce((acc, d) => acc + (d.masteredCount || 0), 0);
  const overallPercentage = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'Not yet practiced';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeckColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800/40',
          accent: 'bg-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-300',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800/40',
          accent: 'bg-amber-500',
          text: 'text-amber-700 dark:text-amber-300',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          border: 'border-rose-200 dark:border-rose-800/40',
          accent: 'bg-rose-500',
          text: 'text-rose-700 dark:text-rose-300',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800/40',
          accent: 'bg-purple-500',
          text: 'text-purple-700 dark:text-purple-300',
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/30',
          border: 'border-indigo-200 dark:border-indigo-800/40',
          accent: 'bg-indigo-600',
          text: 'text-indigo-700 dark:text-indigo-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero / Summary Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-sky-700 p-6 text-white shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4 text-sky-300" />
              <span>Active Practice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to learn today?
            </h2>
            <p className="text-indigo-100/90 text-sm mt-1">
              Review your decks with spaced repetition and active recall.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 w-full sm:w-auto justify-around">
            <div className="text-center">
              <div className="text-2xl font-black">{decks.length}</div>
              <div className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Decks</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black">{totalCards}</div>
              <div className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Cards</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-300">{overallPercentage}%</div>
              <div className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Mastered</div>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks, concepts, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Tags filter scroll */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Decks
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800/50 animate-pulse border border-slate-200/50 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredDecks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredDecks.map((deck) => {
            const cardCount = deck.cardsCount || 0;
            const mastered = deck.masteredCount || 0;
            const percent = cardCount > 0 ? Math.round((mastered / cardCount) * 100) : 0;
            const themeStyle = getDeckColorClasses(deck.color);

            return (
              <div
                key={deck.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                      </span>

                      {deck.tags && deck.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                          <Tag className="w-3 h-3" />
                          {deck.tags[0]}
                        </span>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuDeckId(openMenuDeckId === deck.id ? null : deck.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Deck options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuDeckId === deck.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setOpenMenuDeckId(null)}
                          />
                          <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setOpenMenuDeckId(null);
                                onResetProgress(deck.id);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4 text-amber-500" />
                              Reset Progress
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuDeckId(null);
                                if (window.confirm(`Delete "${deck.title}" deck and all its flashcards?`)) {
                                  onDeleteDeck(deck.id);
                                }
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Deck
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => onSelectDeck(deck.id)}
                    className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
                  >
                    {deck.title}
                  </h3>
                  {deck.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}
                </div>

                {/* Progress & Practice CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {mastered} / {cardCount} mastered
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{percent}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Bottom bar with timestamp and Practice button */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(deck.lastStudiedAt)}
                    </span>

                    <button
                      onClick={() => onSelectDeck(deck.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Practice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {searchQuery ? 'No matching decks found' : 'No flashcard decks yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
            {searchQuery
              ? `Try adjusting your search query "${searchQuery}" or clear the tag filters.`
              : 'Create your first deck manually, upload a photo of handwritten notes for AI OCR, or paste your study notes!'}
          </p>
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            + Create New Deck
          </button>
        </div>
      )}
    </div>
  );
};
