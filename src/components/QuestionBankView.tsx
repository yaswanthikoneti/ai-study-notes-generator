import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Layers,
  GraduationCap,
  BookOpen,
  Copy,
  Check,
  Download,
  UploadCloud,
  FileText,
  RotateCcw,
  Eye,
  EyeOff,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { StudyNote, QuestionItem, MCQItem, UploadedPdfInfo, UserPreferences } from '../types/notes';
import { jsPDF } from 'jspdf';

interface QuestionBankViewProps {
  savedNotes: StudyNote[];
  activeNote: StudyNote | null;
  uploadedPdf: UploadedPdfInfo | null;
  onPdfUploaded: (pdf: UploadedPdfInfo) => void;
  onOpenExamMode: (note: StudyNote, question?: string, marks?: number) => void;
  selectedLanguage: 'English' | 'Telugu' | 'Hindi';
  preferences?: UserPreferences;
}

interface CategorizedBanks {
  '2-mark': QuestionItem[];
  '5-mark': QuestionItem[];
  '10-mark': QuestionItem[];
  'mcq': MCQItem[];
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  savedNotes,
  activeNote,
  uploadedPdf,
  onPdfUploaded,
  onOpenExamMode,
  selectedLanguage,
  preferences,
}) => {
  // Category tab: '2-mark' | '5-mark' | '10-mark' | 'mcq' (Default: preferences.defaultQuestionType or '2-mark')
  const [selectedCategory, setSelectedCategory] = useState<'2-mark' | '5-mark' | '10-mark' | 'mcq'>(
    preferences?.defaultQuestionType || '2-mark'
  );

  // Question count selector: 5, 10, 15, 20 (Requirement 12: default from preferences or 15)
  const [questionCount, setQuestionCount] = useState<number>(
    preferences?.defaultQuestionCount || 15
  );

  // Difficulty filter: All, Easy, Medium, Difficult
  const [filterDifficulty, setFilterDifficulty] = useState<string>(
    preferences?.defaultDifficulty || 'All'
  );

  // Sync with preferences when changed in Settings
  useEffect(() => {
    if (preferences) {
      if (preferences.defaultQuestionType) setSelectedCategory(preferences.defaultQuestionType);
      if (preferences.defaultQuestionCount) setQuestionCount(preferences.defaultQuestionCount);
      if (preferences.defaultDifficulty) setFilterDifficulty(preferences.defaultDifficulty);
    }
  }, [preferences]);

  // Show / Hide answers state
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(true);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // Copy status feedback: track id of copied item
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local storage persistence for separate question banks (Requirement 13 & 14)
  const [banks, setBanks] = useState<CategorizedBanks>(() => {
    try {
      const stored = localStorage.getItem('ai_study_categorized_qb');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            '2-mark': Array.isArray(parsed['2-mark']) ? parsed['2-mark'] : [],
            '5-mark': Array.isArray(parsed['5-mark']) ? parsed['5-mark'] : [],
            '10-mark': Array.isArray(parsed['10-mark']) ? parsed['10-mark'] : [],
            'mcq': Array.isArray(parsed['mcq']) ? parsed['mcq'] : [],
          };
        }
      }
    } catch (e) {
      console.error('Failed to load saved question banks:', e);
    }

    // Default initial seed from savedNotes or activeNote
    const initial2M: QuestionItem[] = [];
    const initial5M: QuestionItem[] = [];
    const initial10M: QuestionItem[] = [];
    const initialMCQs: MCQItem[] = [];

    savedNotes.forEach((n) => {
      n.importantQuestions?.forEach((q) => {
        if (q.marks === 2) initial2M.push(q);
        else if (q.marks === 5) initial5M.push(q);
        else if (q.marks === 10) initial10M.push(q);
      });
      n.mcqs?.forEach((m) => initialMCQs.push(m));
    });

    return {
      '2-mark': initial2M,
      '5-mark': initial5M,
      '10-mark': initial10M,
      'mcq': initialMCQs,
    };
  });

  // Persist question banks whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai_study_categorized_qb', JSON.stringify(banks));
    } catch (e) {
      console.error('Failed to persist question banks:', e);
    }
  }, [banks]);

  // File upload input ref for Question Bank
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle direct PDF upload in Question Bank
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      onPdfUploaded({
        name: file.name,
        base64: base64Data,
        mimeType: 'application/pdf',
        sizeBytes: file.size,
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read uploaded PDF file.');
    };
    reader.readAsDataURL(file);
  };

  // Determine current active source material name
  const currentSourceName = uploadedPdf
    ? uploadedPdf.name
    : activeNote
    ? `${activeNote.subject}: ${activeNote.topic}`
    : null;

  // Toggle individual question expansion
  const toggleAnswer = (id: string) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !showAllAnswers,
    }));
  };

  // Toggle all answers
  const handleToggleAllAnswers = () => {
    const nextState = !showAllAnswers;
    setShowAllAnswers(nextState);
    const resetMap: Record<string, boolean> = {};
    const currentList = banks[selectedCategory] || [];
    currentList.forEach((item: any) => {
      resetMap[item.id] = nextState;
    });
    setExpandedAnswers(resetMap);
  };

  // Copy Question text
  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  // Copy Answer text
  const handleCopyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswerId(id);
    setTimeout(() => setCopiedAnswerId(null), 2000);
  };

  // Download Question Bank as PDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 40;

    const checkPageBreak = (needed: number) => {
      if (cursorY + needed > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
    };

    // Header Title
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, cursorY, contentWidth, 48, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    const categoryTitle =
      selectedCategory === '2-mark'
        ? '2-MARK UNIVERSITY QUESTIONS & ANSWERS'
        : selectedCategory === '5-mark'
        ? '5-MARK UNIVERSITY QUESTIONS & ANSWERS'
        : selectedCategory === '10-mark'
        ? '10-MARK UNIVERSITY ESSAY QUESTIONS'
        : 'PRACTICE MULTIPLE CHOICE QUESTIONS (MCQs)';
    doc.text(categoryTitle, margin + 12, cursorY + 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Source: ${currentSourceName || 'CSE Curriculum'}  |  Questions: ${
        banks[selectedCategory]?.length || 0
      }  |  Language: ${selectedLanguage}`,
      margin + 12,
      cursorY + 38
    );
    cursorY += 60;

    if (selectedCategory === 'mcq') {
      const mcqs = banks['mcq'] || [];
      mcqs.forEach((mcq, idx) => {
        checkPageBreak(50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        const qLines = doc.splitTextToSize(`Q${idx + 1}. ${mcq.question}`, contentWidth);
        doc.text(qLines, margin, cursorY);
        cursorY += qLines.length * 12 + 4;

        mcq.options.forEach((opt, optIdx) => {
          checkPageBreak(18);
          doc.setFontSize(9);
          doc.setFont('helvetica', optIdx === mcq.correctIndex ? 'bold' : 'normal');
          doc.setTextColor(optIdx === mcq.correctIndex ? 30 : 75, optIdx === mcq.correctIndex ? 64 : 85, optIdx === mcq.correctIndex ? 175 : 99);
          doc.text(`[${String.fromCharCode(65 + optIdx)}] ${opt}`, margin + 12, cursorY);
          cursorY += 12;
        });

        checkPageBreak(25);
        doc.setFontSize(8.5);
        doc.setTextColor(55, 65, 81);
        const expLines = doc.splitTextToSize(`Explanation: ${mcq.explanation}`, contentWidth - 12);
        doc.text(expLines, margin + 12, cursorY);
        cursorY += expLines.length * 11 + 14;
      });
    } else {
      const qList = (banks[selectedCategory] as QuestionItem[]) || [];
      qList.forEach((q, idx) => {
        checkPageBreak(60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        const qLines = doc.splitTextToSize(`Q${idx + 1} [${q.marks} Marks]: ${q.question}`, contentWidth);
        doc.text(qLines, margin, cursorY);
        cursorY += qLines.length * 12 + 4;

        checkPageBreak(40);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const ansLines = doc.splitTextToSize(`Answer: ${q.modelAnswer}`, contentWidth - 12);
        doc.text(ansLines, margin + 12, cursorY);
        cursorY += ansLines.length * 11 + 12;
      });
    }

    doc.save(`${(currentSourceName || 'Question_Bank').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedCategory}.pdf`);
  };

  // Download Question Bank as TXT
  const handleDownloadTxt = () => {
    let content = `========================================================================\n`;
    content += `QUESTION BANK: ${selectedCategory.toUpperCase()}\n`;
    content += `Source Material: ${currentSourceName || 'Study Material'}\n`;
    content += `Language: ${selectedLanguage} | Total Questions: ${banks[selectedCategory]?.length || 0}\n`;
    content += `========================================================================\n\n`;

    if (selectedCategory === 'mcq') {
      const mcqs = banks['mcq'] || [];
      mcqs.forEach((mcq, idx) => {
        content += `MCQ ${idx + 1}: ${mcq.question}\n`;
        mcq.options.forEach((opt, optIdx) => {
          content += `  [${String.fromCharCode(65 + optIdx)}] ${opt}\n`;
        });
        content += `Correct Answer: [${String.fromCharCode(65 + mcq.correctIndex)}] ${mcq.options[mcq.correctIndex]}\n`;
        content += `Explanation: ${mcq.explanation}\n\n`;
      });
    } else {
      const qList = (banks[selectedCategory] as QuestionItem[]) || [];
      qList.forEach((q, idx) => {
        content += `Q${idx + 1} [${q.marks} Marks]: ${q.question}\n`;
        content += `Answer:\n${q.modelAnswer}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentSourceName || 'Question_Bank').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedCategory}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Main Generator Function: Generate questions strictly based on uploaded PDF
  const handleGenerateQuestions = async () => {
    setErrorMessage(null);

    // REQUIREMENT 16: If no PDF/text has been uploaded, show warning
    if (!uploadedPdf && !activeNote?.rawMaterialPreview && !activeNote?.overview) {
      setErrorMessage('Please upload study material before generating questions.');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage(`Extracting PDF content & generating ${questionCount} questions with Gemini...`);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeNote?.topic || uploadedPdf?.name.replace(/\.[^/.]+$/, '') || 'Computer Science Study Unit',
          notesContext: activeNote?.overview || '',
          fileBase64: uploadedPdf?.base64,
          fileMimeType: uploadedPdf?.mimeType,
          targetCategory: selectedCategory,
          count: questionCount,
          difficulty: filterDifficulty,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'The AI service is temporarily busy. Please try again in a moment.');
      }

      const data = await response.json();

      // REQUIREMENT 10, 13 & 14: Save separately and display immediately
      if (selectedCategory === 'mcq') {
        const newMcqs: MCQItem[] = (data.mcqs || []).map((m: any, idx: number) => ({
          id: m.id || `mcq_${Date.now()}_${idx}`,
          question: m.question,
          options: m.options || [],
          correctIndex: Number(m.correctIndex) || 0,
          explanation: m.explanation || '',
        }));

        setBanks((prev) => ({
          ...prev,
          mcq: newMcqs.length > 0 ? newMcqs : prev.mcq,
        }));
      } else {
        const expectedMarks = selectedCategory === '2-mark' ? 2 : selectedCategory === '5-mark' ? 5 : 10;
        const newQuestions: QuestionItem[] = (data.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q_${Date.now()}_${idx}`,
          type: selectedCategory,
          marks: expectedMarks,
          question: q.question,
          modelAnswer: q.modelAnswer || '',
          keyPoints: q.keyPoints || [],
          difficulty: q.difficulty || 'Medium',
        }));

        setBanks((prev) => ({
          ...prev,
          [selectedCategory]: newQuestions.length > 0 ? newQuestions : prev[selectedCategory],
        }));
      }

      // Open all answers by default for convenience
      setShowAllAnswers(true);
    } catch (err: any) {
      console.error('Question generation failed:', err);
      // REQUIREMENT 17: friendly error message
      setErrorMessage(err.message || 'The AI service is temporarily busy. Please try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter questions based on difficulty filter
  const currentList = banks[selectedCategory] || [];
  const filteredList = currentList.filter((item: any) => {
    if (filterDifficulty === 'All') return true;
    return item.difficulty === filterDifficulty;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 font-sans">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePdfUpload}
        accept=".pdf"
        className="hidden"
      />

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/60">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>CSE Question Bank Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Question Bank
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Generate high-yield questions strictly from your uploaded PDF material, formatted to university marks schemes.
        </p>
      </div>

      {/* Source Material Indicator & Upload Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Source Material
            </span>
            {currentSourceName ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-sm">
                  {currentSourceName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Ready
                </span>
              </div>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                No study material or PDF uploaded yet
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0"
        >
          <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{uploadedPdf ? 'Change PDF' : 'Upload PDF Document'}</span>
        </button>
      </div>

      {/* Warning if no material uploaded (Requirement 16) */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{errorMessage}</p>
            {!uploadedPdf && !activeNote && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 underline"
              >
                Click here to upload your PDF now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Category Tabs (Requirement 14: 2 Marks, 5 Marks, 10 Marks, MCQs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: '2-mark', label: '2 Marks', desc: 'Direct 2–4 pts / formula' },
          { id: '5-mark', label: '5 Marks', desc: 'Explanation & example' },
          { id: '10-mark', label: '10 Marks', desc: 'Full architecture & flow' },
          { id: 'mcq', label: 'MCQs', desc: '4 options & explanation' },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const countInBank = banks[tab.id as keyof CategorizedBanks]?.length || 0;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id as any);
                setErrorMessage(null);
                // When 2 Marks is selected, default count to 15 (Requirement 4)
                if (tab.id === '2-mark' && questionCount !== 15) {
                  setQuestionCount(15);
                }
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.01]'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {countInBank}
                </span>
              </div>
              <span className={`text-[11px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generator Control Card (Count selector, Difficulty, Generate button) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Question Count Selector (Requirement 12: 5, 10, 15, 20) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Question Count:
            </span>
            <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    questionCount === num
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500 font-semibold">Filter Difficulty:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Difficult">Difficult</option>
            </select>
          </div>

          {/* Generate Button (Requirement 11: Generate Again) */}
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {questionCount} Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {currentList.length > 0 ? 'Generate Again' : `Generate ${questionCount} Questions`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Real-time generation feedback */}
        {isGenerating && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center space-x-2 text-xs font-semibold text-indigo-800 dark:text-indigo-200">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{generationMessage || 'Generating questions from uploaded PDF...'}</span>
          </div>
        )}
      </div>

      {/* Action Controls Bar (Requirement 11: Show/Hide Answers, Download as PDF, Download as TXT) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {selectedCategory === '2-mark'
              ? '2-Mark Questions'
              : selectedCategory === '5-mark'
              ? '5-Mark Questions'
              : selectedCategory === '10-mark'
              ? '10-Mark Questions'
              : 'MCQs'}{' '}
            ({filteredList.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Show / Hide All Answers */}
          <button
            onClick={handleToggleAllAnswers}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAllAnswers ? 'Hide Answers' : 'Show Answers'}</span>
          </button>

          {/* Download as PDF (Requirement 11) */}
          <button
            onClick={handleDownloadPdf}
            disabled={filteredList.length === 0}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-indigo-200 dark:border-indigo-800 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Download as TXT (Requirement 11) */}
          <button
            onClick={handleDownloadTxt}
            disabled={filteredList.length === 0}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TXT</span>
          </button>
        </div>
      </div>

      {/* Questions Display List (Requirement 10 & 15: displayed immediately with short 2-mark answers) */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
          <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No {selectedCategory} questions in this bank yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {uploadedPdf
              ? `Click 'Generate ${questionCount} Questions' above to extract questions from ${uploadedPdf.name}.`
              : 'Upload a study PDF or select an existing note to generate exam questions.'}
          </p>
          <button
            onClick={() => {
              if (!uploadedPdf && !activeNote) {
                fileInputRef.current?.click();
              } else {
                handleGenerateQuestions();
              }
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            {!uploadedPdf && !activeNote ? 'Upload PDF Document' : `Generate ${questionCount} Questions`}
          </button>
        </div>
      ) : selectedCategory === 'mcq' ? (
        /* MCQs list */
        <div className="space-y-4">
          {(filteredList as MCQItem[]).map((mcq, idx) => (
            <div
              key={mcq.id || idx}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {idx + 1}. {mcq.question}
                </span>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyQuestion(mcq.id, mcq.question)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-500 text-xs flex items-center space-x-1"
                    title="Copy Question"
                  >
                    {copiedQuestionId === mcq.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mcq.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === mcq.correctIndex;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {showAllAnswers && (
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-xs text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="font-bold">Correct Option ({String.fromCharCode(65 + mcq.correctIndex)}): </span>
                  <span>{mcq.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Descriptive Questions (2 Marks, 5 Marks, 10 Marks) */
        <div className="space-y-4">
          {(filteredList as QuestionItem[]).map((q, idx) => {
            const isAnswerOpen = expandedAnswers[q.id] !== undefined ? expandedAnswers[q.id] : showAllAnswers;

            return (
              <div
                key={q.id || idx}
                className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs space-y-3 transition-all"
              >
                {/* Header row: Badge, Difficulty, Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        q.marks === 2
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : q.marks === 5
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {q.marks} Marks
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Question card action controls (Requirement 11) */}
                  <div className="flex items-center space-x-1.5">
                    {/* Copy Question */}
                    <button
                      onClick={() => handleCopyQuestion(q.id, q.question)}
                      className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs flex items-center space-x-1"
                      title="Copy Question"
                    >
                      {copiedQuestionId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQuestionId === q.id ? 'Copied' : 'Question'}</span>
                    </button>

                    {/* Copy Answer */}
                    <button
                      onClick={() => handleCopyAnswer(q.id, q.modelAnswer)}
                      className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs flex items-center space-x-1"
                      title="Copy Answer"
                    >
                      {copiedAnswerId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAnswerId === q.id ? 'Copied' : 'Answer'}</span>
                    </button>

                    {/* Show/Hide individual answer */}
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>{isAnswerOpen ? 'Hide' : 'Answer'}</span>
                      {isAnswerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                  Q{idx + 1}. {q.question}
                </h3>

                {/* Exam Answer Block (Requirement 5 & 9: Short, exam-friendly answer for 2 marks) */}
                {isAnswerOpen && (
                  <div className="p-4 rounded-xl bg-gray-50/90 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 space-y-2 leading-relaxed font-sans">
                    <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                      <span>Model Answer ({q.marks} Marks):</span>
                      {activeNote && (
                        <button
                          onClick={() => onOpenExamMode(activeNote, q.question, q.marks)}
                          className="text-[11px] font-semibold hover:underline flex items-center space-x-0.5"
                        >
                          <GraduationCap className="w-3 h-3" />
                          <span>Detailed Marking Scheme</span>
                        </button>
                      )}
                    </div>

                    <p className="whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200">
                      {q.modelAnswer}
                    </p>

                    {q.keyPoints && q.keyPoints.length > 0 && (
                      <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Key points:</span>
                        {q.keyPoints.map((pt, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-medium text-gray-700 dark:text-gray-300"
                          >
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
