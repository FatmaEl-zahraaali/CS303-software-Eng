import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import * as pdfParse from 'pdf-parse';
dotenv.config();

admin.initializeApp();

interface QuizData {
  fileBase64: string;
  numQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  courseCode: string;
}

interface TutorData {
  fileBase64: string;
  question: string;
}


export const generateQuiz = onCall<QuizData>(async (request) => {
  console.log(" Function generateQuiz started!");
  
  if (!request.auth) {
    console.log(" No auth!");
    throw new Error('Unauthorized');
  }
  console.log(" Auth passed");

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(" API Key exists:", !!apiKey);
  console.log(" API Key length:", apiKey?.length || 0);
  if (apiKey) {
    console.log(" API Key first 10 chars:", apiKey.substring(0, 10) + "...");
  }
  
  if (!apiKey) {
    console.log(" API Key is MISSING!");
    throw new Error('GEMINI_API_KEY environment variable is not set!');
  }
  console.log(" API Key found");

  const { fileBase64, numQuestions, difficulty, courseCode } = request.data;
  console.log(" Request data:", { numQuestions, difficulty, courseCode });

  try {
    console.log(" Processing PDF...");
    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    console.log("PDF Buffer size:", pdfBuffer.length);
    
    const pdfData = await pdfParse.default(pdfBuffer);
    console.log("PDF parsed, text length:", pdfData.text.length);
    const extractedText = pdfData.text.slice(0, 30000);
    console.log("Extracted text preview:", extractedText.substring(0, 100) + "...");

    const prompt = `
Generate ${numQuestions} multiple-choice questions (${difficulty} difficulty) from the following text.

Return ONLY a JSON array. Each object must contain:
- "questionText": string
- "options": array of 4 strings
- "correctAnswer": string (must be the exact text of the correct option, not A/B/C/D)
- "explanation": string

Text:
${extractedText}
`;
    console.log(" Prompt prepared, length:", prompt.length);

    console.log(" Calling Gemini API...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
 console.log(" Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    console.log(" Gemini responded!");

    const raw = result.response.text();
    console.log(" Raw response length:", raw.length);
    
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const questions = JSON.parse(cleaned);
    console.log(" Parsed", questions.length, "questions");

    const processedQuestions = questions.map((q: any) => {
      let correctLetter = 'A';
      const index = q.options.findIndex((opt: string) => opt === q.correctAnswer);
      if (index !== -1) {
        correctLetter = String.fromCharCode(65 + index);
      }
      return {
        ...q,
        correctAnswer: correctLetter,
      };
    });

    console.log(" Saving to Firestore...");
    const batch = admin.firestore().batch();
    for (const q of processedQuestions) {
      const ref = admin.firestore().collection('questions').doc();
      batch.set(ref, {
        ...q,
        difficulty,
        courseCode,
        doctorId: request.auth.uid,
         source: 'ai', 
        createdAt: new Date(),  
      });
    }
    await batch.commit();
    console.log(" Saved successfully!");

    return { success: true, count: processedQuestions.length, questions: processedQuestions };    
    
  } catch (err: any) {
    console.log(" ERROR CAUGHT:");
    console.log("Error name:", err.name);
    console.log("Error message:", err.message);
    console.log("Error status:", err.status);
    console.log("Full error:", JSON.stringify(err, null, 2));
    throw err;
  }
});

export const askTutor = onCall<TutorData>(async (request) => {
  console.log(" askTutor function started!");
  
  if (!request.auth) {
    console.log(" No auth!");
    throw new Error('Unauthorized');
  }
  console.log(" Auth passed");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set!');
  }

  const { fileBase64, question } = request.data;
  console.log(" Question:", question.substring(0, 100) + "...");
  try {
    console.log(" Processing PDF...");
    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    const pdfData = await pdfParse.default(pdfBuffer);
    const extractedText = pdfData.text.slice(0, 30000);
    console.log(" PDF parsed, text length:", pdfData.text.length);

    const isQuizRequest = question.toLowerCase().includes("multiple-choice") || 
                           question.toLowerCase().includes("generate") ||
                           question.toLowerCase().includes("quiz");

    let prompt = "";
    
    if (isQuizRequest) {
      prompt = `
Based on the following text, generate multiple-choice questions as requested.

Text: ${extractedText}

${question}

Return ONLY a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0,
      "explanation": "explanation"
    }
  ]
}
`;
    } else {
      prompt = `
Based on the following text: ${extractedText}

Answer this question: ${question}

Return ONLY a JSON object with this exact structure:
{
  "answer": "detailed explanation",
  "example": "relevant example from the text",
  "summary": "brief summary"
}
`;
    }

    console.log(" Calling Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
 const result = await model.generateContent(prompt);

    const raw = result.response.text();
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const data = JSON.parse(cleaned);

    console.log(" Response generated successfully!");
    return { data };
    
  } catch (err: any) {
    console.log(" ERROR CAUGHT:");
    console.log("Error message:", err.message);
    throw err;
  }
});
