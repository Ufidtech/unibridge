export const getGeminiResponse = async (userPrompt) => {
  try {
    const response = await fetch('/api/ai/mentor-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unable to reach the mentor API.');
    }

    return data.response;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops! The AI bridge is a bit wobbly right now. Try again?";
  }
};
