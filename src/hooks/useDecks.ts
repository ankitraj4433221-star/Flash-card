import { useState, useEffect, useCallback } from 'react';
import { Deck, Flashcard } from '../types';
import { dbService } from '../services/db';

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbService.getDecks();
      setDecks(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching decks:', err);
      setError(err?.message || 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
    const unsubscribe = dbService.subscribe(() => {
      loadDecks();
    });
    return unsubscribe;
  }, [loadDecks]);

  const deleteDeck = async (deckId: string) => {
    await dbService.deleteDeck(deckId);
  };

  const resetDeckProgress = async (deckId: string) => {
    await dbService.resetDeckProgress(deckId);
  };

  return {
    decks,
    loading,
    error,
    refreshDecks: loadDecks,
    deleteDeck,
    resetDeckProgress,
  };
}

export function useDeckCards(deckId: string | null) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!deckId) {
      setCards([]);
      setDeck(null);
      return;
    }
    try {
      setLoading(true);
      const [deckData, cardsData] = await Promise.all([
        dbService.getDeckById(deckId),
        dbService.getCardsForDeck(deckId),
      ]);
      setDeck(deckData);
      setCards(cardsData);
    } catch (err) {
      console.error('Error fetching deck cards:', err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  return { deck, cards, loading, refresh: loadData };
}
