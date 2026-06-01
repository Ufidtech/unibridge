import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import ReactMarkdown from "react-markdown";
import "react-datepicker/dist/react-datepicker.css";

export default function BookSessionModal({
  mentor = {
    name: "Umar Farooq",
    initials: "UF",
    level: "300L",
    university: "FUT Minna",
    bio: "Frontend Dev and AI enthusiast",
  },
  onConfirm = () => {},
  onClose = () => {},
  initialDate = "",
  initialTime = "",
  confirmLabel = "Confirm Booking",
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    try {
      if (initialDate && initialTime) {
        const dt = new Date(
          initialDate +
            "T" +
            (initialTime.length === 5 ? initialTime + ":00" : initialTime),
        );
        return isNaN(dt.getTime()) ? null : dt;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [goal, setGoal] = useState("");
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const [aiPrepSheet, setAiPrepSheet] = useState("");
  const [isPrepReady, setIsPrepReady] = useState(false);
  const [aiQuestions] = useState([
    "What specific areas of React do you want to master?",
    "What challenges are you facing with your JAMB prep?",
  ]);

  // timeSlots/dateOptions removed (not used) to satisfy linting

  // keep selectedDateTime/timezone in sync if props change
  useEffect(() => {
    if (initialDate && initialTime) {
      try {
        const dt = new Date(
          initialDate +
            "T" +
            (initialTime.length === 5 ? initialTime + ":00" : initialTime),
        );
        if (!isNaN(dt.getTime())) setSelectedDateTime(dt);
      } catch {
        setSelectedDateTime(null);
      }
    }
  }, [initialDate, initialTime]);

  const canConfirm = selectedDateTime && goal.trim();

  const handleGeneratePrepSheet = async () => {
    if (canConfirm) {
      setIsGenerating(true);

      try {
        // Send the student's goal to the AI route and keep the prep sheet for preview.
        const res = await fetch("/api/ai/generate-prep-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentInput: goal.trim() }),
        });

        const data = await res.json();
        const prepSheet = data.prepSheet || "";

        setAiPrepSheet(prepSheet);
        setIsPrepReady(true);
      } catch (error) {
        console.error("AI Generation failed:", error);
        setAiPrepSheet("");
        setIsPrepReady(true);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!canConfirm || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onConfirm({
        mentorName: mentor.name,
        datetime: selectedDateTime ? selectedDateTime.toISOString() : null,
        timezone,
        goal,
        aiPrepSheet: aiPrepSheet || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-session-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {mentor.initials}
            </div>
            <div>
              <h3 id="book-session-title" className="font-bold text-slate-100">
                {mentor.name}
              </h3>
              <p className="text-xs text-slate-400">
                {mentor.level} • {mentor.university}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              Select Date & Time
            </label>
            <DatePicker
              selected={selectedDateTime}
              onChange={(date) => setSelectedDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
              placeholderText="Select date and time"
            />
          </div>

          {/* Goal Textarea */}
          <div className="mb-4">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              What do you want to achieve?
            </label>
            <textarea
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setIsPrepReady(false);
                setAiPrepSheet("");
              }}
              placeholder="e.g., Learn React hooks and manage my JAMB prep schedule"
              rows="3"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm resize-none"
            ></textarea>
          </div>

          {isPrepReady && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-emerald-300 font-semibold text-sm">
                  AI Prep Sheet Preview
                </p>
                <button
                  type="button"
                  onClick={() => setIsPrepReady(false)}
                  className="text-xs text-emerald-200 hover:text-white underline"
                >
                  Edit goal
                </button>
              </div>
              {aiPrepSheet ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:mt-0 prose-headings:mb-2 prose-ul:my-2 prose-li:my-0">
                  <ReactMarkdown>{aiPrepSheet}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  No detailed prep sheet was returned, but you can still confirm
                  the booking.
                </p>
              )}
            </div>
          )}

          {/* AI Suggested Questions */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-4">
            <p className="flex items-center gap-2 font-semibold text-blue-400 text-sm mb-3">
              ✨ AI Suggested Questions
            </p>
            <ul className="space-y-2">
              {aiQuestions.map((q, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timezone Selector */}
          <div className="p-6 border-t border-slate-800 bg-slate-900">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
            >
              <option value={timezone}>{timezone} (detected)</option>
              <option value="UTC">UTC</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating || isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={
              isPrepReady ? handleConfirmBooking : handleGeneratePrepSheet
            }
            disabled={!canConfirm || isGenerating || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Prep Sheet...
              </>
            ) : isSubmitting ? (
              "Confirming Booking..."
            ) : isPrepReady ? (
              confirmLabel
            ) : (
              "Generate Prep Sheet"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
