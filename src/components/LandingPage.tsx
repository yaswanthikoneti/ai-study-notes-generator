import React from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Sigma,
  Zap,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Download,
  Languages,
  Layers,
  Award
} from 'lucide-react';
import { StudyNote } from '../types/notes';

interface LandingPageProps {
  onStartGenerate: () => void;
  onTryDemo: () => void;
  onNavigate: (view: string) => void;
  activeNote: StudyNote | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGenerate,
  onTryDemo,
  onNavigate,
  activeNote,
}) => {
  const featureCards = [
    {
      title: 'AI Summarization',
      desc: 'Condenses dense textbook chapters and long lecture slides into crisp, clear, readable notes without losing technical accuracy.',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'PDF/Text Processing',
      desc: 'Seamlessly upload lecture PDFs or paste raw text. Gemini natively processes complex academic documentation.',
      icon: FileText,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Important Points',
      desc: 'Highlights crucial takeaways, high-yield exam bullets, and common student pitfalls for rapid pre-exam revision.',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Definitions',
      desc: 'Extracts formal textbook definitions with contextual usage, making it simple to write exact definitions in exams.',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Formula Extraction',
      desc: 'Isolates mathematical equations, algorithmic complexities, and theorems with explicit parameter explanations.',
      icon: Sigma,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Question Generation',
      desc: 'Formulates realistic 2-mark, 5-mark, and 10-mark university exam questions accompanied by model answers.',
      icon: HelpCircle,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'MCQ Generation',
      desc: 'Creates multiple-choice practice tests with 4 distinct options and in-depth conceptual explanations.',
      icon: Award,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'AI Study Chat',
      desc: 'Ask questions directly against your generated notes. Explain in Telugu, Hindi, or get 10-mark breakdowns on demand.',
      icon: MessageSquare,
      color: 'from-violet-500 to-indigo-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-gray-950 text-white p-8 sm:p-14 border border-indigo-800/40 shadow-2xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-medium backdrop-blur-xs">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Built for College CSE & Engineering Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Study Smarter with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-indigo-200/90 max-w-2xl mx-auto leading-relaxed">
            Upload your study material and instantly transform it into concise, structured and exam-friendly notes.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartGenerate}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Generate Notes</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-indigo-100 bg-white/10 hover:bg-white/15 border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-base backdrop-blur-xs"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Try Demo</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-indigo-200/80">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Factual Integrity</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>English • Telugu • Hindi</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Download PDF & TXT</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>2/5/10 Marks Exam Format</span>
            </span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (Requested 8 Features) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Everything You Need to Ace College Exams
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Engineered specifically to solve the student dilemma of bulky textbooks, messy lecture slides, and strict semester grading schemes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.bgColor} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exam Mode Spotlight Card */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/40 dark:via-gray-900/60 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Semester Exam Score Booster</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Targeted University Marking Schemes
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Examiners look for specific patterns: definitions, point-wise breakdown, code/examples, and conclusions. Generate tailor-made answers for:
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800/60 text-center">
                <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">2M</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Definition & Key Points</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800/60 text-center">
                <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">5M</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Explanation & Example</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800/60 text-center">
                <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">10M</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Architecture & Flow</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('exam-mode')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <span>Launch Exam Mode Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive preview box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-700 dark:text-gray-300 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-sans font-semibold text-gray-900 dark:text-white text-xs ml-1">
                  10-Mark Answer Template (CSE Scheme)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                Max Marks: 10
              </span>
            </div>
            <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
              <p className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">
                [1] Formal Definition & Contextual Meaning
              </p>
              <p className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                Rigorous textbook definition with primary objective and domain context.
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">
                [2] In-depth Explanation & Technical Architecture
              </p>
              <p className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                Working principles, algorithm phases, structural invariants, and constraints.
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">
                [3] Diagrammatic Representation & Mathematical Formulas
              </p>
              <p className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                ASCII state-machine, block diagrams, Need = Max - Allocation formulas.
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">
                [4] Real-World CSE Example & University Conclusion
              </p>
              <p className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                Producer-Consumer / Banker's safety trace with clear concluding summary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Support Banner */}
      <section className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Multilingual Academic Explanations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Students grasp difficult algorithms best when explained in their mother tongue. Study comfortably in <strong>English</strong>, <strong>తెలుగు (Telugu)</strong>, or <strong>हिन्दी (Hindi)</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={onStartGenerate}
          className="shrink-0 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-semibold transition-colors"
        >
          Try In Your Language
        </button>
      </section>
    </div>
  );
};
