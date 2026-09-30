import { Deck, Flashcard, CardStatus } from '../types';

const DB_NAME = 'FlashcardAppDB';
const DB_VERSION = 1;
const DECKS_STORE = 'decks';
const CARDS_STORE = 'cards';

const STARTER_DECKS: Array<{ deck: Deck; cards: Omit<Flashcard, 'deckId'>[] }> = [
  {
    deck: {
      id: 'starter_biology',
      title: 'Cellular Biology & Respiration',
      description: 'Key processes: Glycolysis, Krebs cycle, and ATP synthesis.',
      color: 'emerald',
      tags: ['Biology', 'Science', 'Pre-Med'],
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
      lastStudiedAt: Date.now() - 3600000 * 4,
    },
    cards: [
      {
        id: 'bio_1',
        question: 'What is the primary cellular organelle responsible for ATP production via oxidative phosphorylation?',
        answer: 'The Mitochondrion (specifically the inner mitochondrial membrane).',
        hint: 'Known as the "powerhouse of the cell"',
        tag: 'Organelles',
        status: 'mastered',
        timesCorrect: 3,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'bio_2',
        question: 'Where in the cell does glycolysis take place, and does it require oxygen?',
        answer: 'In the cytoplasm (cytosol). It is anaerobic and does not require oxygen.',
        hint: 'First stage before entering mitochondria',
        tag: 'Glycolysis',
        status: 'mastered',
        timesCorrect: 2,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'bio_3',
        question: 'What is the net yield of ATP and NADH per molecule of glucose during glycolysis?',
        answer: 'Net 2 ATP and 2 NADH molecules (4 ATP produced, 2 ATP invested).',
        hint: 'Invest 2, gain 4',
        tag: 'Bioenergetics',
        status: 'learning',
        timesCorrect: 1,
        timesIncorrect: 1,
        createdAt: Date.now(),
      },
      {
        id: 'bio_4',
        question: 'What enzyme acts as a molecular rotor utilizing the proton gradient to synthesize ATP?',
        answer: 'ATP Synthase.',
        hint: 'Driven by chemiosmosis / proton motive force',
        tag: 'Enzymes',
        status: 'new',
        timesCorrect: 0,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'bio_5',
        question: 'What is the final electron acceptor in the aerobic Electron Transport Chain (ETC)?',
        answer: 'Molecular Oxygen (O₂), which combines with protons (H⁺) to form water (H₂O).',
        hint: 'Why we breathe oxygen',
        tag: 'ETC',
        status: 'learning',
        timesCorrect: 1,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
    ],
  },
  {
    deck: {
      id: 'starter_cs',
      title: 'CS: Data Structures & Big-O',
      description: 'Fundamental algorithmic complexities and abstract data types.',
      color: 'indigo',
      tags: ['Computer Science', 'Algorithms'],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
      lastStudiedAt: Date.now() - 86400000,
    },
    cards: [
      {
        id: 'cs_1',
        question: 'What is the average time complexity for searching, inserting, and deleting in a Hash Table?',
        answer: 'O(1) average time complexity (constant time). Worst case is O(n) during severe hash collisions.',
        hint: 'Direct key hashing mapping to buckets',
        tag: 'Hash Tables',
        status: 'mastered',
        timesCorrect: 4,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'cs_2',
        question: 'What is the prerequisite for performing Binary Search on an array?',
        answer: 'The array must be sorted in ascending or descending order.',
        hint: 'Dividing search interval in half requires ordered elements',
        tag: 'Searching',
        status: 'mastered',
        timesCorrect: 3,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'cs_3',
        question: 'What is the worst-case time complexity of QuickSort, and when does it occur?',
        answer: 'O(n²). It occurs when the pivot chosen is consistently the smallest or largest element (e.g., in an already sorted array with naive pivot selection).',
        hint: 'Unbalanced partitions',
        tag: 'Sorting',
        status: 'learning',
        timesCorrect: 1,
        timesIncorrect: 1,
        createdAt: Date.now(),
      },
      {
        id: 'cs_4',
        question: 'Which data structure follows the LIFO (Last-In, First-Out) principle?',
        answer: 'Stack (e.g., call stack, undo operations).',
        hint: 'Like a stack of plates',
        tag: 'Data Structures',
        status: 'mastered',
        timesCorrect: 5,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'cs_5',
        question: 'What is the space complexity of MergeSort on an array of size n?',
        answer: 'O(n) auxiliary space due to the temporary arrays needed during the merge step.',
        hint: 'Requires copying elements to helper array',
        tag: 'Sorting',
        status: 'new',
        timesCorrect: 0,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
    ],
  },
  {
    deck: {
      id: 'starter_spanish',
      title: 'Conversational Spanish Core Phrases',
      description: 'Essential everyday vocabulary and idiom usage.',
      color: 'amber',
      tags: ['Language', 'Spanish'],
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
    },
    cards: [
      {
        id: 'sp_1',
        question: 'How do you say "Could you please repeat that more slowly?" in Spanish?',
        answer: '¿Podría repetirlo más despacio, por favor?',
        hint: 'Uses "despacio" for slowly',
        tag: 'Phrases',
        status: 'new',
        timesCorrect: 0,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
      {
        id: 'sp_2',
        question: 'What is the difference between "Por qué" and "Porque"?',
        answer: '"Por qué" (two words with accent) means "Why?", whereas "Porque" (one word) means "Because".',
        hint: 'Question vs explanation',
        tag: 'Grammar',
        status: 'learning',
        timesCorrect: 2,
        timesIncorrect: 1,
        createdAt: Date.now(),
      },
      {
        id: 'sp_3',
        question: 'How do you express "I am looking forward to it" colloquially in Spanish?',
        answer: 'Tengo muchas ganas / Tengo ilusión.',
        hint: 'Literally "having desires/excitement"',
        tag: 'Idioms',
        status: 'new',
        timesCorrect: 0,
        timesIncorrect: 0,
        createdAt: Date.now(),
      },
    ],
  },
];

type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error(e);
    }
  });
}

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(DECKS_STORE)) {
          db.createObjectStore(DECKS_STORE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(CARDS_STORE)) {
          const cardStore = db.createObjectStore(CARDS_STORE, { keyPath: 'id' });
          cardStore.createIndex('deckId', 'deckId', { unique: false });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        // Check if starter decks need seeding
        try {
          const count = await this.countItems(db, DECKS_STORE);
          if (count === 0) {
            await this.seedStarterDecks(db);
          }
        } catch (e) {
          console.error('Error seeding initial decks:', e);
        }
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private countItems(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private seedStarterDecks(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction([DECKS_STORE, CARDS_STORE], 'readwrite');
      const deckStore = tx.objectStore(DECKS_STORE);
      const cardStore = tx.objectStore(CARDS_STORE);

      for (const item of STARTER_DECKS) {
        deckStore.put(item.deck);
        for (const card of item.cards) {
          cardStore.put({ ...card, deckId: item.deck.id });
        }
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public subscribe(listener: ChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  public async getDecks(): Promise<Deck[]> {
    const db = await this.openDB();
    const decks = await new Promise<Deck[]>((resolve, reject) => {
      const tx = db.transaction(DECKS_STORE, 'readonly');
      const store = tx.objectStore(DECKS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    // Decorate with card counts & mastery stats
    const allCards = await this.getAllCards();
    const cardMap = new Map<string, Flashcard[]>();
    for (const card of allCards) {
      if (!cardMap.has(card.deckId)) {
        cardMap.set(card.deckId, []);
      }
      cardMap.get(card.deckId)!.push(card);
    }

    return decks.map((deck) => {
      const deckCards = cardMap.get(deck.id) || [];
      const total = deckCards.length;
      const mastered = deckCards.filter((c) => c.status === 'mastered').length;
      return {
        ...deck,
        cardsCount: total,
        masteredCount: mastered,
      };
    }).sort((a, b) => (b.lastStudiedAt || b.createdAt) - (a.lastStudiedAt || a.createdAt));
  }

  public async getDeckById(deckId: string): Promise<Deck | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DECKS_STORE, 'readonly');
      const store = tx.objectStore(DECKS_STORE);
      const req = store.get(deckId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getCardsForDeck(deckId: string): Promise<Flashcard[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readonly');
      const store = tx.objectStore(CARDS_STORE);
      const index = store.index('deckId');
      const req = index.getAll(deckId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllCards(): Promise<Flashcard[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readonly');
      const store = tx.objectStore(CARDS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveDeckWithCards(
    deck: Omit<Deck, 'createdAt' | 'updatedAt' | 'id'> & { id?: string },
    cards: Array<Omit<Flashcard, 'id' | 'deckId' | 'status' | 'timesCorrect' | 'timesIncorrect' | 'createdAt'> & { id?: string }>
  ): Promise<string> {
    const db = await this.openDB();
    const deckId = deck.id || `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const fullDeck: Deck = {
      id: deckId,
      title: deck.title.trim() || 'Untitled Deck',
      description: deck.description || '',
      color: deck.color || 'indigo',
      tags: deck.tags || ['Study'],
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([DECKS_STORE, CARDS_STORE], 'readwrite');
      const deckStore = tx.objectStore(DECKS_STORE);
      const cardStore = tx.objectStore(CARDS_STORE);

      deckStore.put(fullDeck);

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const cardId = c.id || `card_${deckId}_${now}_${i}`;
        const fullCard: Flashcard = {
          id: cardId,
          deckId,
          question: c.question.trim(),
          answer: c.answer.trim(),
          hint: c.hint?.trim() || '',
          tag: c.tag?.trim() || '',
          status: 'new',
          timesCorrect: 0,
          timesIncorrect: 0,
          createdAt: now,
        };
        cardStore.put(fullCard);
      }

      tx.oncomplete = () => {
        notifyListeners();
        resolve(deckId);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async updateDeck(deckId: string, updates: Partial<Deck>): Promise<void> {
    const db = await this.openDB();
    const deck = await this.getDeckById(deckId);
    if (!deck) throw new Error('Deck not found');

    const updated = { ...deck, ...updates, updatedAt: Date.now() };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(DECKS_STORE, 'readwrite');
      const store = tx.objectStore(DECKS_STORE);
      store.put(updated);
      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async deleteDeck(deckId: string): Promise<void> {
    const db = await this.openDB();
    const cards = await this.getCardsForDeck(deckId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([DECKS_STORE, CARDS_STORE], 'readwrite');
      const deckStore = tx.objectStore(DECKS_STORE);
      const cardStore = tx.objectStore(CARDS_STORE);

      deckStore.delete(deckId);
      for (const card of cards) {
        cardStore.delete(card.id);
      }

      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async updateCard(cardId: string, updates: Partial<Flashcard>): Promise<void> {
    const db = await this.openDB();
    const card = await new Promise<Flashcard | null>((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readonly');
      const store = tx.objectStore(CARDS_STORE);
      const req = store.get(cardId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (!card) throw new Error('Card not found');

    const updated = { ...card, ...updates };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readwrite');
      const store = tx.objectStore(CARDS_STORE);
      store.put(updated);
      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async recordReview(cardId: string, known: boolean): Promise<void> {
    const db = await this.openDB();
    const card = await new Promise<Flashcard | null>((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readonly');
      const store = tx.objectStore(CARDS_STORE);
      const req = store.get(cardId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (!card) return;

    const timesCorrect = known ? card.timesCorrect + 1 : card.timesCorrect;
    const timesIncorrect = !known ? card.timesIncorrect + 1 : card.timesIncorrect;

    let status: CardStatus = card.status;
    if (known) {
      if (timesCorrect >= 2) status = 'mastered';
      else status = 'learning';
    } else {
      status = 'learning';
    }

    const updatedCard: Flashcard = {
      ...card,
      timesCorrect,
      timesIncorrect,
      status,
      lastReviewed: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([CARDS_STORE, DECKS_STORE], 'readwrite');
      const cardStore = tx.objectStore(CARDS_STORE);
      const deckStore = tx.objectStore(DECKS_STORE);

      cardStore.put(updatedCard);

      // Also update deck's lastStudiedAt
      const deckReq = deckStore.get(card.deckId);
      deckReq.onsuccess = () => {
        if (deckReq.result) {
          deckStore.put({
            ...deckReq.result,
            lastStudiedAt: Date.now(),
          });
        }
      };

      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async resetDeckProgress(deckId: string): Promise<void> {
    const cards = await this.getCardsForDeck(deckId);
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(CARDS_STORE, 'readwrite');
      const store = tx.objectStore(CARDS_STORE);

      for (const card of cards) {
        store.put({
          ...card,
          status: 'new',
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewed: undefined,
        });
      }

      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Backup & Restore
  public async exportDatabaseJSON(): Promise<string> {
    const decks = await this.getDecks();
    const cards = await this.getAllCards();
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      decks,
      cards,
    };
    return JSON.stringify(backup, null, 2);
  }

  public async importDatabaseJSON(jsonStr: string, mode: 'merge' | 'replace' = 'merge'): Promise<{ decksCount: number; cardsCount: number }> {
    const data = JSON.parse(jsonStr);
    if (!data.decks || !Array.isArray(data.decks) || !data.cards || !Array.isArray(data.cards)) {
      throw new Error('Invalid backup file format.');
    }

    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([DECKS_STORE, CARDS_STORE], 'readwrite');
      const deckStore = tx.objectStore(DECKS_STORE);
      const cardStore = tx.objectStore(CARDS_STORE);

      if (mode === 'replace') {
        deckStore.clear();
        cardStore.clear();
      }

      for (const deck of data.decks) {
        deckStore.put(deck);
      }
      for (const card of data.cards) {
        cardStore.put(card);
      }

      tx.oncomplete = () => {
        notifyListeners();
        resolve({ decksCount: data.decks.length, cardsCount: data.cards.length });
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async resetToStarterDecks(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([DECKS_STORE, CARDS_STORE], 'readwrite');
      const deckStore = tx.objectStore(DECKS_STORE);
      const cardStore = tx.objectStore(CARDS_STORE);

      deckStore.clear();
      cardStore.clear();

      for (const item of STARTER_DECKS) {
        deckStore.put(item.deck);
        for (const card of item.cards) {
          cardStore.put({ ...card, deckId: item.deck.id });
        }
      }

      tx.oncomplete = () => {
        notifyListeners();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new LocalDatabase();
