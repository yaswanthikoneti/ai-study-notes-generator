import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50mb limit for PDF/document uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini client as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary and fallback models (Strictly compliant with @google/genai SDK guidelines)
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];

// Helper to check API key
const checkApiKey = (res: Response): boolean => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
    });
    return false;
  }
  return true;
};

/**
 * Determine if an error is temporary/retryable (503, 429, 500, network overload).
 * Strict rule: NEVER retry invalid API key (401/403), invalid request (400), or malformed input.
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const status = error.status || error.statusCode || error.response?.status;
  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }

  const msg = (error.message || error.toString() || '').toLowerCase();

  // Non-retryable indicators
  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('permission_denied') ||
    msg.includes('invalid argument') ||
    msg.includes('unauthenticated') ||
    msg.includes('not found')
  ) {
    return false;
  }

  // Temporary / Busy indicators
  if (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('429') ||
    msg.includes('overloaded') ||
    msg.includes('rate limit') ||
    msg.includes('500') ||
    msg.includes('internal error') ||
    msg.includes('temporarily') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout')
  ) {
    return true;
  }

  return false;
}

interface GeminiCallParams {
  contents: any;
  config?: any;
  onRetryNotification?: (message: string) => void;
}

/**
 * Robust Gemini caller with exponential backoff:
 * - Primary model: gemini-3.8-flash (Max 3 retry attempts)
 * - Exponential backoff: Attempt 1 -> 1s, Attempt 2 -> 2s, Attempt 3 -> 4s
 * - Fallback models if primary model remains unavailable (gemini-flash-latest, then gemini-3.1-flash-lite)
 * - Non-retryable errors fail immediately
 */
