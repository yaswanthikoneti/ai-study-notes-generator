import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { GenerateNotesView } from './components/GenerateNotesView';
import { NoteDetailsView } from './components/NoteDetailsView';
import { ExamModeView } from './components/ExamModeView';
import { QuestionBankView } from './components/QuestionBankView';
import { AIChatView } from './components/AIChatView';
import { MyNotesView } from './components/MyNotesView';
import { SettingsView } from './components/SettingsView';
import {
  StudyNote,
  UploadedPdfInfo,
  UserPreferences,
  StudentProfile,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_STUDENT_PROFILE,
} from './types/notes';
import { DEMO_STUDY_NOTE } from './data/demoNotes';

export default function App() {
  // User Preferences & Student Profile state with localStorage persistence
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('ai_study_preferences');
      if (saved) {
        return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
    return DEFAULT_USER_PREFERENCES;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('ai_student_profile');
      if (saved) {
        return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    return DEFAULT_STUDENT_PROFILE;
  });

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (preferences.theme === 'dark') return true;
    if (preferences.theme === 'light') return false;
    const saved = localStorage.getItem('ai_notes_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Telugu' | 'Hindi'>(
    preferences.interfaceLanguage || 'English'
  );

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active uploaded PDF across the whole application
  const [uploadedPdf, setUploadedPdf] = useState<UploadedPdfInfo | null>(null);

  // Notes persistence state
  const [savedNotes, setSavedNotes] = useState<StudyNote[]>(() => {
    try {
      const stored = localStorage.getItem('ai_study_notes_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading notes from localStorage:', e);
    }
    return [DEMO_STUDY_NOTE];
  });

  // Active note in focus
  const [activeNote, setActiveNote] = useState<StudyNote | null>(() => {
    return savedNotes[0] || DEMO_STUDY_NOTE;
  });

  // Exam mode context parameters
  const [examModeInitialQuestion, setExamModeInitialQuestion] = useState<string | undefined>(undefined);
  const [examModeInitialMarks, setExamModeInitialMarks] = useState<number | undefined>(undefined);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_notes_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_notes_theme', 'light');
    }
  }, [darkMode]);

  // Persist notes list
  useEffect(() => {
    try {
      localStorage.setItem('ai_study_notes_list', JSON.stringify(savedNotes));
    } catch (e) {
      console.error('Failed to save notes to localStorage:', e);
    }
  }, [savedNotes]);

  // Handler for updating preferences
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem('ai_study_preferences', JSON.stringify(newPrefs));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }

    // Apply theme change immediately
    if (newPrefs.theme === 'light') {
      setDarkMode(false);
    } else if (newPrefs.theme === 'dark') {
      setDarkMode(true);
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Apply interface language change
    setSelectedLanguage(newPrefs.interfaceLanguage);
  };

  // Handler for updating student profile
  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('ai_student_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  // Handler: When new note is generated
  const handleNoteGenerated = (newNote: StudyNote) => {
    setSavedNotes((prev) => [newNote, ...prev]);
    setActiveNote(newNote);
    setCurrentView('view-note');
    showToast('Study notes successfully generated and saved!');
  };

  // Handler: Select note to view
  const handleSelectNote = (note: StudyNote) => {
    setActiveNote(note);
    setCurrentView('view-note');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Save note updates
  const handleSaveNote = (updatedNote: StudyNote) => {
    setSavedNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
    setActiveNote(updatedNote);
    showToast('Changes saved to your notes library!');
  };

  // Handler: Toggle Favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
    if (activeNote && activeNote.id === id) {
      setActiveNote((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    showToast('Favorite updated.');
  };

  // Handler: Delete Note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updated = savedNotes.filter((n) => n.id !== id);
      setSavedNotes(updated);
      if (activeNote && activeNote.id === id) {
        setActiveNote(updated[0] || null);
        if (currentView === 'view-note') {
          setCurrentView(updated.length > 0 ? 'dashboard' : 'generate');
        }
      }
      showToast('Note removed from library.');
    }
  };

  // Handler: Open Exam Mode with context
  const handleOpenExamMode = (note: StudyNote, question?: string, marks?: number) => {
    setActiveNote(note);
    setExamModeInitialQuestion(question || `Explain ${note.topic} with core concepts and diagrams.`);
    setExamModeInitialMarks(marks || 10);
    setCurrentView('exam-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Open Chat with active note
  const handleOpenChatWithNote = (note: StudyNote) => {
    setActiveNote(note);
    setCurrentView('ai-chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear chat history
  const handleClearChatHistory = () => {
    localStorage.removeItem('ai_study_chat_history');
    showToast('AI chat history cleared.');
  };

  // Clear all local data
  const handleClearLocalData = () => {
    localStorage.removeItem('ai_study_notes_list');
    localStorage.removeItem('ai_study_categorized_qb');
    localStorage.removeItem('ai_study_chat_history');
    setSavedNotes([]);
    setActiveNote(null);
    setUploadedPdf(null);
    showToast('All local data cleared.');
  };

  // User Logout
  const handleLogout = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('You have been logged out successfully.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={(newMode) => {
          setDarkMode(newMode);
          handleUpdatePreferences({
            ...preferences,
            theme: newMode ? 'dark' : 'light',
          });
        }}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={(newLang) => {
          setSelectedLanguage(newLang);
          handleUpdatePreferences({
            ...preferences,
            interfaceLanguage: newLang,
            aiResponseLanguage: newLang,
          });
        }}
        onNavigate={(v) => {
          setCurrentView(v);
          setMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (shown on all views except full landing page when desired, or accessible everywhere) */}
        {currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            onNavigate={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedNotes={savedNotes}
            activeNote={activeNote}
            onSelectNote={handleSelectNote}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        {/* Viewport Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {currentView === 'landing' && (
            <LandingPage
              onStartGenerate={() => {
                setCurrentView('generate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTryDemo={() => {
                setActiveNote(DEMO_STUDY_NOTE);
                setCurrentView('view-note');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              activeNote={activeNote}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              savedNotes={savedNotes}
              onSelectNote={handleSelectNote}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentView === 'generate' && (
            <GenerateNotesView
              onNoteGenerated={handleNoteGenerated}
              selectedLanguage={selectedLanguage}
              uploadedPdf={uploadedPdf}
              onPdfUploaded={setUploadedPdf}
              preferences={preferences}
            />
          )}

          {currentView === 'view-note' && activeNote && (
            <NoteDetailsView
              note={activeNote}
              onSaveNote={handleSaveNote}
              onRegenerateNote={(note) => {
                setCurrentView('generate');
              }}
              onToggleFavorite={handleToggleFavorite}
              onOpenExamMode={handleOpenExamMode}
              onOpenChatWithNote={handleOpenChatWithNote}
            />
          )}

          {currentView === 'exam-mode' && (
            <ExamModeView
              savedNotes={savedNotes}
              activeNote={activeNote}
              initialQuestion={examModeInitialQuestion}
              initialMarks={examModeInitialMarks}
              selectedLanguage={selectedLanguage}
              preferences={preferences}
            />
          )}

          {currentView === 'question-bank' && (
            <QuestionBankView
              savedNotes={savedNotes}
              activeNote={activeNote}
              uploadedPdf={uploadedPdf}
              onPdfUploaded={setUploadedPdf}
              onOpenExamMode={handleOpenExamMode}
              selectedLanguage={selectedLanguage}
              preferences={preferences}
            />
          )}

          {currentView === 'ai-chat' && (
            <AIChatView
              savedNotes={savedNotes}
              activeNote={activeNote}
              onSelectActiveNote={(n) => setActiveNote(n)}
              selectedLanguage={selectedLanguage}
            />
          )}

          {currentView === 'my-notes' && (
            <MyNotesView
              savedNotes={savedNotes}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'favorites' && (
            <MyNotesView
              savedNotes={savedNotes}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={(v) => setCurrentView(v)}
              onlyFavorites={true}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              savedNotes={savedNotes}
              onClearChatHistory={handleClearChatHistory}
              onClearLocalData={handleClearLocalData}
              onLogout={handleLogout}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-semibold shadow-2xl flex items-center space-x-2 border border-gray-800 dark:border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
