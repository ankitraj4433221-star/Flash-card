import { GenerationRequest, GeneratedDeckDraft } from '../types';

export interface SampleNotePreset {
  id: string;
  title: string;
  category: string;
  notes: string;
  imageUrl?: string;
}

export const SAMPLE_PRESETS: SampleNotePreset[] = [
  {
    id: 'sample_bio_photosynthesis',
    title: 'Photosynthesis & Light Reactions',
    category: 'Biology',
    notes: `Photosynthesis Overview:
Process by which photoautotrophs convert solar radiant energy into chemical energy stored in glucose: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2.
Two main phases:
1. Light-Dependent Reactions: Occur in the thylakoid membranes of chloroplasts. Chlorophyll a and b pigments absorb photons. Photosystem II absorbs at 680nm, splits water (photolysis) producing O2, protons, and electrons. High-energy electrons travel along ETC to Photosystem I (700nm), reducing NADP+ to NADPH via Ferredoxin-NADP+ reductase. Chemiosmosis generates ATP via ATP synthase.
2. Light-Independent Reactions (Calvin-Benson Cycle): Occurs in the stroma. Powered by ATP and NADPH from light reactions. Fixes CO2 onto RuBP catalyzed by RuBisCO enzyme. Produces G3P (glyceraldehyde 3-phosphate), which synthesizes hexose sugars like glucose.`,
  },
  {
    id: 'sample_neuro_psych',
    title: 'Cognitive Science & Memory Retention',
    category: 'Psychology',
    notes: `Memory Architecture & Cognitive Retention:
- Sensory Memory: Ultra-short duration (< 1 sec for iconic visual, 2-4 sec for echoic auditory).
- Working Memory (Baddeley Model): Central executive, phonological loop, visuospatial sketchpad, and episodic buffer. Capacity is Miller's Law: 7 ± 2 chunks, updated to ~4 chunks in modern models.
- Long-Term Memory (LTM):
  * Declarative / Explicit: Episodic (personal life events) and Semantic (general knowledge/facts). Medial temporal lobe & Hippocampus critical for consolidation.
  * Non-Declarative / Implicit: Procedural motor skills (Basal ganglia & Cerebellum), priming, classical conditioning.
- Spaced Repetition & Ebbinghaus Forgetting Curve: Memory decays exponentially over time without review. Active recall forces neural reconstruction, strengthening synaptic plasticity (Long-Term Potentiation / LTP).`,
  },
  {
    id: 'sample_microecon',
    title: 'Microeconomics: Supply, Demand & Elasticity',
    category: 'Economics',
    notes: `Microeconomic Foundations:
- Law of Demand: Ceteris paribus, as price increases, quantity demanded decreases (downward sloping curve).
- Law of Supply: As price increases, quantity supplied increases (upward sloping curve).
- Market Equilibrium: Point where quantity demanded equals quantity supplied; no surplus or shortage.
- Price Elasticity of Demand (PED): % change in quantity demanded / % change in price.
  * PED > 1: Elastic (luxuries, many substitutes).
  * PED < 1: Inelastic (necessities, insulin, gasoline short-term).
  * PED = 1: Unitary elastic.
- Deadweight Loss (DWL): Loss in total social surplus (consumer + producer surplus) when markets are not in allocative equilibrium, often caused by taxes, tariffs, or monopolies.`,
  },
];

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}

export async function generateDeckWithAI(request: GenerationRequest): Promise<GeneratedDeckDraft> {
  const response = await fetch('/api/ai/generate-flashcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data?.error || 'Failed to generate flashcards';
    throw new Error(errorMsg);
  }

  return data.deck;
}

export async function enhanceCardWithAI(
  question: string,
  answer: string,
  action: 'shorten' | 'mnemonic' | 'clarify'
): Promise<{ question: string; answer: string; hint?: string }> {
  const response = await fetch('/api/ai/enhance-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, action }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Enhancement failed');
  }

  return data.card;
}

// Client-side fallback generator in case API is unavailable or offline
export function generateLocalFallbackCards(notes: string, count: number = 5): GeneratedDeckDraft {
  const lines = notes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const cards: GeneratedDeckDraft['cards'] = [];

  for (let i = 0; i < lines.length && cards.length < count; i++) {
    const line = lines[i];
    if (line.includes(':')) {
      const [term, ...rest] = line.split(':');
      if (term.length > 2 && rest.join(':').trim().length > 3) {
        cards.push({
          id: `card_${Date.now()}_${i}`,
          question: `What is the definition or role of ${term.replace(/^[-*•]\s*/, '').trim()}?`,
          answer: rest.join(':').trim(),
          hint: `Concept: ${term.trim()}`,
          tag: 'Key Concept',
        });
      }
    } else if (line.includes('-') && !line.startsWith('-')) {
      const [term, ...rest] = line.split('-');
      if (term.length > 2 && rest.join('-').trim().length > 3) {
        cards.push({
          id: `card_${Date.now()}_${i}`,
          question: `Explain: ${term.trim()}`,
          answer: rest.join('-').trim(),
          hint: 'From study notes',
          tag: 'Overview',
        });
      }
    }
  }

  // If couldn't find patterned lines, create chunked Q&As
  if (cards.length === 0) {
    const paragraphs = notes.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    paragraphs.slice(0, count).forEach((para, idx) => {
      const sentences = para.split(/[.!?]\s+/);
      const first = sentences[0];
      const remainder = sentences.slice(1).join('. ');
      cards.push({
        id: `card_${Date.now()}_${idx}`,
        question: `What are the key points regarding: "${first.slice(0, 70)}..."?`,
        answer: remainder || first,
        hint: 'Review key concept',
        tag: 'Notes',
      });
    });
  }

  // Fallback default if still empty
  if (cards.length === 0) {
    cards.push(
      {
        id: `card_${Date.now()}_0`,
        question: 'What is the core subject of these notes?',
        answer: notes.slice(0, 150),
        hint: 'Main takeaway',
        tag: 'Core Concept',
      },
      {
        id: `card_${Date.now()}_1`,
        question: 'What key term or principle is highlighted here?',
        answer: 'Detailed in the study notes.',
        hint: 'Active recall',
        tag: 'Review',
      }
    );
  }

  const firstLine = lines[0] ? lines[0].replace(/^#+\s*/, '').replace(/[:\-].*$/, '').trim() : 'Study Deck';

  return {
    title: firstLine.length < 50 ? firstLine : 'Generated Study Deck',
    summary: 'Flashcards created from provided notes.',
    extractedText: notes,
    cards: cards.slice(0, count),
  };
}
