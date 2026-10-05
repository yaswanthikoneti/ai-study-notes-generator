import React, { useState } from 'react';
import {
  Settings,
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
  Languages,
  Sun,
  Moon,
  Laptop,
  Download,
  Database,
  Trash2,
  Info,
  HelpCircle,
  Shield,
  RotateCcw,
  LogOut,
  Check,
  Edit2,
  Save,
  CheckSquare,
  Square,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  StudentProfile,
  UserPreferences,
  StudyNote,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_STUDENT_PROFILE,
} from '../types/notes';
import { jsPDF } from 'jspdf';

interface SettingsViewProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  savedNotes: StudyNote[];
  onClearChatHistory: () => void;
  onClearLocalData: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  preferences,
  onUpdatePreferences,
  savedNotes,
  onClearChatHistory,
  onClearLocalData,
  onLogout,
  showToast,
}) => {
  // Profile edit mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<StudentProfile>(profile);

  // Active modal state for confirmations and about links
  const [activeModal, setActiveModal] = useState<
    'clear-chat' | 'clear-data' | 'reset-prefs' | 'logout' | 'help' | 'privacy' | 'about' | null
  >(null);

  // Profile save handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setIsEditingProfile(false);
    showToast('Profile information saved successfully!');
  };

  // Preference update helper
  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...preferences, [key]: value };
    onUpdatePreferences(updated);
  };

  // Download all notes summary bundle
  const handleDownloadAllNotes = () => {
    if (savedNotes.length === 0) {
      showToast('No saved notes to download.');
      return;
    }

    if (preferences.defaultExportFormat === 'PDF') {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = 50;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('Complete Study Notes Portfolio', margin, y);
      y += 24;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Student: ${profile.fullName} | Total Units: ${savedNotes.length} | Exported: ${new Date().toLocaleDateString()}`, margin, y);
      y += 30;

      savedNotes.forEach((note, index) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 10, contentWidth, 24, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. ${note.title} (${note.subject})`, margin + 6, y + 6);
        y += 28;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const overviewLines = doc.splitTextToSize(note.overview, contentWidth - 12);
        doc.text(overviewLines, margin + 6, y);
        y += overviewLines.length * 12 + 16;
      });

      doc.save(`${profile.fullName.replace(/\s+/g, '_')}_Study_Notes_Bundle.pdf`);
    } else {
      let content = `STUDY NOTES BUNDLE\nStudent: ${profile.fullName}\nInstitution: ${profile.college}\nExported: ${new Date().toLocaleDateString()}\n\n`;
      savedNotes.forEach((note, index) => {
        content += `=========================================================\n`;
        content += `${index + 1}. ${note.title.toUpperCase()}\n`;
        content += `Subject: ${note.subject} | Topic: ${note.topic}\n`;
        content += `Overview: ${note.overview}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.fullName.replace(/\s+/g, '_')}_Study_Notes_Bundle.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    showToast(`Exported ${savedNotes.length} study note(s) as ${preferences.defaultExportFormat}!`);
  };

  // Compute storage metrics
  const totalSavedNotes = savedNotes.length;
  const totalFavorites = savedNotes.filter((n) => n.isFavorite).length;

  let totalQuestionsCount = 0;
  try {
    const rawBanks = localStorage.getItem('ai_study_categorized_qb');
    if (rawBanks) {
      const parsed = JSON.parse(rawBanks);
      totalQuestionsCount =
        (parsed['2-mark']?.length || 0) +
        (parsed['5-mark']?.length || 0) +
        (parsed['10-mark']?.length || 0) +
        (parsed['mcq']?.length || 0);
    }
  } catch {
    totalQuestionsCount = savedNotes.reduce(
      (acc, n) => acc + (n.importantQuestions?.length || 0) + (n.mcqs?.length || 0),
      0
    );
  }

  // Get user avatar initials
  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 pb-24 font-sans text-gray-900 dark:text-gray-100">
      {/* Title & Subtitle */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/60">
          <Settings className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Student Account & Engine Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Customize your AI Study Notes Generator experience.
        </p>
      </div>

      {/* ---------------- 1. PROFILE CARD ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-6 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Student Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-600/20 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {profile.fullName || 'Student Profile'}
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {profile.course || 'Computer Science Student'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {profile.college}
              </p>
            </div>
          </div>

          <div>
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => {
                  setProfileForm(profile);
                  setIsEditingProfile(true);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled={!isEditingProfile}
              value={isEditingProfile ? profileForm.fullName : profile.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isEditingProfile
                  ? 'border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
              } font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled={!isEditingProfile}
              value={isEditingProfile ? profileForm.email : profile.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isEditingProfile
                  ? 'border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
              } font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              College / Institution
            </label>
            <input
              type="text"
              disabled={!isEditingProfile}
              value={isEditingProfile ? profileForm.college : profile.college}
              onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isEditingProfile
                  ? 'border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
              } font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Course / Degree
            </label>
            <input
              type="text"
              disabled={!isEditingProfile}
              value={isEditingProfile ? profileForm.course : profile.course}
              onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isEditingProfile
                  ? 'border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
              } font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Year of Study
            </label>
            {isEditingProfile ? (
              <select
                value={profileForm.yearOfStudy}
                onChange={(e) => setProfileForm({ ...profileForm, yearOfStudy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year (Final Year)">4th Year (Final Year Senior)</option>
                <option value="Postgraduate / Masters">Postgraduate / Masters</option>
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={profile.yearOfStudy}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 font-medium"
              />
            )}
          </div>
        </form>
      </section>

      {/* ---------------- 2. STUDY PREFERENCES ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Study Preferences</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            These preferences should be used automatically when generating notes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Default Note Length */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Default Note Length
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Short', 'Medium', 'Detailed'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => updatePref('defaultNoteLength', len)}
                  className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition-all ${
                    preferences.defaultNoteLength === len
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Default Difficulty */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Default Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Difficult'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => updatePref('defaultDifficulty', diff)}
                  className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition-all ${
                    preferences.defaultDifficulty === diff
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Default Study Purpose */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Default Study Purpose
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Quick Revision', 'Exam Preparation', 'Concept Understanding'] as const).map((purp) => (
                <button
                  key={purp}
                  type="button"
                  onClick={() => updatePref('defaultPurpose', purp)}
                  className={`py-2 px-2 rounded-xl border font-bold text-[11px] leading-tight transition-all text-center ${
                    preferences.defaultPurpose === purp
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {purp}
                </button>
              ))}
            </div>
          </div>

          {/* Default Answer Format */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Default Answer Format
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Simple English', 'Detailed Explanation', 'Exam-Friendly'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => updatePref('defaultAnswerFormat', fmt)}
                  className={`py-2 px-2 rounded-xl border font-bold text-[11px] leading-tight transition-all text-center ${
                    preferences.defaultAnswerFormat === fmt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. LANGUAGE ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Language</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose the language you prefer for AI-generated notes, answers and explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Interface Language
            </label>
            <select
              value={preferences.interfaceLanguage}
              onChange={(e) => updatePref('interfaceLanguage', e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              AI Response Language
            </label>
            <select
              value={preferences.aiResponseLanguage}
              onChange={(e) => updatePref('aiResponseLanguage', e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Telugu">తెలుగు (Telugu Academic)</option>
              <option value="Hindi">हिन्दी (Hindi Academic)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ---------------- 4. AI GENERATION PREFERENCES ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Preferences</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            These settings should be used by the Question Bank generator and study notes engine.
          </p>
        </div>

        {/* Checkbox toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { key: 'includeDefinitions', label: 'Include definitions by default' },
            { key: 'includeImportantPoints', label: 'Include important points' },
            { key: 'includeExamples', label: 'Include examples' },
            { key: 'includeFormulas', label: 'Include formulas' },
            { key: 'highlightKeywords', label: 'Highlight keywords' },
            { key: 'generateQuestions', label: 'Generate important questions' },
          ].map((item) => {
            const isChecked = !!preferences[item.key as keyof UserPreferences];
            return (
              <label
                key={item.key}
                onClick={() => updatePref(item.key as any, !isChecked)}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 font-semibold'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer pointer-events-none"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>

        {/* Question Type and Count Selectors */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Default Question Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '2-mark', label: '2 Marks' },
                { id: '5-mark', label: '5 Marks' },
                { id: '10-mark', label: '10 Marks' },
                { id: 'mcq', label: 'MCQs' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updatePref('defaultQuestionType', t.id as any)}
                  className={`py-2 px-1 rounded-xl border font-bold text-xs text-center transition-all ${
                    preferences.defaultQuestionType === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Default Question Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updatePref('defaultQuestionCount', c)}
                  className={`py-2 px-1 rounded-xl border font-bold text-xs text-center transition-all ${
                    preferences.defaultQuestionCount === c
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. APPEARANCE (VISUAL THEME SELECTOR) ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Appearance</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose your preferred color theme for high-yield study sessions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => updatePref('theme', 'light')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center space-y-2 ${
              preferences.theme === 'light'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-gray-900 dark:text-white">Light</span>
            <span className="text-[10px] text-gray-500">Daytime clarity</span>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => updatePref('theme', 'dark')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center space-y-2 ${
              preferences.theme === 'dark'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-indigo-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-gray-900 dark:text-white">Dark</span>
            <span className="text-[10px] text-gray-500">Night study focus</span>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => updatePref('theme', 'system')}
            className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center space-y-2 ${
              preferences.theme === 'system'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-gray-900 dark:text-white">System Default</span>
            <span className="text-[10px] text-gray-500">Auto match OS</span>
          </button>
        </div>
      </section>

      {/* ---------------- 6. NOTES & DOWNLOADS ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Notes & Downloads</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure export formatting and download consolidated study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider mb-2">
              Default Export Format
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['PDF', 'TXT'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => updatePref('defaultExportFormat', fmt)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs text-center transition-all ${
                    preferences.defaultExportFormat === fmt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {fmt} Document
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider mb-2">
              Export Inclusions
            </span>
            <div className="space-y-1.5">
              {[
                { key: 'exportIncludeAnswers', label: 'Include generated answers' },
                { key: 'exportIncludeFormulas', label: 'Include formulas' },
                { key: 'exportIncludeQuestions', label: 'Include important questions' },
              ].map((item) => {
                const checked = !!preferences[item.key as keyof UserPreferences];
                return (
                  <label
                    key={item.key}
                    onClick={() => updatePref(item.key as any, !checked)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 pointer-events-none"
                    />
                    <span className="text-xs">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadAllNotes}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download My Notes ({savedNotes.length})</span>
          </button>
        </div>
      </section>

      {/* ---------------- 7. DATA & STORAGE ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Data & Storage</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of your locally cached student records and memory controls.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 block">
              {totalSavedNotes}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Saved Notes
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 block">
              {totalQuestionsCount}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Question Banks
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <span className="text-2xl font-extrabold text-amber-500 block">
              {totalFavorites}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Favorites
            </span>
          </div>
        </div>

        {/* Destruction Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500">
            Browser memory is used for offline fast retrieval.
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveModal('clear-chat')}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
            >
              Clear Chat History
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('clear-data')}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors border border-red-200 dark:border-red-900/60"
            >
              Clear Local Data
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 8. ABOUT APPLICATION ---------------- */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>About Application</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-lg leading-relaxed">
              An AI-powered study assistant that transforms study material into concise notes, exam answers and question banks.
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
              v1.0.0
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-3">
          <span>Project: <strong>College CSE Project</strong></span>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setActiveModal('help')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              Help & Support
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 9. RESET SETTINGS ---------------- */}
      <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-gray-800 dark:text-gray-200 block">
            Reset Preferences
          </span>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Reset all study and AI preferences to default values without deleting notes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('reset-prefs')}
          className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-colors shrink-0"
        >
          Reset Preferences
        </button>
      </div>

      {/* ---------------- 10. LOGOUT ---------------- */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setActiveModal('logout')}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* ---------------- CONFIRMATION & INFO MODALS ---------------- */}

      {/* Clear Chat History Modal */}
      {activeModal === 'clear-chat' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Clear Chat History</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to clear your AI tutor chat history? Your notes and question banks will not be affected.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearChatHistory();
                  setActiveModal(null);
                  showToast('AI chat history cleared.');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Local Data Modal */}
      {activeModal === 'clear-data' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Clear All Local Data</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to clear your saved data? This action cannot be undone. All saved study notes, question banks, and cache will be permanently wiped.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearLocalData();
                  setActiveModal(null);
                  showToast('All local data cleared.');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Preferences Modal */}
      {activeModal === 'reset-prefs' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Reset Preferences</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Reset all study and AI preferences to their default values?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdatePreferences(DEFAULT_USER_PREFERENCES);
                  setActiveModal(null);
                  showToast('Preferences restored to defaults.');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-3 text-gray-800 dark:text-gray-200">
              <LogOut className="w-6 h-6 text-red-500 shrink-0" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Confirm Logout</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Info Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Help & Support</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p><strong>Generating Notes:</strong> Upload any lecture PDF or paste your study material in Generate Notes. Gemini extracts definitions, formulas, and high-yield exam points automatically.</p>
              <p><strong>Question Bank:</strong> Upload your PDF and select 2 Marks, 5 Marks, 10 Marks, or MCQs. The AI generates questions strictly grounded in your document.</p>
              <p><strong>Offline Access:</strong> All generated notes persist in your browser and can be exported as PDF or TXT anytime.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Info Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Student Privacy</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p><strong>Local-First Storage:</strong> Your notes, student profile, and question banks reside directly inside your browser storage.</p>
              <p><strong>Server Security:</strong> API keys are strictly kept on the server and are never exposed to the client. Transmitted documents are processed only to synthesize study notes.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Info Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Info className="w-5 h-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">About AI Study Notes</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p><strong>AI Study Notes Generator</strong> is designed for engineering and undergraduate students to streamline exam revision.</p>
              <p>Powered by Google's Gemini 3.8 Flash model via the modern GenAI TypeScript SDK.</p>
              <p className="text-[11px] text-gray-400">Version 1.0.0 • College CSE Project</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
