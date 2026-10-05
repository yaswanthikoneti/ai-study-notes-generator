import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookMarked,
  HelpCircle,
  MessageSquare,
  Star,
  Settings,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { StudyNote } from '../types/notes';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedNotes: StudyNote[];
  activeNote: StudyNote | null;
  onSelectNote: (note: StudyNote) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  savedNotes,
  activeNote,
  onSelectNote,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'generate', label: 'Generate Notes', icon: Sparkles, badge: 'AI' },
    { id: 'my-notes', label: 'My Notes', icon: BookMarked, badge: savedNotes.length },
    { id: 'exam-mode', label: 'Exam Mode', icon: GraduationCap, badge: '2/5/10M' },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle, badge: null },
    { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare, badge: null },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      badge: savedNotes.filter((n) => n.isFavorite).length || null,
    },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation links */}
        <div className="p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Active Note Card */}
          {activeNote && (
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Active Context</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div
                onClick={() => handleItemClick('view-note')}
                className="p-3 mx-1 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 line-clamp-1">
                    {activeNote.subject}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1 line-clamp-2 leading-tight">
                  {activeNote.title}
                </h4>
                <div className="flex items-center space-x-2 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 font-mono">
                    {activeNote.difficulty}
                  </span>
                  <span>•</span>
                  <span>{activeNote.importantQuestions?.length || 0} Questions</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom College Project Credit Box */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-gray-800/40 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>College CSE Project</span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Gemini 3.8 powered exam intelligence for undergraduate engineering curriculum.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
