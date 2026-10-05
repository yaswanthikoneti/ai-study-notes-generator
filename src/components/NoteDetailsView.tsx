import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Bookmark,
  Share2,
  Copy,
  Download,
  Star,
  RotateCcw,
  Edit3,
  Check,
  Sigma,
  HelpCircle,
  Award,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  GraduationCap,
  Save,
  CheckCircle2,
  XCircle,
  Languages
} from 'lucide-react';
import { StudyNote, QuestionItem, MCQItem } from '../types/notes';
import { exportNotesToPdf, exportNotesToTxt } from '../utils/exportNotes';

interface NoteDetailsViewProps {
  note: StudyNote;
  onSaveNote: (updatedNote: StudyNote) => void;
  onRegenerateNote: (note: StudyNote) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenExamMode: (note: StudyNote, question?: string, marks?: number) => void;
  onOpenChatWithNote: (note: StudyNote) => void;
}

export const NoteDetailsView: React.FC<NoteDetailsViewProps> = ({
  note,
  onSaveNote,
  onRegenerateNote,
  onToggleFavorite,
  onOpenExamMode,
  onOpenChatWithNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'points' | 'definitions' | 'formulas' | 'questions' | 'mcqs'>('all');

  // Interactive Quiz state for MCQs
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedOverview, setEditedOverview] = useState(note.overview);

  const handleCopyNote = () => {
    let fullText = `${note.title}\nSubject: ${note.subject} | Topic: ${note.topic}\n\n`;
    fullText += `Overview:\n${note.overview}\n\n`;
    fullText += `Key Concepts:\n`;
    note.keyConcepts.forEach((kc) => {
      fullText += `${kc.heading}:\n${kc.description}\n`;
      kc.points.forEach((p) => (fullText += `• ${p}\n`));
      fullText += '\n';
    });
    fullText += `Important Points:\n`;
    note.importantPoints.forEach((ip, i) => (fullText += `${i + 1}. ${ip}\n`));

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdits = () => {
    onSaveNote({
      ...note,
      title: editedTitle,
      overview: editedOverview,
    });
    setIsEditing(false);
  };

  const handleSelectMCQOption = (mcqId: string, optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [mcqId]: optIndex }));
    setShowExplanations((prev) => ({ ...prev, [mcqId]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              {note.subject}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {note.topic}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              {note.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              {note.format}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
              {note.language || 'English'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Star Favorite */}
            <button
              onClick={(e) => onToggleFavorite(note.id, e)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${
                  note.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'
                }`}
              />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyNote}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium flex items-center space-x-1 transition-colors"
              title="Copy full notes"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium flex items-center space-x-1 transition-colors"
              title="Edit Title & Overview"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDownloadDropdown(!downloadDropdown)}
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {downloadDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-20 py-1">
                  <button
                    onClick={() => {
                      exportNotesToPdf(note);
                      setDownloadDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Download as PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      exportNotesToTxt(note);
                      setDownloadDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Download as TXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Regenerate Button */}
            <button
              onClick={() => onRegenerateNote(note)}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Title & Overview (or Edit mode) */}
        {isEditing ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-500">Edit Note Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Edit Executive Overview</label>
              <textarea
                value={editedOverview}
                onChange={(e) => setEditedOverview(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {note.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {note.overview}
            </p>
          </div>
        )}

        {/* Quick Context Action Bar: Exam Mode & AI Chat */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onOpenExamMode(note)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-xs hover:scale-105 transition-all flex items-center space-x-1.5"
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>Generate 2M / 5M / 10M Answers</span>
          </button>

          <button
            onClick={() => onOpenChatWithNote(note)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat With AI Tutor (Ask Questions)</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 text-xs font-semibold no-scrollbar">
        {[
          { id: 'all', label: 'All Content' },
          { id: 'concepts', label: `Concepts (${note.keyConcepts?.length || 0})` },
          { id: 'points', label: `Important Points (${note.importantPoints?.length || 0})` },
          { id: 'definitions', label: `Definitions (${note.definitions?.length || 0})` },
          { id: 'formulas', label: `Formulas (${note.formulas?.length || 0})` },
          { id: 'questions', label: `Exam Questions (${note.importantQuestions?.length || 0})` },
          { id: 'mcqs', label: `MCQs (${note.mcqs?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Topics Outline */}
      {note.topics && note.topics.length > 0 && (activeTab === 'all' || activeTab === 'concepts') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Syllabus Breakdown & Subtopics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.topics.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Key Concepts */}
      {note.keyConcepts && note.keyConcepts.length > 0 && (activeTab === 'all' || activeTab === 'concepts') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-base">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2>Key Concepts & Technical Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {note.keyConcepts.map((kc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{kc.heading}</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {kc.description}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {kc.points.map((pt, pIdx) => (
                      <li key={pIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span className="leading-normal">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => onOpenExamMode(note, kc.heading, 5)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Generate 5M Answer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: High-Yield Important Points */}
      {note.importantPoints && note.importantPoints.length > 0 && (activeTab === 'all' || activeTab === 'points') && (
        <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2>High-Yield Exam Points (Pre-Exam Checklist)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {note.importantPoints.map((pt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-amber-200/60 dark:border-amber-900/30 text-xs text-gray-800 dark:text-gray-200 flex items-start space-x-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Definitions */}
      {note.definitions && note.definitions.length > 0 && (activeTab === 'all' || activeTab === 'definitions') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-base">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2>Core Definitions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {note.definitions.map((def, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200">
                    {def.term}
                  </h4>
                  {def.context && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-medium">
                      {def.context}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {def.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Formulas & Theorems */}
      {note.formulas && note.formulas.length > 0 && (activeTab === 'all' || activeTab === 'formulas') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold text-base">
            <Sigma className="w-5 h-5 text-purple-600" />
            <h2>Formulas & Mathematical Invariants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {note.formulas.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200">
                    {f.name}
                  </h4>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                    Equation #{idx + 1}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 font-mono text-xs text-indigo-700 dark:text-indigo-300 font-bold border border-purple-200/50 dark:border-purple-800/40 overflow-x-auto">
                  {f.formula}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Worked Examples */}
      {note.examples && note.examples.length > 0 && (activeTab === 'all' || activeTab === 'concepts') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-base">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2>Worked Examples & Case Scenarios</h2>
          </div>
          <div className="space-y-3">
            {note.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5"
              >
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  Case {idx + 1}: {ex.concept}
                </h4>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-sans border border-emerald-200/60 dark:border-emerald-800/40">
                  {ex.example}
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 italic">
                  <strong>Academic Takeaway:</strong> {ex.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 7: Technical Keywords */}
      {note.keywords && note.keywords.length > 0 && activeTab === 'all' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Technical Keywords for Viva
          </span>
          <div className="flex flex-wrap gap-1.5">
            {note.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 8: Important University Questions (2M, 5M, 10M) */}
      {note.importantQuestions && note.importantQuestions.length > 0 && (activeTab === 'all' || activeTab === 'questions') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-base">
              <HelpCircle className="w-5 h-5 text-rose-600" />
              <h2>Important University Questions & Model Answers</h2>
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {note.importantQuestions.length} Questions
            </span>
          </div>

          <div className="space-y-4">
            {note.importantQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        q.marks === 2
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : q.marks === 5
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {q.marks} Marks
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenExamMode(note, q.question, q.marks)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Full Marking Scheme Breakdown</span>
                  </button>
                </div>

                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Q{idx + 1}. {q.question}
                </h4>

                <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    Model University Answer:
                  </span>
                  {q.modelAnswer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 9: Practice MCQs with Interactive Self-Quiz */}
      {note.mcqs && note.mcqs.length > 0 && (activeTab === 'all' || activeTab === 'mcqs') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-base">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2>Practice MCQs (Interactive Quiz)</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click options to test your understanding
            </span>
          </div>

          <div className="space-y-4">
            {note.mcqs.map((mcq, idx) => {
              const selectedOpt = selectedAnswers[mcq.id];
              const isAnswered = selectedOpt !== undefined;
              return (
                <div
                  key={mcq.id || idx}
                  className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-3"
                >
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {idx + 1}. {mcq.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mcq.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      const isCorrect = optIdx === mcq.correctIndex;
                      let btnStyle = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-indigo-400';

                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isChosen) {
                          btnStyle = 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectMCQOption(mcq.id, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />}
                          {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* MCQ Explanation Box */}
                  {showExplanations[mcq.id] && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                      <span className="font-bold block mb-0.5">
                        Answer Explanation ({String.fromCharCode(65 + mcq.correctIndex)}):
                      </span>
                      <p className="leading-relaxed">{mcq.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