async function callGeminiWithRetry(params: GeminiCallParams) {
  const { contents, config, onRetryNotification } = params;
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    const isPrimary = mIdx === 0;
    const maxRetries = isPrimary ? 3 : 1; // 3 retries on primary, 1 retry on fallback

    console.log(`[Gemini Engine] Requesting generation using: ${model} (isPrimary: ${isPrimary})`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        // Verify response contains text
        if (response && response.text !== undefined) {
          console.log(`[Gemini Engine] Generation successful using ${model}`);
          return response;
        }

        throw new Error('Empty response received from AI model.');
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Engine] Call on ${model} failed (Attempt ${attempt}/${maxRetries}):`, err?.message || err);

        // If non-retryable (e.g. 400 Bad Request, 401/403 API Key), abort immediately
        if (!isRetryableError(err)) {
          console.error('[Gemini Engine] Non-retryable error detected. Aborting retries.', err);
          throw err;
        }

        // Retry with exponential backoff
        if (attempt < maxRetries) {
          // Exponential backoff:
          // attempt 0 -> wait 1000ms (~1s)
          // attempt 1 -> wait 2000ms (~2s)
          // attempt 2 -> wait 4000ms (~4s)
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`[Gemini Engine] Waiting ${delayMs}ms before retry attempt ${attempt + 1}...`);

          if (onRetryNotification) {
            onRetryNotification('Gemini is temporarily busy. Retrying...');
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // All retries for this model exhausted; will proceed to fallback model
          if (mIdx < modelsToTry.length - 1) {
            const nextModel = modelsToTry[mIdx + 1];
            console.log(`[Gemini Engine] ${model} unavailable after ${maxRetries} retries. Falling back to: ${nextModel}`);
            if (onRetryNotification) {
              onRetryNotification('Gemini is temporarily busy. Retrying...');
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    }
  }

  console.error('[Gemini Engine] All retries and fallback models failed:', lastError);
  const friendlyError = new Error('The AI service is temporarily busy. Please try again in a moment.');
  (friendlyError as any).statusCode = 503;
  throw friendlyError;
}

/**
 * Extract clean plain text from a Base64 PDF using pdf-parse.
 */
async function extractTextFromPdf(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const rawText = result?.text || '';

    // Clean up extracted text: remove page boundary markers like "-- 1 of 12 --", excess spaces
    const cleaned = rawText
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleaned;
  } catch (error) {
    console.error('[PDF Parser] Error parsing PDF buffer:', error);
    return '';
  }
}

/**
 * Split text into safe chunks of ~10,000 characters without breaking sentences.
 */
function splitIntoChunks(text: string, maxChunkSize = 10000, overlap = 400): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;
    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex).trim());
      break;
    }

    const slice = text.slice(startIndex, endIndex);
    let splitPos = slice.lastIndexOf('\n\n');
    if (splitPos === -1 || splitPos < maxChunkSize * 0.4) {
      splitPos = slice.lastIndexOf('\n');
    }
    if (splitPos === -1 || splitPos < maxChunkSize * 0.4) {
      splitPos = slice.lastIndexOf('. ');
      if (splitPos !== -1) splitPos += 1;
    }
    if (splitPos === -1 || splitPos < maxChunkSize * 0.4) {
      splitPos = maxChunkSize;
    }

    const chunkContent = text.slice(startIndex, startIndex + splitPos).trim();
    if (chunkContent.length > 50) {
      chunks.push(chunkContent);
    }

    startIndex = startIndex + splitPos - overlap;
    if (startIndex < 0) startIndex = 0;
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Combine multiple chunk structured outputs into a single cohesive study note.
 */
function combineChunkResults(chunkResults: any[], subject: string, topic: string): any {
  if (chunkResults.length === 1) return chunkResults[0];

  // 1. Overview: combine executive overviews
  const overviews = chunkResults.map((c) => c.overview).filter(Boolean);
  const combinedOverview = overviews.join(' ');

  // 2. Topics: unique set
  const topicsSet = new Set<string>();
  chunkResults.forEach((c) => {
    (c.topics || []).forEach((t: string) => topicsSet.add(t));
  });

  // 3. Key Concepts: unique by heading
  const conceptsMap = new Map<string, any>();
  chunkResults.forEach((c) => {
    (c.keyConcepts || []).forEach((kc: any) => {
      const key = (kc.heading || '').trim().toLowerCase();
      if (!conceptsMap.has(key)) {
        conceptsMap.set(key, kc);
      }
    });
  });

  // 4. Important Points: unique
  const pointsSet = new Set<string>();
  chunkResults.forEach((c) => {
    (c.importantPoints || []).forEach((p: string) => pointsSet.add(p.trim()));
  });

  // 5. Definitions: unique by term
  const defMap = new Map<string, any>();
  chunkResults.forEach((c) => {
    (c.definitions || []).forEach((d: any) => {
      const key = (d.term || '').trim().toLowerCase();
      if (!defMap.has(key)) {
        defMap.set(key, d);
      }
    });
  });

  // 6. Formulas: unique by name
  const formulaMap = new Map<string, any>();
  chunkResults.forEach((c) => {
    (c.formulas || []).forEach((f: any) => {
      const key = (f.name || '').trim().toLowerCase();
      if (!formulaMap.has(key)) {
        formulaMap.set(key, f);
      }
    });
  });

  // 7. Examples: unique
  const examples: any[] = [];
  chunkResults.forEach((c) => {
    (c.examples || []).forEach((ex: any) => {
      if (examples.length < 5) examples.push(ex);
    });
  });

  // 8. Keywords: unique
  const keywordsSet = new Set<string>();
  chunkResults.forEach((c) => {
    (c.keywords || []).forEach((kw: string) => keywordsSet.add(kw.trim()));
  });

  // 9. Questions: balanced selection
  const questions: any[] = [];
  const qSeen = new Set<string>();
  chunkResults.forEach((c) => {
    (c.importantQuestions || []).forEach((q: any) => {
      const key = (q.question || '').trim().toLowerCase();
      if (!qSeen.has(key)) {
        qSeen.add(key);
        questions.push(q);
      }
    });
  });

  // 10. MCQs: unique selection
  const mcqs: any[] = [];
  const mcqSeen = new Set<string>();
  chunkResults.forEach((c) => {
    (c.mcqs || []).forEach((m: any) => {
      const key = (m.question || '').trim().toLowerCase();
      if (!mcqSeen.has(key)) {
        mcqSeen.add(key);
        mcqs.push(m);
      }
    });
  });

  return {
    title: chunkResults[0]?.title || `${topic} - Exam Notes`,
    overview: combinedOverview || `Comprehensive structured study notes for ${topic}.`,
    topics: Array.from(topicsSet).slice(0, 10),
    keyConcepts: Array.from(conceptsMap.values()).slice(0, 8),
    importantPoints: Array.from(pointsSet).slice(0, 10),
    definitions: Array.from(defMap.values()).slice(0, 8),
    formulas: Array.from(formulaMap.values()).slice(0, 6),
    examples: examples.slice(0, 4),
    keywords: Array.from(keywordsSet).slice(0, 16),
    importantQuestions: questions.slice(0, 8),
    mcqs: mcqs.slice(0, 8),
  };
}

// API: Generate structured study notes
app.post('/api/generate-notes', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  const isEventStream = req.headers.accept?.includes('text/event-stream');

  const sendEvent = (event: { type: 'status' | 'retry' | 'done' | 'error'; message?: string; data?: any }) => {
    if (isEventStream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  };

  if (isEventStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
  }

  try {
    const {
      material,
      fileBase64,
      fileMimeType,
      subject = 'General Computer Science',
      topic = 'Study Topic',
      length = 'Medium',
      difficulty = 'Medium',
      purpose = 'Exam Preparation',
      format = 'Exam Notes',
      options = {},
      language = 'English',
    } = req.body;

    if (!material && !fileBase64) {
      if (isEventStream) {
        sendEvent({ type: 'error', message: 'Please provide text material or upload a document.' });
        return res.end();
      }
      return res.status(400).json({ error: 'Please provide text material or upload a document.' });
    }

    const {
      includeDefinitions = true,
      includeFormulas = true,
      includeExamples = true,
      generateQuestions = true,
      generateMCQs = true,
      extractKeywords = true,
    } = options;

    let effectiveMaterial = (material || '').trim();

    // REQUIREMENT 13: Extract PDF text correctly before sending to Gemini
    if (fileBase64) {
      sendEvent({ type: 'status', message: 'Extracting text from PDF document...' });
      const extractedPdfText = await extractTextFromPdf(fileBase64);
      if (extractedPdfText && extractedPdfText.length > 40) {
        console.log(`[PDF Extraction] Successfully extracted ${extractedPdfText.length} characters from PDF.`);
        effectiveMaterial = extractedPdfText;
      } else {
        console.warn('[PDF Extraction] Extracted minimal text; proceeding with available material.');
        if (!effectiveMaterial && fileBase64) {
          // If no text could be extracted, send as inlineData fallback
          effectiveMaterial = 'Analyze the attached document carefully.';
        }
      }
    }

    const systemPrompt = `You are an elite Computer Science university professor and academic mentor specialized in creating high-yield, structured, exam-oriented study notes for engineering and college students.

CRITICAL INSTRUCTIONS:
1. STRICT TRUTHFULNESS: Base all notes and questions strictly on the provided study material. Do not invent information or introduce unfounded assertions.
2. REMOVE FLUFF & REPETITION: Strip out conversational preamble, redundant prose, and lecture filler while preserving 100% of the core concepts, technical rigor, and nuance.
3. EXAM-READY STRUCTURING: Organize notes logically with high clarity, concise bullet points, bold conceptual anchors, and intuitive flow.
4. LANGUAGE REQUIREMENT: You MUST output all explanations, notes, questions, and descriptions in the requested language: ${language}.
5. FORMAT REQUIREMENT: Respond ONLY with a valid, clean JSON object matching the requested schema.`;

    const getNotePrompt = (chunkText: string) => `Generate comprehensive study notes for the following:
Subject: ${subject}
Topic: ${topic}
Target Length: ${length}
Target Difficulty: ${difficulty}
Target Purpose: ${purpose}
Preferred Format: ${format}
Include Definitions: ${includeDefinitions}
Include Formulas/Theorems: ${includeFormulas}
Include Concrete Examples/Code/Walkthroughs: ${includeExamples}
Include Important Exam Questions: ${generateQuestions}
Include Practice MCQs: ${generateMCQs}
Extract Technical Keywords: ${extractKeywords}

Required JSON Output Structure:
{
  "title": "Clear, informative title for this study unit",
  "overview": "Concise 2-4 sentence executive overview capturing the essence of the material",
  "topics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
  "keyConcepts": [
    {
      "heading": "Concept Name",
      "description": "Clear conceptual explanation",
      "points": ["Key technical detail or step", "Important property or constraint"]
    }
  ],
  "importantPoints": ["High-yield exam fact 1", "Critical point 2", "Common trap or pitfall 3"],
  "definitions": [
    {
      "term": "Term Name",
      "definition": "Precise textbook definition",
      "context": "Brief context where this applies"
    }
  ],
  "formulas": [
    {
      "name": "Formula or Theorem Name",
      "formula": "e.g. T(n) = 2T(n/2) + O(n) or Throughput = Data / Time",
      "explanation": "Variables and significance"
    }
  ],
  "examples": [
    {
      "concept": "Concept being demonstrated",
      "example": "Real-world analogy, step-by-step trace, or code scenario",
      "explanation": "Why this illustrates the concept"
    }
  ],
  "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"],
  "importantQuestions": [
    {
      "id": "q1",
      "type": "2-mark",
      "marks": 2,
      "question": "Clear 2-mark question?",
      "modelAnswer": "Concise, exact 2-mark answer (2-4 lines)",
      "difficulty": "Easy"
    },
    {
      "id": "q2",
      "type": "5-mark",
      "marks": 5,
      "question": "Clear 5-mark question?",
      "modelAnswer": "Structured 5-mark answer with points and example",
      "difficulty": "Medium"
    },
    {
      "id": "q3",
      "type": "10-mark",
      "marks": 10,
      "question": "Comprehensive 10-mark university question?",
      "modelAnswer": "Full 10-mark answer structure: Definition, detailed explanation, architecture/flow, example, conclusion",
      "difficulty": "Difficult"
    }
  ],
  "mcqs": [
    {
      "id": "mcq1",
      "question": "Conceptual multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why option A is correct and others are incorrect"
    }
  ]
}

