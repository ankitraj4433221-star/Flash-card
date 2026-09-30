export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type CardStatus = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  hint?: string;
  tag?: string;
  status: CardStatus;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed?: number;
  createdAt: number;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  color: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastStudiedAt?: number;
  cardsCount?: number;
  masteredCount?: number;
}

export interface DeckWithCards extends Deck {
  cards: Flashcard[];
}

export type AddMode = 'manual' | 'photo' | 'notes' | 'topic';

export interface GenerationRequest {
  mode: AddMode;
  notes?: string;
  image?: {
    data: string;
    mimeType: string;
    name?: string;
  };
  difficulty: DifficultyLevel;
  count: number;
  titleHint?: string;
}

export interface GeneratedDeckDraft {
  title: string;
  summary?: string;
  extractedText?: string;
  cards: Array<{
    id: string;
    question: string;
    answer: string;
    hint?: string;
    tag?: string;
  }>;
}

export interface StudyResult {
  cardId: string;
  known: boolean;
}
