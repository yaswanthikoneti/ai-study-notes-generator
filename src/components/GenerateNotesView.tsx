import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  BookOpen,
  HelpCircle,
  Sigma,
  FileCode,
  Languages,
  CheckCircle2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { StudyNote, UploadedPdfInfo, UserPreferences } from '../types/notes';
import { SAMPLE_STUDY_MATERIALS } from '../data/demoNotes';

interface GenerateNotesViewProps {
  onNoteGenerated: (newNote: StudyNote) => void;
  selectedLanguage: 'English' | 'Telugu' | 'Hindi';
  uploadedPdf?: UploadedPdfInfo | null;
  onPdfUploaded?: (pdf: UploadedPdfInfo) => void;
  preferences?: UserPreferences;
}

export const GenerateNotesView: React.FC<GenerateNotesViewProps> = ({
  onNoteGenerated,
  selectedLanguage,
  uploadedPdf,
  onPdfUploaded,
  preferences,
}) => {
  // Input method: 'upload' | 'paste'
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('paste');

  // Input states
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(uploadedPdf?.base64 || null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(uploadedPdf?.mimeType || null);
  const [fileReading, setFileReading] = useState(false);

  // Configuration options connected to UserPreferences
  const [subject, setSubject] = useState('Operating Systems');
  const [topic, setTopic] = useState('Process Synchronization & Semaphores');
  const [noteLength, setNoteLength] = useState<'Short' | 'Medium' | 'Detailed'>(
    preferences?.defaultNoteLength || 'Medium'
  );
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Difficult'>(
    preferences?.defaultDifficulty || 'Medium'
  );
  const [purpose, setPurpose] = useState<'Quick Revision' | 'Exam Preparation' | 'Concept Understanding'>(
    preferences?.defaultPurpose || 'Exam Preparation'
  );
  const [format, setFormat] = useState<'Bullet Points' | 'Detailed Notes' | 'Exam Notes'>(
    preferences?.defaultAnswerFormat === 'Simple English'
      ? 'Bullet Points'
      : preferences?.defaultAnswerFormat === 'Detailed Explanation'
      ? 'Detailed Notes'
      : 'Exam Notes'
  );

  // Checkboxes connected to UserPreferences
  const [includeDefinitions, setIncludeDefinitions] = useState(
    preferences?.includeDefinitions !== undefined ? preferences.includeDefinitions : true
  );
  const [includeFormulas, setIncludeFormulas] = useState(
    preferences?.includeFormulas !== undefined ? preferences.includeFormulas : true
  );
  const [includeExamples, setIncludeExamples] = useState(
    preferences?.includeExamples !== undefined ? preferences.includeExamples : true
  );
  const [generateQuestions, setGenerateQuestions] = useState(
    preferences?.generateQuestions !== undefined ? preferences.generateQuestions : true
  );
  const [generateMCQs, setGenerateMCQs] = useState(true);
  const [extractKeywords, setExtractKeywords] = useState(
    preferences?.highlightKeywords !== undefined ? preferences.highlightKeywords : true
  );

  // Sync state if preferences change
  React.useEffect(() => {
    if (preferences) {
      if (preferences.defaultNoteLength) setNoteLength(preferences.defaultNoteLength);
      if (preferences.defaultDifficulty) setDifficulty(preferences.defaultDifficulty);
      if (preferences.defaultPurpose) setPurpose(preferences.defaultPurpose);
      if (preferences.defaultAnswerFormat) {
        setFormat(
          preferences.defaultAnswerFormat === 'Simple English'
            ? 'Bullet Points'
            : preferences.defaultAnswerFormat === 'Detailed Explanation'
            ? 'Detailed Notes'
            : 'Exam Notes'
        );
      }
      if (preferences.includeDefinitions !== undefined) setIncludeDefinitions(preferences.includeDefinitions);
      if (preferences.includeFormulas !== undefined) setIncludeFormulas(preferences.includeFormulas);
      if (preferences.includeExamples !== undefined) setIncludeExamples(preferences.includeExamples);
      if (preferences.generateQuestions !== undefined) setGenerateQuestions(preferences.generateQuestions);
      if (preferences.highlightKeywords !== undefined) setExtractKeywords(preferences.highlightKeywords);
    }
  }, [preferences]);

  // Status & Error
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('Initiating AI Engine...');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile: File) => {
    setErrorMsg(null);

    // Size limit: 20MB
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('Selected file is too large. Please upload files under 20MB.');
      return;
    }

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    const isText =
      selectedFile.type.startsWith('text/') ||
      selectedFile.name.endsWith('.txt') ||
      selectedFile.name.endsWith('.md') ||
      selectedFile.name.endsWith('.json');

    if (!isPdf && !isText) {
      setErrorMsg('Invalid file format. Please upload a PDF or plain text document (.txt, .md).');
      return;
    }

    setFile(selectedFile);
    setFileReading(true);

    const reader = new FileReader();

    if (isPdf) {
      // PDF: convert to base64 for Gemini multimodal input
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setFileBase64(base64Data);
        setFileMimeType('application/pdf');
        setFileReading(false);

        if (onPdfUploaded) {
          onPdfUploaded({
            name: selectedFile.name,
            base64: base64Data,
            mimeType: 'application/pdf',
            sizeBytes: selectedFile.size,
          });
        }

        // Pre-fill subject / topic based on filename if empty
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!topic || topic === 'Process Synchronization & Semaphores') {
          setTopic(cleanName);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Failed to read the PDF file. Please try again.');
        setFileReading(false);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // Plain text: read as text directly
      reader.onload = () => {
        const textContent = reader.result as string;
        setPastedText(textContent);
        setFileBase64(null);
        setFileMimeType(null);
        setFileReading(false);
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!topic || topic === 'Process Synchronization & Semaphores') {
          setTopic(cleanName);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Failed to read the text file.');
        setFileReading(false);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  // Quick preset loaders
  const loadPresetMaterial = (presetIndex: number) => {
    const preset = SAMPLE_STUDY_MATERIALS[presetIndex];
    if (!preset) return;
    setSubject(preset.subject);
    setTopic(preset.topic);
    setPastedText(preset.content);
    setInputMethod('paste');
    setFile(null);
    setFileBase64(null);
    setErrorMsg(null);
  };

  // Submit and call Server-side Gemini API
  const handleGenerate = async () => {
    setErrorMsg(null);

    // Validation
    if (inputMethod === 'paste' && !pastedText.trim()) {
      setErrorMsg('Please paste your study material or select a sample preset below.');
      return;
    }
    if (inputMethod === 'upload' && !file && !pastedText) {
      setErrorMsg('Please select or drop a valid PDF or text document to continue.');
      return;
    }
    if (!subject.trim() || !topic.trim()) {
      setErrorMsg('Please specify both the Subject and Topic for accurate exam indexing.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing study material with Gemini AI...');

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          material: pastedText.trim(),
          fileBase64,
          fileMimeType,
          subject,
          topic,
          length: noteLength,
          difficulty,
          purpose,
          format,
          language: selectedLanguage,
          options: {
            includeDefinitions,
            includeFormulas,
            includeExamples,
            generateQuestions,
            generateMCQs,
            extractKeywords,
          },
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      // Handle Server-Sent Events stream for real-time retry and progress feedback
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === 'status') {
                setGenerationStep(event.message);
              } else if (event.type === 'retry') {
                // Requirement 7: Show friendly message while retrying
                setGenerationStep('Gemini is temporarily busy. Retrying...');
              } else if (event.type === 'done') {
                data = event.data;
              } else if (event.type === 'error') {
                throw new Error(event.message || 'The AI service is temporarily busy. Please try again in a moment.');
              }
            } catch (pErr: any) {
              if (pErr.message?.includes('AI service') || pErr.message?.includes('temporarily busy')) {
                throw pErr;
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'The AI service is temporarily busy. Please try again in a moment.');
        }
        data = await response.json();
      }

      if (!data) {
        throw new Error('The AI service is temporarily busy. Please try again in a moment.');
      }

      // Assemble final StudyNote
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: data.title || `${topic} - Exam Notes`,
        subject,
        topic,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        createdAt: Date.now(),
        noteLength,
        difficulty,
        purpose,
        format,
        language: selectedLanguage,
        overview: data.overview || 'Overview of the study material.',
        topics: data.topics || [topic],
        keyConcepts: data.keyConcepts || [],
        importantPoints: data.importantPoints || [],
        definitions: data.definitions || [],
        formulas: data.formulas || [],
        examples: data.examples || [],
        keywords: data.keywords || [],
        importantQuestions: data.importantQuestions || [],
        mcqs: data.mcqs || [],
        rawMaterialPreview:
          pastedText ? pastedText.slice(0, 300) : file ? `Uploaded: ${file.name}` : undefined,
        isFavorite: false,
      };

      onNoteGenerated(newNote);
    } catch (err: any) {
      console.error('Note generation error:', err);
      // Requirements 8 & 9: Friendly message, do NOT expose raw JSON API error
      const raw = (err.message || '').toLowerCase();
      if (
        raw.includes('503') ||
        raw.includes('unavailable') ||
        raw.includes('high demand') ||
        raw.includes('resource_exhausted') ||
        raw.includes('429') ||
        raw.includes('temporarily') ||
        raw.includes('busy') ||
        raw.includes('{') ||
        raw.includes('json')
      ) {
        setErrorMsg('The AI service is temporarily busy. Please try again in a moment.');
      } else {
        setErrorMsg(err.message || 'The AI service is temporarily busy. Please try again in a moment.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/60">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gemini 3.8 Academic Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Generate Study Notes
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Provide your syllabus notes, textbook excerpts, or lecture slides. Gemini will remove repetition, extract formulas, and generate exam-focused notes.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Unable to generate notes</p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Input Method Switcher */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            1. Provide Study Material
          </span>
          <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-900 text-xs font-medium">
            <button
              type="button"
              onClick={() => setInputMethod('paste')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                inputMethod === 'paste'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                inputMethod === 'upload'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Upload Document (PDF / TXT)
            </button>
          </div>
        </div>

        {/* Method 1: Paste Text */}
        {inputMethod === 'paste' ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your lecture notes, textbook paragraphs, topic syllabus, or chapter summary here..."
                rows={7}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans resize-y"
              />
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Sample Material Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Quick Test Samples:
              </span>
              {SAMPLE_STUDY_MATERIALS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPresetMaterial(idx)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  {sample.subject}: {sample.topic.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Method 2: Upload Document */
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.md"
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/30 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {file ? file.name : 'Click to upload or drag & drop lecture file'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports PDF (.pdf) and Plain Text (.txt, .md) up to 20MB
              </p>
              {file && (
                <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Ready: {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                  </span>
                </div>
              )}
            </div>

            {file && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileBase64(null);
                    setFileMimeType(null);
                  }}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Configuration Form (Requested parameters) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          2. Academic Settings & Parameters
        </h3>

        {/* Subject & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Operating Systems, DBMS, Machine Learning"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Topic / Chapter
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Process Synchronization & Banker's Algorithm"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Selectors: Note Length, Difficulty, Purpose, Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Note Length */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Note Length
            </label>
            <select
              value={noteLength}
              onChange={(e) => setNoteLength(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Short">Short (High-yield summary)</option>
              <option value="Medium">Medium (Balanced)</option>
              <option value="Detailed">Detailed (Comprehensive)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Easy">Easy (Fundamental)</option>
              <option value="Medium">Medium (University Standard)</option>
              <option value="Difficult">Difficult (Gate / Advanced)</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Exam Preparation">Exam Preparation</option>
              <option value="Quick Revision">Quick Revision</option>
              <option value="Concept Understanding">Concept Understanding</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Exam Notes">Exam Notes (Structured)</option>
              <option value="Bullet Points">Bullet Points (Pithy)</option>
              <option value="Detailed Notes">Detailed Notes</option>
            </select>
          </div>
        </div>

        {/* Checkboxes (Requested Checkboxes) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
            Content Modules & Inclusions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={includeDefinitions}
                onChange={(e) => setIncludeDefinitions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Include Definitions</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={includeFormulas}
                onChange={(e) => setIncludeFormulas(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Include Formulas</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Include Examples</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={generateQuestions}
                onChange={(e) => setGenerateQuestions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Generate Questions (2/5/10M)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={generateMCQs}
                onChange={(e) => setGenerateMCQs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Generate MCQs</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={extractKeywords}
                onChange={(e) => setExtractKeywords(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Extract Keywords</span>
            </label>
          </div>
        </div>

        {/* Generate Button & Progress */}
        <div className="pt-2">
          {isGenerating ? (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>{generationStep}</span>
                </div>
                <span>Target: {selectedLanguage}</span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={fileReading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Notes with AI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
