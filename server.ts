import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Flashcard Generation Endpoint
app.post('/api/ai/generate-flashcards', async (req, res) => {
  try {
    const { mode, notes, image, difficulty = 'Medium', count = 8, titleHint } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check environment variables.',
        fallbackAvailable: true,
      });
    }

    const cardCount = Math.min(Math.max(parseInt(count) || 8, 2), 30);
    const difficultyLevel = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';

    const systemInstruction = `You are a world-class cognitive science flashcard creator using active recall and spaced repetition principles.
Rules for cards:
- Focus on high-yield core concepts, definitions, formulas, and cause-effect relationships.
- Difficulty is '${difficultyLevel}'. Tailor vocabulary and question depth accordingly (Easy = foundational terms & definitions; Medium = application & explanations; Hard = nuance, multi-step problem solving, comparison).
- Aim for exactly ${cardCount} cards.
- Questions should be clear and test one single concept at a time.
- Answers should be concise, memorable, and 1-3 sentences maximum.
- Avoid duplicates or vague questions.
- If image provided, extract all handwriting or printed text via OCR first, then generate cards.
- Suggest an engaging, accurate Deck Title.`;

    const contents: any[] = [];

    if (image && image.data) {
      // Strip data:image/...;base64, prefix if present
      let base64Data = image.data;
      let mimeType = image.mimeType || 'image/jpeg';
      if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        mimeType = parts[0].replace('data:', '') || mimeType;
        base64Data = parts[1];
      }

      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });

      contents.push({
        text: `Please perform OCR on this image of notes/study material. Extract all visible text and concepts, then generate ${cardCount} ${difficultyLevel}-level flashcards. ${
          titleHint ? `Suggested topic/context: ${titleHint}` : ''
        }`,
      });
    } else if (notes) {
      contents.push({
        text: `Based on the following study notes or topic, generate ${cardCount} ${difficultyLevel}-level flashcards:
        
"""
${notes}
"""
${titleHint ? `Deck title context: ${titleHint}` : ''}`,
      });
    } else {
      return res.status(400).json({ error: 'Please provide either notes or an image to generate flashcards.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Appropriate title for the flashcard deck',
            },
            summary: {
              type: Type.STRING,
              description: '1-sentence summary of the subject matter',
            },
            extractedText: {
              type: Type.STRING,
              description: 'OCR extracted text or summarized study notes',
            },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: 'Direct question testing active recall',
                  },
                  answer: {
                    type: Type.STRING,
                    description: 'Concise, correct answer',
                  },
                  hint: {
                    type: Type.STRING,
                    description: 'Optional quick hint or mnemonic',
                  },
                  tag: {
                    type: Type.STRING,
                    description: 'Sub-topic or keyword category',
                  },
                },
                required: ['question', 'answer'],
              },
            },
          },
          required: ['title', 'cards'],
        },
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      deck: {
        title: parsed.title || titleHint || 'Study Deck',
        summary: parsed.summary || '',
        extractedText: parsed.extractedText || '',
        cards: (parsed.cards || []).map((c: any, index: number) => ({
          id: `card_${Date.now()}_${index}`,
          question: c.question,
          answer: c.answer,
          hint: c.hint || '',
          tag: c.tag || '',
        })),
      },
    });
  } catch (error: any) {
    console.error('Error generating flashcards with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate flashcards with AI',
    });
  }
});

// Single card AI enhancement endpoint
app.post('/api/ai/enhance-card', async (req, res) => {
  try {
    const { question, answer, action } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'API key not configured' });
    }

    let instruction = 'Improve this flashcard to be more memorable and effective for active recall.';
    if (action === 'shorten') {
      instruction = 'Make the answer significantly more concise (under 20 words) while keeping essential facts.';
    } else if (action === 'mnemonic') {
      instruction = 'Add a clever mnemonic or memory anchor to help remember this easily.';
    } else if (action === 'clarify') {
      instruction = 'Clarify the question so it is unambiguous and clearly tests a single concept.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Card Question: "${question}"\nCard Answer: "${answer}"\nAction: ${instruction}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            hint: { type: Type.STRING },
          },
          required: ['question', 'answer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, card: parsed });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to enhance card' });
  }
});

// Vite server in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`FlashAI Server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
