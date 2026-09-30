import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  FileText,
  Sparkles,
  PenTool,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Loader2,
  Layers
} from 'lucide-react';
import { AddMode, DifficultyLevel, GeneratedDeckDraft } from '../../types';
import {
  generateDeckWithAI,
  generateLocalFallbackCards,
  enhanceCardWithAI,
  SAMPLE_PRESETS,
} from '../../services/aiService';
import { dbService } from '../../services/db';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deckId: string) => void;
}

export const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  // Steps: 'select_mode' -> 'input' -> 'edit_preview'
  const [currentStep, setCurrentStep] = useState<'select_mode' | 'input' | 'edit_preview'>('select_mode');
  const [mode, setMode] = useState<AddMode>('photo');

  // Input states
  const [notesText, setNotesText] = useState('');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Preview State
  const [deckDraft, setDeckDraft] = useState<GeneratedDeckDraft>({
    title: '',
    summary: '',
    extractedText: '',
    cards: [],
  });
  const [deckTags, setDeckTags] = useState<string>('Study');
  const [deckColor, setDeckColor] = useState<string>('indigo');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [enhancingCardId, setEnhancingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentStep('select_mode');
    setNotesText('');
    setTopicPrompt('');
    setImageDataUrl(null);
    setImageFileName('');
    setErrorMessage(null);
    setIsGenerating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectMode = (selected: AddMode) => {
    setMode(selected);
    setErrorMessage(null);

    if (selected === 'manual') {
      // Direct to edit preview with empty template cards
      setDeckDraft({
        title: 'New Flashcard Deck',
        summary: 'Created manually',
        cards: [
          {
            id: `card_${Date.now()}_1`,
            question: '',
            answer: '',
            hint: '',
            tag: '',
          },
          {
            id: `card_${Date.now()}_2`,
            question: '',
            answer: '',
            hint: '',
            tag: '',
          },
        ],
      });
      setCurrentStep('edit_preview');
    } else {
      setCurrentStep('input');
    }
  };

  // Image upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setImageFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger sample preset
  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    if (mode === 'notes') {
      setNotesText(preset.notes);
      setTopicPrompt(preset.title);
    } else if (mode === 'photo') {
      setNotesText(preset.notes);
      setTopicPrompt(preset.title);
    }
  };

  // Trigger AI generation
  const handleGenerate = async () => {
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      if (mode === 'photo') {
        if (!imageDataUrl && !notesText) {
          throw new Error('Please select an image of your notes or use sample notes.');
        }

        setGenerationStage('Reading notes with Gemini OCR...');
        await new Promise((r) => setTimeout(r, 600));

        setGenerationStage('Synthesizing question-answer flashcards...');
        let draft: GeneratedDeckDraft;

        if (imageDataUrl) {
          draft = await generateDeckWithAI({
            mode: 'photo',
            image: {
              data: imageDataUrl,
              mimeType: 'image/jpeg',
            },
            notes: notesText || undefined,
            difficulty,
            count: cardCount,
            titleHint: topicPrompt || undefined,
          });
        } else {
          // If using notes test fallback
          draft = await generateDeckWithAI({
            mode: 'notes',
            notes: notesText,
            difficulty,
            count: cardCount,
            titleHint: topicPrompt || undefined,
          });
        }

        setDeckDraft(draft);
        setCurrentStep('edit_preview');
      } else if (mode === 'notes') {
        if (!notesText.trim()) {
          throw new Error('Please paste or type your notes.');
        }

        setGenerationStage('Extracting key concepts & definitions...');
        const draft = await generateDeckWithAI({
          mode: 'notes',
          notes: notesText,
          difficulty,
          count: cardCount,
          titleHint: topicPrompt || undefined,
        });

        setDeckDraft(draft);
        setCurrentStep('edit_preview');
      } else if (mode === 'topic') {
        if (!topicPrompt.trim()) {
          throw new Error('Please enter a study topic or concept.');
        }

        setGenerationStage(`Generating ${difficulty}-level flashcards for "${topicPrompt}"...`);
        const draft = await generateDeckWithAI({
          mode: 'topic',
          notes: `Generate flashcards for the academic topic: ${topicPrompt}`,
          difficulty,
          count: cardCount,
          titleHint: topicPrompt,
        });

        setDeckDraft(draft);
        setCurrentStep('edit_preview');
      }
    } catch (err: any) {
      console.warn('AI Generation warning:', err);
      // If server error, offer local fallback if text is present
      if (notesText && notesText.length > 20) {
        const localDraft = generateLocalFallbackCards(notesText, cardCount);
        setDeckDraft(localDraft);
        setErrorMessage(`AI service note: ${err?.message || 'Using local note parser'}. You can review and edit below.`);
        setCurrentStep('edit_preview');
      } else {
        setErrorMessage(err?.message || 'Could not generate cards. Please check your input or connection.');
      }
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Card editing handlers in Preview
  const handleUpdateCard = (cardId: string, field: 'question' | 'answer' | 'hint', value: string) => {
    setDeckDraft((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)),
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    setDeckDraft((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleAddNewCard = () => {
    const newCard = {
      id: `card_${Date.now()}_${deckDraft.cards.length + 1}`,
      question: '',
      answer: '',
      hint: '',
      tag: '',
    };
    setDeckDraft((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
  };

  // AI Enhance Card
  const handleEnhanceCard = async (cardId: string, action: 'shorten' | 'mnemonic' | 'clarify') => {
    const target = deckDraft.cards.find((c) => c.id === cardId);
    if (!target || !target.question || !target.answer) return;

    setEnhancingCardId(cardId);
    try {
      const enhanced = await enhanceCardWithAI(target.question, target.answer, action);
      setDeckDraft((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                question: enhanced.question || c.question,
                answer: enhanced.answer || c.answer,
                hint: enhanced.hint || c.hint,
              }
            : c
        ),
      }));
    } catch (e: any) {
      alert(e?.message || 'Could not enhance card');
    } finally {
      setEnhancingCardId(null);
    }
  };

  // Save Deck to IndexedDB Local Database
  const handleSaveDeck = async () => {
    if (!deckDraft.title.trim()) {
      alert('Please enter a title for your deck.');
      return;
    }

    const validCards = deckDraft.cards.filter((c) => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) {
      alert('Please ensure you have at least one valid card with both a question and answer.');
      return;
    }

    setIsSaving(true);
    try {
      const tags = deckTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const savedDeckId = await dbService.saveDeckWithCards(
        {
          title: deckDraft.title.trim(),
          description: deckDraft.summary || `Contains ${validCards.length} flashcards`,
          color: deckColor,
          tags: tags.length > 0 ? tags : ['Study'],
        },
        validCards
      );

      handleClose();
      onDeckCreated(savedDeckId);
    } catch (err: any) {
      console.error('Error saving deck:', err);
      alert('Failed to save deck: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep !== 'select_mode' && (
              <button
                onClick={() => {
                  if (currentStep === 'edit_preview') {
                    if (mode === 'manual') setCurrentStep('select_mode');
                    else setCurrentStep('input');
                  } else {
                    setCurrentStep('select_mode');
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentStep === 'select_mode' && 'Create Flashcards'}
                {currentStep === 'input' && (
                  <>
                    {mode === 'photo' && 'Upload Photo & Scan'}
                    {mode === 'notes' && 'Paste Study Notes'}
                    {mode === 'topic' && 'Generate with AI'}
                  </>
                )}
                {currentStep === 'edit_preview' && 'Review & Edit Deck'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep === 'select_mode' && 'Choose how you want to create your flashcards'}
                {currentStep === 'input' && 'Configure options and generate active-recall cards'}
                {currentStep === 'edit_preview' && 'Customize cards before saving locally'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: SELECT MODE */}
          {currentStep === 'select_mode' && (
            <div className="space-y-4">
              {/* Option 1: Upload Photo (Prominent / Highlighted) */}
              <button
                onClick={() => handleSelectMode('photo')}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/30 border-2 border-indigo-500/30 hover:border-indigo-500 transition-all hover:shadow-md flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      Upload Photo
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                      OCR Vision
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Snap or upload handwritten notes, whiteboard diagrams, or book pages. AI extracts text and builds cards.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>

              {/* Option 2: Paste / Type Notes */}
              <button
                onClick={() => handleSelectMode('notes')}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all hover:shadow-sm flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    Paste / Type Notes
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Paste lecture transcripts, textbook passages, or bullet points to extract definitions and questions.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>

              {/* Option 3: Generate with AI (Topic prompt) */}
              <button
                onClick={() => handleSelectMode('topic')}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all hover:shadow-sm flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    Generate with AI
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Provide any academic topic or curriculum subject and AI generates structured study flashcards.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>

              {/* Option 4: Create Manually */}
              <button
                onClick={() => handleSelectMode('manual')}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all hover:shadow-sm flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    Create Manually
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Add custom questions, answers, and hints one by one at your own pace.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </div>
          )}

          {/* STEP 2: INPUT & CONFIGURATION */}
          {currentStep === 'input' && (
            <div className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* MODE SPECIFIC INPUT */}

              {/* 1. PHOTO OCR INPUT */}
              {mode === 'photo' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {!imageDataUrl ? (
                    <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 text-center bg-indigo-50/40 dark:bg-indigo-950/20">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        Select or capture a photo of your notes
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Works great with handwritten notebook pages, textbook paragraphs, lecture slides, or whiteboards.
                      </p>

                      <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Take Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          Browse Files
                        </button>
                      </div>

                      {/* Instant Presets for Testing */}
                      <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-indigo-950">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                          Or test with sample handwritten notes:
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {SAMPLE_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleApplyPreset(preset)}
                              className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium transition-colors cursor-pointer"
                            >
                              💡 {preset.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Image preview */
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-4">
                      <img
                        src={imageDataUrl}
                        alt="Uploaded notes preview"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {imageFileName || 'Selected note photo'}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready for OCR transcription
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                          >
                            Replace Photo
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageDataUrl(null);
                              setImageFileName('');
                            }}
                            className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Subject Hint */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject or Topic Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={topicPrompt}
                      onChange={(e) => setTopicPrompt(e.target.value)}
                      placeholder="e.g. AP Biology Photosynthesis, Organic Chemistry..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {/* 2. PASTE NOTES INPUT */}
              {mode === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Paste or Type Notes
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {notesText.trim() ? `${notesText.trim().split(/\s+/).length} words` : '0 words'}
                    </span>
                  </div>

                  <textarea
                    rows={7}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Paste lecture notes, textbook summaries, definitions, or bullet points here..."
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Try sample notes:</span>
                    {SAMPLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. GENERATE WITH AI TOPIC */}
              {mode === 'topic' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    What topic would you like to study?
                  </label>
                  <input
                    type="text"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    placeholder="e.g. World War II Turning Points, JavaScript Promises, Cell Mitosis..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">Popular topics:</span>
                    {['Cell Division', 'Python Data Structures', 'French Revolution', 'Cognitive Biases'].map(
                      (suggested) => (
                        <button
                          key={suggested}
                          type="button"
                          onClick={() => setTopicPrompt(suggested)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                        >
                          {suggested}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* CONFIGURATION CONTROLS: CARD COUNT & DIFFICULTY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                {/* Number of Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Number of Cards
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 5, 8, 10, 15].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCardCount(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cardCount === num
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Difficulty Level
                  </label>
                  <div className="flex items-center gap-2">
                    {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          difficulty === level
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('select_mode')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{generationStage || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Flashcards</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EDIT PREVIEW SCREEN */}
          {currentStep === 'edit_preview' && (
            <div className="space-y-6">
              {/* Deck Metadata Header Inputs */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    value={deckDraft.title}
                    onChange={(e) => setDeckDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Cellular Biology & Glycolysis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={deckTags}
                      onChange={(e) => setDeckTags(e.target.value)}
                      placeholder="Biology, Science, Exam"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deck Color Accent
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[
                        { name: 'indigo', bg: 'bg-indigo-600' },
                        { name: 'emerald', bg: 'bg-emerald-600' },
                        { name: 'amber', bg: 'bg-amber-500' },
                        { name: 'rose', bg: 'bg-rose-500' },
                        { name: 'purple', bg: 'bg-purple-600' },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setDeckColor(c.name)}
                          className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer ${
                            deckColor === c.name ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collapsible Extracted OCR Text (if available) */}
                {deckDraft.extractedText && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowExtractedText(!showExtractedText)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <span>📄 View Extracted OCR Text</span>
                      {showExtractedText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showExtractedText && (
                      <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono border border-slate-200 dark:border-slate-700 leading-relaxed">
                        {deckDraft.extractedText}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cards List Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Flashcards ({deckDraft.cards.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Card
                </button>
              </div>

              {/* Cards List */}
              <div className="space-y-4">
                {deckDraft.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Card #{index + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Quick AI helpers */}
                        <button
                          type="button"
                          onClick={() => handleEnhanceCard(card.id, 'shorten')}
                          disabled={enhancingCardId === card.id}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                          title="Shorten answer with AI"
                        >
                          Shorten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEnhanceCard(card.id, 'mnemonic')}
                          disabled={enhancingCardId === card.id}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                          title="Add mnemonic anchor"
                        >
                          + Mnemonic
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1 cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        Question (Front)
                      </label>
                      <textarea
                        rows={2}
                        value={card.question}
                        onChange={(e) => handleUpdateCard(card.id, 'question', e.target.value)}
                        placeholder="Enter the active-recall question..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Answer Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        Answer (Back)
                      </label>
                      <textarea
                        rows={2}
                        value={card.answer}
                        onChange={(e) => handleUpdateCard(card.id, 'answer', e.target.value)}
                        placeholder="Enter concise, accurate answer..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Hint Input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        Memory Hint (Optional)
                      </label>
                      <input
                        type="text"
                        value={card.hint || ''}
                        onChange={(e) => handleUpdateCard(card.id, 'hint', e.target.value)}
                        placeholder="Optional recall hint or acronym..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Card at bottom */}
              <button
                type="button"
                onClick={handleAddNewCard}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Another Flashcard
              </button>

              {/* Action Buttons: Save Deck */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 py-3 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setCurrentStep('input')}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back to Settings
                </button>

                <button
                  type="button"
                  onClick={handleSaveDeck}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Device...' : `Save Deck (${deckDraft.cards.length} Cards)`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