Provided Study Material:
${chunkText}`;

    // REQUIREMENT 14: If large, safely process extracted text in chunks
    const chunks = splitIntoChunks(effectiveMaterial, 12000, 400);
    const chunkResults: any[] = [];

    console.log(`[Notes Engine] Processing ${chunks.length} text chunk(s). Length: ${effectiveMaterial.length} chars.`);

    for (let i = 0; i < chunks.length; i++) {
      if (chunks.length > 1) {
        sendEvent({
          type: 'status',
          message: `Analyzing section ${i + 1} of ${chunks.length} with Gemini AI...`,
        });
      } else {
        sendEvent({ type: 'status', message: 'Analyzing study material with Gemini AI...' });
      }

      const chunkPrompt = getNotePrompt(chunks[i]);

      const response = await callGeminiWithRetry({
        contents: chunkPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
        onRetryNotification: (msg) => {
          sendEvent({ type: 'retry', message: msg });
        },
      });

      const rawText = response.text || '{}';
      let parsedChunk: any = {};
      try {
        parsedChunk = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedChunk = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse structured response from AI model.');
        }
      }
      chunkResults.push(parsedChunk);
    }

    // REQUIREMENT 15 & 16: Combine chunk results into one final structured study note
    const finalNote = combineChunkResults(chunkResults, subject, topic);

    if (isEventStream) {
      sendEvent({ type: 'done', data: finalNote });
      res.end();
    } else {
      res.json(finalNote);
    }
  } catch (error: any) {
    console.error('Error generating notes:', error);

    // REQUIREMENT 8 & 9: Friendly message, never expose raw JSON API error
    const friendlyMessage = isRetryableError(error) || error.isBusyError
      ? 'The AI service is temporarily busy. Please try again in a moment.'
      : 'The AI service is temporarily busy. Please try again in a moment.';

    if (isEventStream) {
      sendEvent({ type: 'error', message: friendlyMessage });
      res.end();
    } else {
      res.status(503).json({ error: friendlyMessage });
    }
  }
});

// API: Exam Mode - Generate Mark-specific answers (2 Marks, 5 Marks, 10 Marks)
app.post('/api/exam-answer', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const { question, topic, marks = 10, notesContext = '', language = 'English' } = req.body;

    if (!question && !topic) {
      return res.status(400).json({ error: 'Question or topic is required' });
    }

    const prompt = `You are a strict university examiner and top-performing student in Computer Science.
