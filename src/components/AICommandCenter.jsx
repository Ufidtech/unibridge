import { useState } from "react";
import ReactMarkdown from "react-markdown";

function getMenteeId(userInfo) {
  return userInfo?.id || userInfo?.uid || userInfo?.user?.uid || null;
}

function PrepSheetPanel({ prepSheet }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!prepSheet) return null;

  const sections = Array.isArray(prepSheet.sections) ? prepSheet.sections : [];
  const checklist = Array.isArray(prepSheet.checklist)
    ? prepSheet.checklist
    : [];
  const bullets = Array.isArray(prepSheet.bullets) ? prepSheet.bullets : [];

  return (
    <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-2.5">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
        aria-controls="prep-sheet-content"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Session summary
          </p>

          <h4 className="mt-1 text-sm font-semibold text-slate-100">
            Mentee summary
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {prepSheet.priority && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              {prepSheet.priority}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            {isOpen ? "Hide" : "Expand"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div id="prep-sheet-content">
          {prepSheet.summary && (
            <p className="mt-2 text-sm leading-5 text-slate-300">
              {prepSheet.summary}
            </p>
          )}

          {sections.length > 0 && (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {sections.slice(0, 3).map((section, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {section.title || `Section ${idx + 1}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {section.body || section.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {checklist.length > 0 && (
            <div className="mt-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Checklist
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-slate-300">
                {checklist.slice(0, 4).map((item, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bullets.length > 0 && (
            <div className="mt-2 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Notes
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {bullets.slice(0, 4).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatAssistantReply(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  const lines = raw
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);

  const contentLines = lines.filter((line) => !/^#{1,6}\s/.test(line));
  const bulletLines = contentLines.slice(0, 3);

  if (bulletLines.length > 0) {
    return bulletLines.map((line) => `- ${line}`).join("\n");
  }

  return raw
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => `- ${part}`)
    .join("\n");
}

// We'll call the backend AI endpoint which will either use Gemini or the local fallback
async function askAssistant(prompt) {
  const res = await fetch("/api/ai/mentor-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Reply in 2-3 short bullet points. Keep it concise and actionable: ${prompt}`,
    }),
  });
  const json = await res.json();
  return formatAssistantReply(json.response);
}

export default function AICommandCenter({
  userInfo = null,
  onPrepSheet = () => {},
}) {
  const menteeId = getMenteeId(userInfo);

  const [input, setInput] = useState("");
  const [latestSummary, setLatestSummary] = useState(
    userInfo?.menteeProfile?.school
      ? `Hi ${userInfo.name}! 👋 I'm your AI mentor assistant. Tell me your goals (e.g., "Prepare for ${userInfo.menteeProfile.dreamCourse || "JAMB"}") and I'll help match you with the right mentor.`
      : 'Hi! 👋 I\'m your AI mentor assistant. Ask me anything to help refine what you\'re looking for in a mentor. For example: "What skills do I need for Computer Science?" or "Help me prepare for JAMB".',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationsUpdated, setRecommendationsUpdated] = useState(false);
  const [prepSheet, setPrepSheet] = useState(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const aiReply = await askAssistant(userMessage);
    setLatestSummary(aiReply);

    try {
      const prepResp = await fetch("/api/ai/generate-prep-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentInput: userMessage }),
      });
      const prepData = await prepResp.json();
      const nextPrepSheet = prepData?.prepSheet || null;
      setPrepSheet(nextPrepSheet);
      onPrepSheet(nextPrepSheet);
    } catch (error) {
      console.warn("Prep sheet generation failed", error);
      setPrepSheet(null);
      onPrepSheet(null);
    }

    // Attempt to fetch AI-driven mentor recommendations directly
    try {
      if (menteeId) {
        const resp = await fetch("/api/ai/recommend-mentors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menteeId, limit: 12 }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data.mentors) ? data.mentors : [];
          // Dispatch a custom event with the mentors so the dashboard can update without re-fetching
          try {
            window.dispatchEvent(
              new CustomEvent("ai:recommend:done", {
                detail: { mentors: list },
              }),
            );
          } catch {
            void 0;
          }

          // Show a short-lived UI indicator in the command center
          setRecommendationsUpdated(true);
          setTimeout(() => setRecommendationsUpdated(false), 3000);
        } else {
          // still signal that AI was used; dashboard may choose to refetch
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("ai:recommend"));
          }
        }
      } else {
        // no mentee id — still notify listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ai:recommend"));
        }
      }
    } catch {
      console.warn("Recommendation fetch failed");
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ai:recommend"));
        }
      } catch {
        void 0;
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 md:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">AI Command Center</h3>
        {recommendationsUpdated && (
          <span className="rounded-md bg-green-600 px-2 py-1 text-xs text-white">
            Refreshed
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Latest AI summary
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {isLoading && <span>Thinking...</span>}
            <span>{latestSummary ? "3 bullets max" : "Ready"}</span>
          </div>
        </div>
        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:mt-0 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 text-slate-200">
          <ReactMarkdown>{latestSummary}</ReactMarkdown>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Share what you’re working on so the summary can be more specific.
        </p>
      </div>

      <PrepSheetPanel prepSheet={prepSheet} />

      {/* Input Box */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="e.g., What skills do I need for Computer Science?"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white transition hover:bg-blue-500"
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">
        Goal in, guidance out.
      </p>
    </div>
  );
}
