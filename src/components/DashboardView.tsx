import React from 'react';
import {
  FileText,
  HelpCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  ArrowRight,
  Star,
  Plus,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';
import { StudyNote } from '../types/notes';
import { exportNotesToPdf } from '../utils/exportNotes';

interface DashboardViewProps {
  savedNotes: StudyNote[];
  onSelectNote: (note: StudyNote) => void;
  onNavigate: (view: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedNotes,
  onSelectNote,
  onNavigate,
  onToggleFavorite,
}) => {
  // Compute Dashboard Statistics
  const totalNotes = savedNotes.length;
  const documentsProcessed = savedNotes.filter(
    (n) => n.rawMaterialPreview && n.rawMaterialPreview.length > 50
  ).length || totalNotes;
  const questionsGenerated = savedNotes.reduce(
    (acc, n) => acc + (n.importantQuestions?.length || 0) + (n.mcqs?.length || 0),
    0
  );
  const favoriteCount = savedNotes.filter((n) => n.isFavorite).length;

  // Recent notes (sorted by createdAt or reverse array)
  const recentNotes = [...savedNotes].slice(0, 5);

  return (
    <div className="space-y-8 py-4 pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-lg shadow-indigo-900/10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium mb-2 border border-indigo-400/20">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            <span>Smart CSE Study Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Track your semester materials, jump into exam-focused answer generation, and review your high-yield notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('generate')}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 hover:scale-105"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Generate Notes</span>
          </button>
          <button
            onClick={() => onNavigate('exam-mode')}
            className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium text-sm border border-indigo-500/40 transition-all flex items-center space-x-2 shrink-0"
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>Exam Mode</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Requested Metrics: Total Notes, Documents Processed, Questions Generated, Recent Notes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Notes
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalNotes}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Ready for revision
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Documents Processed
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {documentsProcessed}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              PDFs & Lecture Text
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Questions Generated
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {questionsGenerated}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              2M, 5M, 10M & MCQs
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Starred Favorites
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {favoriteCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Pinned for Viva
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('generate')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-800 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Generate New Notes
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Upload document or paste material to instantly create structured notes with formulas and definitions.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Start Generator</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('exam-mode')}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-800 border border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400">
            University Exam Mode
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Draft precise 2-mark, 5-mark, and 10-mark answers tailored specifically to semester marking schemes.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Open Exam Mode</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('ai-chat')}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-800 border border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400">
            AI Study Chat
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Chat with your notes as context. Ask to explain in Telugu or Hindi, or ask for examples and MCQs.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>Ask Tutor</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Recent Notes Section (Requested in DASHBOARD prompt) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Notes</h2>
          </div>
          <button
            onClick={() => onNavigate('my-notes')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Notes Saved Yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start by uploading your college study material or trying the demo.
            </p>
            <button
              onClick={() => onNavigate('generate')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Generate Notes Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {note.subject}
                    </span>
                    <button
                      onClick={(e) => onToggleFavorite(note.id, e)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={note.isFavorite ? 'Remove Favorite' : 'Add to Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-400 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-base mt-2.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {note.overview}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono text-[11px]">{note.date}</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium">
                      {note.difficulty}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                      Open <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