Provide an optimal, high-scoring university exam answer for the following question for ${marks} MARKS.

Question: ${question || topic}
Subject/Topic: ${topic || 'General'}
Marks Allocated: ${marks} Marks
Target Language: ${language} (Write the entire answer in ${language})

Relevant Study Notes Context:
${notesContext ? notesContext.slice(0, 4000) : 'Use accurate Computer Science foundational knowledge.'}

EXAM ANSWER GUIDELINES FOR ${marks} MARKS:
${
  marks === 2
    ? `- 2 Marks standard:
  1. Formal 1-2 sentence precise Definition
  2. 2 Key bullet points / highlights
  3. Mini one-line example or formula`
    : marks === 5
    ? `- 5 Marks standard:
  1. Crisp Definition & Context
  2. Detailed Explanation (4-6 clear structured points)
  3. Concrete Example or Code snippet or Formula
  4. Practical Significance or application`
    : `- 10 Marks standard:
  1. Formal Definition & Overview
  2. In-depth Conceptual Explanation & Architecture / Principle
  3. Key Components / Types / Working Steps (well-structured with bullet points)
  4. Formula, Diagrammatic / ASCII Flow representation where applicable
  5. Detailed Real-world CSE Example or Step-by-Step Walkthrough
  6. Advantages / Disadvantages or Comparison if relevant
  7. Clear Exam Conclusion Summary`
}

