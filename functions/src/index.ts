
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
const pdfParse = require('pdf-parse');

admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface QuizData {
  fileBase64: string;
  numQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  courseCode: string;
}

export const generateQuiz = onCall<QuizData>(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthorized');
  }

  const { fileBase64, numQuestions, difficulty, courseCode } = request.data;


  const pdfBuffer = Buffer.from(fileBase64, 'base64');
  const pdfData = await pdfParse(pdfBuffer);
  const extractedText = pdfData.text.slice(0, 30000);

  const prompt = `
Generate ${numQuestions} multiple-choice questions (${difficulty} difficulty) from the following text.

Return ONLY a JSON array. Each object must contain:
- "questionText": string
- "options": array of 4 strings
- "correctAnswer": string
- "explanation": string

Text:
${extractedText}
`;

const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const questions = JSON.parse(raw);

  const batch = admin.firestore().batch();
  for (const q of questions) {
    const ref = admin.firestore().collection('questions').doc();
    batch.set(ref, {
      ...q,
      difficulty,
      courseCode,
      doctorId: request.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { success: true, count: questions.length };
});
