import { jsPDF } from 'jspdf';
import { StudyNote } from '../types/notes';

export function exportNotesToTxt(note: StudyNote) {
  let content = `========================================================================\n`;
  content += `${note.title.toUpperCase()}\n`;
  content += `Subject: ${note.subject} | Topic: ${note.topic}\n`;
  content += `Difficulty: ${note.difficulty} | Format: ${note.format} | Date: ${note.date}\n`;
  content += `Generated with AI Study Notes Generator\n`;
  content += `========================================================================\n\n`;

  content += `--- EXECUTIVE OVERVIEW ---\n${note.overview}\n\n`;

  if (note.topics && note.topics.length > 0) {
    content += `--- TOPICS COVERED ---\n`;
    note.topics.forEach((t, i) => {
      content += `${i + 1}. ${t}\n`;
    });
    content += `\n`;
  }

  if (note.keyConcepts && note.keyConcepts.length > 0) {
    content += `--- KEY CONCEPTS ---\n`;
    note.keyConcepts.forEach((kc, i) => {
      content += `\n[${i + 1}] ${kc.heading}\n`;
      content += `${kc.description}\n`;
      kc.points.forEach((pt) => {
        content += `  • ${pt}\n`;
      });
    });
    content += `\n`;
  }

  if (note.importantPoints && note.importantPoints.length > 0) {
    content += `--- IMPORTANT HIGH-YIELD POINTS ---\n`;
    note.importantPoints.forEach((pt, i) => {
      content += `${i + 1}. ${pt}\n`;
    });
    content += `\n`;
  }

  if (note.definitions && note.definitions.length > 0) {
    content += `--- CORE DEFINITIONS ---\n`;
    note.definitions.forEach((d) => {
      content += `• ${d.term}: ${d.definition}${d.context ? ` (Context: ${d.context})` : ''}\n`;
    });
    content += `\n`;
  }

  if (note.formulas && note.formulas.length > 0) {
    content += `--- FORMULAS & THEOREMS ---\n`;
    note.formulas.forEach((f) => {
      content += `• ${f.name}:\n  Formula: ${f.formula}\n  Explanation: ${f.explanation}\n\n`;
    });
  }

  if (note.examples && note.examples.length > 0) {
    content += `--- WORKED EXAMPLES & CASE STUDIES ---\n`;
    note.examples.forEach((ex, i) => {
      content += `Example ${i + 1}: ${ex.concept}\n${ex.example}\nSignificance: ${ex.explanation}\n\n`;
    });
  }

  if (note.keywords && note.keywords.length > 0) {
    content += `--- TECHNICAL KEYWORDS ---\n`;
    content += note.keywords.join(', ') + `\n\n`;
  }

  if (note.importantQuestions && note.importantQuestions.length > 0) {
    content += `--- IMPORTANT EXAM QUESTIONS & MODEL ANSWERS ---\n`;
    note.importantQuestions.forEach((q, i) => {
      content += `\nQ${i + 1} [${q.marks} Marks | ${q.difficulty}]: ${q.question}\n`;
      content += `Model Answer:\n${q.modelAnswer}\n`;
    });
    content += `\n`;
  }

  if (note.mcqs && note.mcqs.length > 0) {
    content += `--- PRACTICE MULTIPLE CHOICE QUESTIONS (MCQs) ---\n`;
    note.mcqs.forEach((mcq, i) => {
      content += `\nMCQ ${i + 1}: ${mcq.question}\n`;
      mcq.options.forEach((opt, optIdx) => {
        content += `  [${String.fromCharCode(65 + optIdx)}] ${opt}\n`;
      });
      content += `Correct Answer: [${String.fromCharCode(65 + mcq.correctIndex)}] ${mcq.options[mcq.correctIndex]}\n`;
      content += `Explanation: ${mcq.explanation}\n`;
    });
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Notes.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNotesToPdf(note: StudyNote) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 40;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      renderHeaderFooter();
    }
  };

  const renderHeaderFooter = () => {
    const pageCount = (doc.internal as any).getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`AI Study Notes Generator • ${note.subject}`, margin, 25);
    doc.text(`Page ${pageCount}`, pageWidth - margin - 30, 25);
    doc.line(margin, 28, pageWidth - margin, 28);
  };

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Academic Indigo
  doc.rect(margin, cursorY, contentWidth, 54, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(note.title, contentWidth - 20);
  doc.text(titleLines[0] || 'Study Notes', margin + 12, cursorY + 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Subject: ${note.subject}  |  Topic: ${note.topic}  |  Difficulty: ${note.difficulty}  |  ${note.date}`,
    margin + 12,
    cursorY + 40
  );
  cursorY += 66;

  // Overview Section
  checkPageBreak(50);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Overview', margin, cursorY);
  cursorY += 14;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  const overviewLines = doc.splitTextToSize(note.overview, contentWidth);
  doc.text(overviewLines, margin, cursorY);
  cursorY += overviewLines.length * 13 + 12;

  // Key Concepts
  if (note.keyConcepts && note.keyConcepts.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Key Concepts & Technical Breakdown', margin, cursorY);
    cursorY += 16;

    note.keyConcepts.forEach((kc, i) => {
      checkPageBreak(40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text(`${i + 1}. ${kc.heading}`, margin + 5, cursorY);
      cursorY += 13;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const descLines = doc.splitTextToSize(kc.description, contentWidth - 10);
      doc.text(descLines, margin + 5, cursorY);
      cursorY += descLines.length * 12 + 6;

      kc.points.forEach((pt) => {
        checkPageBreak(25);
        const bulletLines = doc.splitTextToSize(`•  ${pt}`, contentWidth - 20);
        doc.text(bulletLines, margin + 15, cursorY);
        cursorY += bulletLines.length * 11 + 4;
      });
      cursorY += 6;
    });
  }

  // Important Points
  if (note.importantPoints && note.importantPoints.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. High-Yield Exam Points', margin, cursorY);
    cursorY += 14;

    note.importantPoints.forEach((pt, i) => {
      checkPageBreak(25);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const ptLines = doc.splitTextToSize(`[${i + 1}] ${pt}`, contentWidth - 10);
      doc.text(ptLines, margin + 5, cursorY);
      cursorY += ptLines.length * 12 + 4;
    });
    cursorY += 8;
  }

  // Definitions
  if (note.definitions && note.definitions.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Core Definitions', margin, cursorY);
    cursorY += 14;

    note.definitions.forEach((d) => {
      checkPageBreak(30);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${d.term}:`, margin + 5, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const defLines = doc.splitTextToSize(`  ${d.definition}`, contentWidth - 15);
      cursorY += 12;
      doc.text(defLines, margin + 12, cursorY);
      cursorY += defLines.length * 12 + 4;
    });
    cursorY += 6;
  }

  // Formulas
  if (note.formulas && note.formulas.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Formulas & Theorems', margin, cursorY);
    cursorY += 14;

    note.formulas.forEach((f) => {
      checkPageBreak(40);
      doc.setFillColor(243, 244, 246);
      doc.rect(margin + 5, cursorY - 2, contentWidth - 10, 36, 'F');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(`${f.name}:  ${f.formula}`, margin + 12, cursorY + 13);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(`Explanation: ${f.explanation}`, margin + 12, cursorY + 27);
      cursorY += 44;
    });
  }

  // Important Questions
  if (note.importantQuestions && note.importantQuestions.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('6. University Exam Questions & Model Answers', margin, cursorY);
    cursorY += 16;

    note.importantQuestions.forEach((q, i) => {
      checkPageBreak(45);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      const qLines = doc.splitTextToSize(
        `Q${i + 1} [${q.marks} Marks | ${q.difficulty}]: ${q.question}`,
        contentWidth - 10
      );
      doc.text(qLines, margin + 5, cursorY);
      cursorY += qLines.length * 12 + 4;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const ansLines = doc.splitTextToSize(`Model Answer: ${q.modelAnswer}`, contentWidth - 15);
      doc.text(ansLines, margin + 12, cursorY);
      cursorY += ansLines.length * 11 + 10;
    });
  }

  // MCQs
  if (note.mcqs && note.mcqs.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('7. Quick Practice MCQs', margin, cursorY);
    cursorY += 16;

    note.mcqs.forEach((mcq, i) => {
      checkPageBreak(45);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      const mcqLines = doc.splitTextToSize(`MCQ ${i + 1}: ${mcq.question}`, contentWidth - 10);
      doc.text(mcqLines, margin + 5, cursorY);
      cursorY += mcqLines.length * 12 + 4;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      mcq.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === mcq.correctIndex;
        doc.text(
          `${String.fromCharCode(65 + optIdx)}) ${opt} ${isCorrect ? ' ✓' : ''}`,
          margin + 15,
          cursorY
        );
        cursorY += 11;
      });
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      const expLines = doc.splitTextToSize(`Ans: ${mcq.explanation}`, contentWidth - 20);
      doc.text(expLines, margin + 15, cursorY);
      cursorY += expLines.length * 10 + 8;
    });
  }

  // Save the PDF
  const filename = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyNotes.pdf`;
  doc.save(filename);
}