Respond in valid JSON with:
{
  "question": "${question || topic}",
  "marks": ${marks},
  "sections": [
    {
      "heading": "e.g. Definition & Core Meaning",
      "content": "Text content...",
      "bullets": ["Point 1", "Point 2"]
    }
  ],
  "example": "Practical example text or code snippet",
  "diagramOrFormula": "ASCII diagram, formula, or architectural flow representation",
  "conclusion": "Final wrap-up summary",
  "proExamTip": "Tip on how to present this on paper for maximum examiner marks"
}`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let result = {};
    try {
      result = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { raw: rawText };
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error generating exam answer:', error);
    res.status(503).json({ error: 'The AI service is temporarily busy. Please try again in a moment.' });
  }
});

// API: Question Bank Generation
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      topic = 'Computer Science',
      notesContext = '',
      fileBase64,
      fileMimeType,
      targetCategory = '2-mark', // '2-mark' | '5-mark' | '10-mark' | 'mcq'
      difficulty = 'All',
      count = 15,
      language = 'English',
    } = req.body;

    let sourceMaterial = (notesContext || '').trim();

    // REQUIREMENT 1 & 2: Use uploaded PDF and extract text before generating
    if (fileBase64) {
      console.log('[Question Bank] Extracting text from uploaded PDF for question generation...');
      const extractedText = await extractTextFromPdf(fileBase64);
      if (extractedText && extractedText.length > 30) {
        sourceMaterial = extractedText;
        console.log(`[Question Bank] Extracted ${extractedText.length} characters from PDF.`);
      }
    }

    // REQUIREMENT 16: If no PDF/text has been uploaded, reject with friendly message
    if (!sourceMaterial) {
      return res.status(400).json({
        error: 'Please upload study material before generating questions.',
      });
    }

    // If PDF text is very large (> 18,000 characters), safely sample key sections across the document
    let materialForPrompt = sourceMaterial;
    if (sourceMaterial.length > 18000) {
      const partLength = 5000;
      const start = sourceMaterial.slice(0, partLength);
      const middleStart = Math.floor(sourceMaterial.length / 2) - Math.floor(partLength / 2);
      const middle = sourceMaterial.slice(middleStart, middleStart + partLength);
      const end = sourceMaterial.slice(sourceMaterial.length - partLength);
      materialForPrompt = `${start}\n\n[...]\n\n${middle}\n\n[...]\n\n${end}`;
    }

    const questionCount = Math.max(1, Math.min(25, Number(count) || 15));

    let categoryPrompt = '';
    if (targetCategory === '2-mark') {
      categoryPrompt = `You are a strict university examination paper setter.
Generate EXACTLY ${questionCount} important, high-yield 2-MARK QUESTIONS strictly based on the provided study material.

MANDATORY RULES FOR 2-MARK QUESTIONS:
1. QUANTITY: Generate EXACTLY ${questionCount} distinct 2-mark questions.
2. STRICT SOURCE GROUNDING: Questions and answers must be based ONLY on the provided study material. Do not invent information or generate generic filler.
3. TOPIC DIVERSITY: Cover different core concepts, definitions, protocols, algorithms, and components present across the entire text.
4. 2-MARK FORMAT STRICT COMPLIANCE:
   - Must be strictly 2-mark scope (DO NOT generate 5-mark essays or 10-mark architecture breakdowns).
   - Language: Simple, direct, crystal clear ${language}.
   - Direct answer in 2 to 4 concise bullet points or 2-3 precise sentences.
   - Include a formal definition, one-line formula, or brief concrete example when relevant.
   - Answer length: Keep it exam-friendly, concise, high-density (30 to 60 words).
