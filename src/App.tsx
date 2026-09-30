/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DeckList } from './components/Practice/DeckList';
import { StudySession } from './components/Practice/StudySession';
import { AddModal } from './components/Add/AddModal';
import { SettingsView } from './components/Settings/SettingsView';
import { useDecks, useDeckCards } from './hooks/useDecks';

export default function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'settings'>('practice');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const { decks, loading, refreshDecks, deleteDeck, resetDeckProgress } = useDecks();
  const { deck: studyingDeck, cards: studyingCards } = useDeckCards(activeDeckId);

  const totalMastered = useMemo(() => {
    return decks.reduce((acc, d) => acc + (d.masteredCount || 0), 0);
  }, [decks]);

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
  };

  const handleDeckCreated = (newDeckId: string) => {
    refreshDecks();
    // Prompt practice or open newly created deck
    setActiveDeckId(newDeckId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-400">
      {/* Navigation Header & Mobile Bottom Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdd={() => setIsAddOpen(true)}
        totalMastered={totalMastered}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-28 md:pb-12">
        {activeTab === 'practice' && (
          <DeckList
            decks={decks}
            loading={loading}
            onSelectDeck={handleSelectDeck}
            onOpenAdd={() => setIsAddOpen(true)}
            onDeleteDeck={deleteDeck}
            onResetProgress={resetDeckProgress}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView onDataChanged={refreshDecks} />
        )}
      </main>

      {/* Study Session Modal / Screen */}
      {activeDeckId && studyingDeck && studyingCards && (
        <StudySession
          deck={studyingDeck}
          initialCards={studyingCards}
          onClose={() => setActiveDeckId(null)}
        />
      )}

      {/* Add Deck / AI Generator Modal */}
      <AddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onDeckCreated={handleDeckCreated}
      />
    </div>
  );
}
