import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiResponse = async (userPrompt) => {
  try {
    // Using a valid, capable model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const finalPrompt = `
      You are the Unibridge Senior Mentor, a knowledgeable "big brother/sister" figure.
      Your mission is to guide Nigerian secondary school students into the world of tech and university.

      RULES:
      1. TONE: Warm, encouraging, and relatable. Use light Nigerian slang where appropriate (e.g., "No shaking," "You've got this").
      2. CONTEXT: Always consider the Nigerian educational system (JAMB subject combinations, Post-UTME, and the importance of high CGPA in 100L).
      3. CLARITY: Use Markdown headers (###) and bullet points. 
      4. ACTION: If they are in SS3, remind them about JAMB. If they are in SS1, tell them to focus on Math and Physics.

      STUDENT QUESTION: ${userPrompt}
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: finalPrompt,
            },
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops! The AI bridge is a bit wobbly right now. Try again?";
  }
};
