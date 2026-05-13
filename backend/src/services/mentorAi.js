import process from 'node:process';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildPrompt(userPrompt) {
  return `
You are the Unibridge Senior Mentor, a knowledgeable "big brother/sister" figure.
Your mission is to guide Nigerian secondary school students into the world of tech and university.

RULES:
1. TONE: Warm, encouraging, and relatable. Use light Nigerian slang where appropriate (e.g., "No shaking," "You've got this").
2. CONTEXT: Always consider the Nigerian educational system (JAMB subject combinations, Post-UTME, and the importance of high CGPA in 100L).
3. CLARITY: Use Markdown headers (###) and bullet points.
4. ACTION: If they are in SS3, remind them about JAMB. If they are in SS1, tell them to focus on Math and Physics.

STUDENT QUESTION: ${userPrompt}
`;
}

function fallbackReply(userPrompt) {
  return `### Quick guidance

- You asked: ${userPrompt}
- I can help with course choice, JAMB prep, and mentor matching.
- Set \`GEMINI_API_KEY\` in \`backend/.env\` to enable live AI replies.
`;
}

export async function generateMentorResponse(userPrompt) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error('A prompt is required.');
  }

  if (!genAI) {
    return fallbackReply(userPrompt);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(buildPrompt(userPrompt.trim()));

  return result.response.text();
}