import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Copy,
  Check,
  Download,
  AlertCircle,
  Loader2,
  FileText,
  Lightbulb,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { StudyNote, ExamAnswerResponse, UserPreferences } from '../types/notes';
import { jsPDF } from 'jspdf';

interface ExamModeViewProps {
  savedNotes: StudyNote[];
  activeNote: StudyNote | null;
  initialQuestion?: string;
  initialMarks?: number;
  selectedLanguage: 'English' | 'Telugu' | 'Hindi';
  preferences?: UserPreferences;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({
  savedNotes,
  activeNote,
  initialQuestion = '',
  initialMarks,
  selectedLanguage,
  preferences,
}) => {
  const defaultMarks =
    initialMarks !== undefined
      ? initialMarks
      : preferences?.defaultQuestionType === '2-mark'
      ? 2
      : preferences?.defaultQuestionType === '5-mark'
      ? 5
      : 10;
  const [marks, setMarks] = useState<number>(defaultMarks);
  const [question, setQuestion] = useState<string>(
    initialQuestion || (activeNote ? `Explain the principles and working of ${activeNote.topic}` : '')
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || (savedNotes[0]?.id || ''));
  const [customContext, setCustomContext] = useState<string>('');
  const [language, setLanguage] = useState<'English' | 'Telugu' | 'Hindi'>(
    preferences?.aiResponseLanguage || selectedLanguage
  );

  React.useEffect(() => {
    if (preferences) {
      if (initialMarks === undefined) {
        if (preferences.defaultQuestionType === '2-mark') setMarks(2);
        else if (preferences.defaultQuestionType === '5-mark') setMarks(5);
        else if (preferences.defaultQuestionType === '10-mark') setMarks(10);
      }
      if (preferences.aiResponseLanguage) {
        setLanguage(preferences.aiResponseLanguage);
      }
    }
  }, [preferences, initialMarks]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [examAnswer, setExamAnswer] = useState<ExamAnswerResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick preset exam questions for instant testing
  const sampleQuestions = [
    { text: 'Define Race Condition and how Semaphores eliminate it.', marks: 2 },
    { text: 'Explain Peterson\'s algorithm for 2-process mutual exclusion.', marks: 5 },
    { text: 'Explain the 4 Coffman conditions for Deadlock and how Banker\'s algorithm avoids unsafe states.', marks: 10 },
    { text: 'Compare TCP and UDP protocols with header formats and use cases.', marks: 10 },
    { text: 'Explain 1NF, 2NF, 3NF and BCNF with functional dependencies.', marks: 10 },
  ];

  const handleGenerateAnswer = async () => {
    setErrorMsg(null);
    if (!question.trim()) {
      setErrorMsg('Please enter a question or topic to generate an exam answer.');
      return;
    }

    setIsLoading(true);

    // Build context
    let context = customContext;
    const selectedNote = savedNotes.find((n) => n.id === selectedNoteId);
    if (selectedNote) {
      context = `Subject: ${selectedNote.subject}\nTopic: ${selectedNote.topic}\nOverview: ${selectedNote.overview}\nConcepts: ${JSON.stringify(
        selectedNote.keyConcepts
      )}\nDefinitions: ${JSON.stringify(selectedNote.definitions)}\nFormulas: ${JSON.stringify(
        selectedNote.formulas
      )}\nExamples: ${JSON.stringify(selectedNote.examples)}`;
    }

    try {
      const response = await fetch('/api/exam-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          topic: selectedNote?.topic || 'Computer Science',
          marks,
          notesContext: context,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate exam answer.');
      }

      const answerData: ExamAnswerResponse = await response.json();
      setExamAnswer(answerData);
    } catch (err: any) {
      console.error('Exam answer error:', err);
      setErrorMsg(err.message || 'An error occurred while generating the exam answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!examAnswer) return;
    let text = `EXAM ANSWER [${examAnswer.marks} MARKS]\nQuestion: ${examAnswer.question}\n\n`;
    examAnswer.sections?.forEach((s) => {
      text += `--- ${s.heading} ---\n${s.content}\n`;
      s.bullets?.forEach((b) => (text += `• ${b}\n`));
      text += '\n';
    });
    if (examAnswer.diagramOrFormula) {
      text += `Diagram/Formula:\n${examAnswer.diagramOrFormula}\n\n`;
    }
    if (examAnswer.example) {
      text += `Example:\n${examAnswer.example}\n\n`;
    }
    if (examAnswer.conclusion) {
      text += `Conclusion:\n${examAnswer.conclusion}\n\n`;
    }
    if (examAnswer.proExamTip) {
      text += `Pro Exam Tip:\n${examAnswer.proExamTip}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!examAnswer) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`University Exam Model Answer (${examAnswer.marks} Marks)`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const qLines = doc.splitTextToSize(`Question: ${examAnswer.question}`, 180);
    doc.text(qLines, 14, 28);

    let y = 32 + qLines.length * 5;
    doc.setTextColor(0, 0, 0);

    examAnswer.sections?.forEach((sec) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(sec.heading, 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(sec.content, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 4;

      sec.bullets?.forEach((b) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const bLines = doc.splitTextToSize(`• ${b}`, 175);
        doc.text(bLines, 18, y);
        y += bLines.length * 5 + 2;
      });
      y += 4;
    });

    if (examAnswer.example) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Concrete Example:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const exLines = doc.splitTextToSize(examAnswer.example, 180);
      doc.text(exLines, 14, y);
      y += exLines.length * 5 + 6;
    }

    if (examAnswer.conclusion) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Conclusion:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const cLines = doc.splitTextToSize(examAnswer.conclusion, 180);
      doc.text(cLines, 14, y);
    }

    doc.save(`Exam_Answer_${examAnswer.marks}Marks.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/60">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>University Scheme Formatter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          University Exam Mode
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Generate structured, high-scoring answers formatted exactly to university grading schemes (2 Marks, 5 Marks, or 10 Marks).
        </p>
      </div>

      {/* Configuration Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-xs space-y-5">
        {/* Marks Allocation Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Select Marks Allocation
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[2, 5, 10].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarks(m)}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center ${
                  marks === m
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                }`}
              >
                <span className="text-lg">{m} Marks</span>
                <span className={`text-[10px] font-normal ${marks === m ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {m === 2 ? 'Crisp Definition & 2 pts' : m === 5 ? 'Explanation & Example' : 'Complete Architecture'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question / Topic Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Exam Question or Topic
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Explain Peterson's algorithm or Describe Banker's algorithm for Deadlock avoidance..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
          />
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-medium">Quick Prompts:</span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(sq.text);
                setMarks(sq.marks);
              }}
              className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-gray-700 dark:text-gray-300 text-[11px] transition-colors"
            >
              [{sq.marks}M] {sq.text.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Study Context Note Selector & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Knowledge Context from My Notes
            </label>
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- General CS Curriculum Knowledge --</option>
              {savedNotes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.subject}: {n.topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Output Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Telugu">తెలుగు (Telugu Academic)</option>
              <option value="Hindi">हिन्दी (Hindi Academic)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerateAnswer}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Formatting {marks}-Mark Scheme Answer with Gemini...</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4 text-amber-300" />
              <span>Generate {marks}-Mark Model Exam Answer</span>
            </>
          )}
        </button>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Generated Exam Answer Presentation */}
      {examAnswer && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs">
                {examAnswer.marks} MARKS ANSWER
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                Language: {language}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Answer'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Exam Question
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {examAnswer.question}
            </h3>
          </div>

          {/* Structured Sections (Definition, Explanation, Main points) */}
          <div className="space-y-4">
            {examAnswer.sections?.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700/80 space-y-2"
              >
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{sec.heading}</span>
                </h4>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                  {sec.content}
                </p>
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Diagram / Formula Representation */}
          {examAnswer.diagramOrFormula && (
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block uppercase tracking-wider">
                Exam Diagram / Formula Representation
              </span>
              <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed border border-gray-800">
                {examAnswer.diagramOrFormula}
              </pre>
            </div>
          )}

          {/* Concrete Worked Example */}
          {examAnswer.example && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block uppercase tracking-wider">
                Concrete Academic Example
              </span>
              <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                {examAnswer.example}
              </p>
            </div>
          )}

          {/* Conclusion */}
          {examAnswer.conclusion && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block uppercase tracking-wider">
                Final Summary & Conclusion
              </span>
              <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                {examAnswer.conclusion}
              </p>
            </div>
          )}

          {/* Pro Examiner Tip */}
          {examAnswer.proExamTip && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start space-x-3 text-amber-900 dark:text-amber-200 text-xs">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Examiner Scoring Tip:</span>
                <p className="leading-relaxed">{examAnswer.proExamTip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
