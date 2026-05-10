import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { getGeminiResponse } from "./gemini";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    setLoading(true);
    setError("");
    try {
      const aiText = await getGeminiResponse(input);
      setResponse(aiText);
    } catch (err) {
      console.error("Error:", err);
      setError(
        "Failed to get response. Check the browser console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Unibridge AI</h1>
      <p className="mb-8 text-slate-400">
        Ask your mentor anything about university life...
      </p>

      <div className="w-full max-w-2xl bg-slate-800 p-6 rounded-xl shadow-xl">
        <textarea
          className="w-full p-4 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500 mb-4"
          placeholder="e.g., I want to be a software engineer but I'm in secondary school. Where do I start?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Get Mentorship Roadmap"}
        </button>

        {error && (
          <div className="mt-8 p-6 bg-red-900/50 rounded-lg border border-red-700">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-3 text-blue-300">
              Your AI Mentor Says:
            </h2>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
