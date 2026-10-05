export interface DefinitionItem {
  term: string;
  definition: string;
  context?: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  explanation: string;
}

export interface ExampleItem {
  concept: string;
  example: string;
  explanation: string;
}

export interface MCQItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuestionItem {
  id: string;
  type: '2-mark' | '5-mark' | '10-mark' | 'short' | 'long';
  marks: number;
  question: string;
  modelAnswer: string;
  keyPoints?: string[];
  difficulty: 'Easy' | 'Medium' | 'Difficult';
}

export interface KeyConceptItem {
  heading: string;
  description: string;
  points: string[];
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  date: string;
  createdAt: number;
  noteLength: 'Short' | 'Medium' | 'Detailed';
  difficulty: 'Easy' | 'Medium' | 'Difficult';
  purpose: 'Quick Revision' | 'Exam Preparation' | 'Concept Understanding';
  format: 'Bullet Points' | 'Detailed Notes' | 'Exam Notes';
  language: 'English' | 'Telugu' | 'Hindi';
  overview: string;
  topics: string[];
  keyConcepts: KeyConceptItem[];
  importantPoints: string[];
  definitions: DefinitionItem[];
  formulas: FormulaItem[];
  examples: ExampleItem[];
  keywords: string[];
  importantQuestions: QuestionItem[];
  mcqs: MCQItem[];
  rawMaterialPreview?: string;
  isFavorite?: boolean;
}

export interface ExamAnswerResponse {
  question: string;
  marks: number;
  sections: {
    heading: string;
    content: string;
    bullets?: string[];
  }[];
  example?: string;
  diagramOrFormula?: string;
  conclusion?: string;
  proExamTip?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isExamAnswer?: boolean;
}

export interface UploadedPdfInfo {
  name: string;
  base64: string;
  mimeType: string;
  extractedText?: string;
  sizeBytes: number;
}

export interface StudentProfile {
  fullName: string;
  email: string;
  college: string;
  course: string;
  yearOfStudy: string;
  avatarUrl?: string;
}

export interface UserPreferences {
  // Study Preferences
  defaultNoteLength: 'Short' | 'Medium' | 'Detailed';
  defaultDifficulty: 'Easy' | 'Medium' | 'Difficult';
  defaultPurpose: 'Quick Revision' | 'Exam Preparation' | 'Concept Understanding';
  defaultAnswerFormat: 'Simple English' | 'Detailed Explanation' | 'Exam-Friendly';

  // Language Preferences
  interfaceLanguage: 'English' | 'Telugu' | 'Hindi';
  aiResponseLanguage: 'English' | 'Telugu' | 'Hindi';

  // AI Generation Preferences
  includeDefinitions: boolean;
  includeImportantPoints: boolean;
  includeExamples: boolean;
  includeFormulas: boolean;
  highlightKeywords: boolean;
  generateQuestions: boolean;
  defaultQuestionType: '2-mark' | '5-mark' | '10-mark' | 'mcq';
  defaultQuestionCount: number;

  // Appearance
  theme: 'light' | 'dark' | 'system';

  // Notes & Downloads
  defaultExportFormat: 'PDF' | 'TXT';
  exportIncludeAnswers: boolean;
  exportIncludeFormulas: boolean;
  exportIncludeQuestions: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultNoteLength: 'Medium',
  defaultDifficulty: 'Medium',
  defaultPurpose: 'Exam Preparation',
  defaultAnswerFormat: 'Exam-Friendly',

  interfaceLanguage: 'English',
  aiResponseLanguage: 'English',

  includeDefinitions: true,
  includeImportantPoints: true,
  includeExamples: true,
  includeFormulas: true,
  highlightKeywords: true,
  generateQuestions: true,
  defaultQuestionType: '2-mark',
  defaultQuestionCount: 15,

  theme: 'system',

  defaultExportFormat: 'PDF',
  exportIncludeAnswers: true,
  exportIncludeFormulas: true,
  exportIncludeQuestions: true,
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  fullName: 'Yaswanthi Koneti',
  email: 'yaswanthikoneti@gmail.com',
  college: 'Engineering & Technology College',
  course: 'B.Tech in Computer Science & Engineering',
  yearOfStudy: '4th Year (Final Year)',
};
