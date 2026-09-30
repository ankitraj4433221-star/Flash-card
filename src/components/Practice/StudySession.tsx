import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Volume2,
  Shuffle,
  Lightbulb,
  Trophy,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';
import { Deck, Flashcard } from '../../types';
import { dbService } from '../../services/db';

interface StudySessionProps {
  deck: Deck;
  initialCards: Flashcard[];
  onClose: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  initialCards,
  onClose,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(() => [...initialCards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  // Results tracking
  const [results, setResults] = useState<{ [cardId: string]: boolean }>({});
  const [isFinished, setIsFinished] = useState(false);

  // Card currently displayed
  const currentCard = cards[currentIndex];

  // Reset card state when index changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === '2' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, isFinished, cards]);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleAnswer = async (known: boolean) => {
    if (!currentCard) return;

    // Record in local database
    await dbService.recordReview(currentCard.id, known);

    // Save result in local session state
    setResults((prev) => ({
      ...prev,
      [currentCard.id]: known,
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = (missedOnly: boolean = false) => {
    if (missedOnly) {
      const missedIds = Object.keys(results).filter((id) => results[id] === false);
      const missedCards = cards.filter((c) => missedIds.includes(c.id));
      if (missedCards.length > 0) {
        setCards(missedCards);
        setCurrentIndex(0);
        setResults({});
        setIsFinished(false);
        return;
      }
    }
    // Full restart
    setCards([...initialCards]);
    setCurrentIndex(0);
    setResults({});
    setIsFinished(false);
  };

  // Text-To-Speech audio pronunciation
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Results calculation
  const knownCount = useMemo(() => {
    return Object.values(results).filter((r) => r === true).length;
  }, [results]);

  const missedCount = useMemo(() => {
    return Object.values(results).filter((r) => r === false).length;
  }, [results]);

  const accuracy = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;

  if (!cards || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold dark:text-white">No cards in this deck</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Add cards to &quot;{deck.title}&quot; to start practicing.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Session Completed Summary Screen
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="max-w-md w-full mx-auto my-auto text-center space-y-6">
          {/* Trophy Header */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
              <Trophy className="w-12 h-12 stroke-[2]" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              ✓
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Session Complete!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Deck: <span className="font-semibold text-slate-800 dark:text-slate-200">{deck.title}</span>
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-around">
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{cards.length}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Reviewed</div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-3xl font-black text-emerald-500">{knownCount}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Known</div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-3xl font-black text-rose-500">{missedCount}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">To Review</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Accuracy</span>
                <span className={accuracy >= 80 ? 'text-emerald-500 font-bold' : 'text-indigo-600 font-bold'}>
                  {accuracy}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {missedCount > 0 && (
              <button
                onClick={() => handleRestart(true)}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Practice Missed Cards ({missedCount})
              </button>
            )}

            <button
              onClick={() => handleRestart(false)}
              className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Full Deck
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done & Return to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Practice Screen
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Bar */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Deck Title & Progress Indicator */}
        <div className="flex-1 max-w-xs text-center">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {deck.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
        </div>

        {/* Tools: Audio & Shuffle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => speakText(isFlipped ? currentCard.answer : currentCard.question)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="Read aloud with speech audio"
            aria-label="Read aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isShuffled
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="Shuffle cards"
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container with 3D Flip */}
      <div className="max-w-md w-full mx-auto my-auto flex flex-col items-center justify-center perspective-1000 py-4">
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className={`relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[500px] cursor-pointer preserve-3d transition-transform duration-500 ease-out select-none ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT: QUESTION SIDE */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-300/40 dark:shadow-black/50">
            {/* Top Card Meta */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                Question
              </span>
              {currentCard.tag && (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  #{currentCard.tag}
                </span>
              )}
            </div>

            {/* Question Center Content */}
            <div className="my-auto py-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentCard.question}
              </p>

              {/* Memory Hint Drawer */}
              {currentCard.hint && (
                <div className="mt-4 inline-block" onClick={(e) => e.stopPropagation()}>
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Show Hint
                    </button>
                  ) : (
                    <div className="px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-150">
                      <span className="font-bold">Hint: </span>
                      {currentCard.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="text-center text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tap card to see answer (or Space)</span>
            </div>
          </div>

          {/* BACK: ANSWER SIDE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white border-2 border-indigo-500/50 shadow-2xl shadow-indigo-600/30">
            {/* Top Card Meta */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-md">
                Answer
              </span>
              <span className="text-xs font-medium text-indigo-200">
                Active Recall
              </span>
            </div>

            {/* Answer Center Content */}
            <div className="my-auto py-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {currentCard.answer}
              </p>

              {currentCard.hint && (
                <p className="text-xs text-indigo-200 mt-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl inline-block">
                  💡 {currentCard.hint}
                </p>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="text-center text-indigo-200 text-xs flex items-center justify-center gap-1.5 font-medium">
              <span>Tap to flip back to question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Practice Controls (Know / Didn't Know / Flip) */}
      <div className="max-w-md w-full mx-auto space-y-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Didn't Know Button */}
          <button
            onClick={() => handleAnswer(false)}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 font-bold text-sm sm:text-base border border-rose-200/80 dark:border-rose-900/50 shadow-sm transition-all cursor-pointer"
          >
            <XCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Didn&apos;t Know</span>
            <span className="hidden sm:inline-block text-[10px] opacity-60 bg-rose-200/60 dark:bg-rose-900/80 px-1.5 py-0.5 rounded font-mono">
              [1]
            </span>
          </button>

          {/* Know Button */}
          <button
            onClick={() => handleAnswer(true)}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 font-bold text-sm sm:text-base border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Know</span>
            <span className="hidden sm:inline-block text-[10px] opacity-60 bg-emerald-200/60 dark:bg-emerald-900/80 px-1.5 py-0.5 rounded font-mono">
              [2]
            </span>
          </button>
        </div>

        {/* Flip toggle button for accessibility */}
        <div className="text-center pt-1">
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors py-1 px-3 cursor-pointer"
          >
            {isFlipped ? 'Show Question' : 'Flip to Reveal Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};