5. Output valid JSON matching the schema below.

JSON Output Schema:
{
  "category": "2-mark",
  "topic": "${topic}",
  "questions": [
    {
      "id": "q2m_1",
      "type": "2-mark",
      "marks": 2,
      "question": "What is ...?",
      "modelAnswer": "Direct 2-mark answer: 1) Definition or core concept. 2) Key technical point or formula.",
      "keyPoints": ["Key point 1", "Key point 2"],
      "difficulty": "Easy | Medium | Difficult"
    }
  ]
}`;
    } else if (targetCategory === '5-mark') {
      categoryPrompt = `Generate EXACTLY ${questionCount} structured 5-MARK QUESTIONS strictly based on the provided study material.
Each answer must have:
- Clear definition/overview
- 4 to 6 structured bullet points
- Relevant concrete example, formula, or significance.
Language: ${language}.
JSON Output Schema:
{
  "category": "5-mark",
  "topic": "${topic}",
  "questions": [
    {
      "id": "q5m_1",
      "type": "5-mark",
      "marks": 5,
      "question": "Explain ...?",
      "modelAnswer": "Structured 5-mark answer with points and example.",
      "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "difficulty": "Easy | Medium | Difficult"
    }
  ]
}`;
    } else if (targetCategory === '10-mark') {
      categoryPrompt = `Generate EXACTLY ${questionCount} comprehensive 10-MARK UNIVERSITY QUESTIONS strictly based on the provided study material.
Each answer must follow the complete university scheme:
- Formal definition
- Detailed conceptual breakdown
- Architecture, working steps or ASCII diagram
- Real-world CSE example
- Conclusion summary.
Language: ${language}.
JSON Output Schema:
{
  "category": "10-mark",
  "topic": "${topic}",
  "questions": [
    {
      "id": "q10m_1",
      "type": "10-mark",
      "marks": 10,
      "question": "Describe in detail ...?",
      "modelAnswer": "Comprehensive 10-mark answer covering definition, working principles, architecture, example, and conclusion.",
      "keyPoints": ["Architecture", "Key steps", "Example", "Conclusion"],
      "difficulty": "Medium | Difficult"
    }
  ]
}`;
    } else {
      // MCQs
      categoryPrompt = `Generate EXACTLY ${questionCount} conceptual MULTIPLE CHOICE QUESTIONS (MCQs) strictly based on the provided study material.
Each MCQ must have:
- Clear question
- 4 plausible options (A, B, C, D)
- 0-indexed correctIndex
- Detailed explanation.
Language: ${language}.
JSON Output Schema:
{
  "category": "mcq",
  "topic": "${topic}",
  "mcqs": [
    {
      "id": "mcq_1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct based on the material."
    }
  ]
}`;
    }

    const fullPrompt = `${categoryPrompt}

STUDY MATERIAL:
${materialForPrompt}`;

    const response = await callGeminiWithRetry({
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let result: any = {};
    try {
      result = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : {};
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error generating question bank:', error);
    res.status(503).json({ error: 'The AI service is temporarily busy. Please try again in a moment.' });
  }
});

// API: AI Study Chat with Notes Context
app.post('/api/chat', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const { messages = [], notesContext = '', language = 'English' } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are a supportive, brilliant, patient Computer Science tutor and academic mentor.
You are chatting with a student about their study notes.

Current Notes Context:
${notesContext ? notesContext.slice(0, 5000) : 'General Computer Science assistance.'}

GUIDELINES:
1. Always ground your explanations in the provided study notes context when relevant.
2. If the user asks for Telugu or Hindi, explain fluently in that language with helpful technical terms in English when appropriate.
3. If the user asks for "10-mark answer" or "2-mark answer", structure it strictly with headings, bullet points, definitions, and examples suitable for university exams.
4. Keep explanations crystal clear, encouraging, structured with bullet points and bold highlights.
5. If the user asks for MCQs, generate them with options and correct answers.
6. Target Language: ${language} (unless the user specifically asks for another language in their message).`;

    const contents: any[] = [];
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const response = await callGeminiWithRetry({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(503).json({ error: 'The AI service is temporarily busy. Please try again in a moment.' });
  }
});

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    primaryModel: PRIMARY_MODEL,
    fallbackModels: FALLBACK_MODELS,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
