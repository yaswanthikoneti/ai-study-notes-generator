import React, { useState } from 'react';
import {
  BookMarked,
  Search,
  Filter,
  Star,
  Trash2,
  Download,
  FolderOpen,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { StudyNote } from '../types/notes';
import { exportNotesToPdf, exportNotesToTxt } from '../utils/exportNotes';

interface MyNotesViewProps {
  savedNotes: StudyNote[];
  onSelectNote: (note: StudyNote) => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigate: (view: string) => void;
  onlyFavorites?: boolean;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  savedNotes,
  onSelectNote,
  onDeleteNote,
  onToggleFavorite,
  onNavigate,
  onlyFavorites = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [downloadDropdownId, setDownloadDropdownId] = useState<string | null>(null);

  // Extract unique subjects
  const subjects = ['All', ...Array.from(new Set(savedNotes.map((n) => n.subject)))];

  // Filter notes
  const filteredNotes = savedNotes.filter((note) => {
    if (onlyFavorites && !note.isFavorite) return false;
    if (selectedSubject !== 'All' && note.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All' && note.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchTopic = note.topic.toLowerCase().includes(q);
      const matchSubject = note.subject.toLowerCase().includes(q);
      const matchOverview = note.overview?.toLowerCase().includes(q);
      return matchTitle || matchTopic || matchSubject || matchOverview;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/60">
            <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
            <span>{onlyFavorites ? 'Starred Library' : 'College Notes Archive'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {onlyFavorites ? 'Favorite Study Notes' : 'My Notes Library'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Access your saved structured notes, revision checklists, formulas, and questions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generate')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Note</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, topics, or formulas..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-gray-400 font-medium">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer max-w-[140px] truncate"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-gray-400 font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Difficult">Difficult</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
          <BookMarked className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {searchQuery ? 'No matching notes found' : 'No notes in this collection'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Generate structured study notes from your college syllabus to start building your repository.'}
          </p>
          <button
            onClick={() => onNavigate('generate')}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Generate New Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Subject & Favorite & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {note.subject}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => onToggleFavorite(note.id, e)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-amber-400 transition-colors"
                      title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectNote(note)}
                  className="font-bold text-gray-900 dark:text-white text-base mt-2.5 line-clamp-2 cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {note.title}
                </h3>

                {/* Topic & Overview */}
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 line-clamp-1">
                  Topic: {note.topic}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {note.overview}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    {note.difficulty}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                    {note.format}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                    {note.importantQuestions?.length || 0} Questions
                  </span>
                </div>
              </div>

              {/* Card Footer: Date & Actions (Open, Download) */}
              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono text-[11px]">{note.date}</span>

                <div className="flex items-center space-x-2">
                  {/* Download dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDownloadDropdownId(downloadDropdownId === note.id ? null : note.id)
                      }
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs flex items-center space-x-1"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {downloadDropdownId === note.id && (
                      <div className="absolute right-0 bottom-8 w-36 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-20 py-1">
                        <button
                          onClick={() => {
                            exportNotesToPdf(note);
                            setDownloadDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        >
                          PDF Export
                        </button>
                        <button
                          onClick={() => {
                            exportNotesToTxt(note);
                            setDownloadDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        >
                          TXT Export
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Open Note button */}
                  <button
                    onClick={() => onSelectNote(note)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-1 transition-colors"
                  >
                    <span>Open</span>
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
