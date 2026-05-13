import { useState } from 'react';
import { getGeminiResponse } from '../gemini';

export default function AICommandCenter() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hi! 👋 I\'m your AI mentor assistant. Ask me anything to help refine what you\'re looking for in a mentor. For example: "What skills do I need for Computer Science?" or "Help me prepare for JAMB".',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    const aiReply = await getGeminiResponse(userMessage);

    setMessages((prev) => [...prev, { role: 'ai', text: aiReply }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
      <h3 className="text-lg font-bold text-slate-100 mb-4">AI Command Center</h3>

      {/* Chat Messages */}
      <div className="bg-slate-950 rounded-lg p-4 mb-4 h-64 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g., What skills do I need for Computer Science?"
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        💡 Tip: Tell me about your goals and I'll help match you with the perfect mentor!
      </p>
    </div>
  );
}
