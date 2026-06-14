import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generatePrepSheet } from "../../lib/api/ai";
import { isValidTimeZone, toISODateTime } from "../../lib/session";

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
  price = 0,
  walletBalance = 0,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedTime, setSelectedTime] = useState(initialTime || "");

  const [goal, setGoal] = useState("");
  const [timezone, setTimezone] = useState("");
  const [error, setError] = useState("");
  const [bookingType, setBookingType] = useState("PRIVATE_BOOKING");
  const [mentorPrice] = useState(() => {
    const candidates = [
      price,
      mentor?.mentorProfilePrice,
      mentor?.sessionPrice,
      mentor?.price,
      mentor?.bookingPrice,
      mentor?.pricing?.session,
      mentor?.pricing?.price,
    ];

    for (const value of candidates) {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return 0;
  });

  const [bookingLabels] = useState({
    PRIVATE_BOOKING: "Private booking",
  });
  const [aiQuestions] = useState([
    "What specific areas of React do you want to master?",
    "What challenges are you facing with your JAMB prep?",
  ]);
  const aiPrepSheet = mentor?.aiPrepSheet || null;

  useEffect(() => {
    console.log("BookSessionModal price:", price, mentor);
  }, [price, mentor]);

  const bookingGoalPreview =
    mentor?.bookingGoal || mentor?.goal || mentor?.targetGoal || "";

  // initialize with provided values (for reschedule flows)
  useEffect(() => {
    if (initialDate && initialTime) {
      try {
        const dt = new Date(
          initialDate +
            "T" +
            (initialTime.length === 5 ? initialTime + ":00" : initialTime),
        );
        setSelectedDateTime(Number.isNaN(dt.getTime()) ? null : dt);
        setSelectedDate(initialDate);
        setSelectedTime(initialTime.slice(0, 5));
      } catch {
        setSelectedDateTime(null);
      }
    }

    // detect browser timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimezone(tz);
    } catch {
      setTimezone("UTC");
    }
  }, [initialDate, initialTime]);

  const canConfirm =
    selectedDateTime && goal.trim() && isValidTimeZone(timezone);

  const menteeFee = Number((mentorPrice * 0.1).toFixed(2));
  const mentorFee = Number((mentorPrice * 0.05).toFixed(2));
  const menteeChargeTotal = Number((mentorPrice + menteeFee).toFixed(2));
  const mentorPayout = Number((mentorPrice - mentorFee).toFixed(2));
  const canAffordBooking = Number(walletBalance || 0) >= menteeChargeTotal;

  const handleConfirm = async () => {
    if (!canConfirm) {
      setError("Please choose a valid date, time, and timezone.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const sessionDate = selectedDate;
      const sessionTime = selectedTime;

      const datetime = toISODateTime({ sessionDate, sessionTime, timezone });

      if (!datetime) {
        throw new Error(
          "The selected time does not work in the chosen timezone. Please choose another time.",
        );
      }

      if (!canAffordBooking) {
        throw new Error(
          `Insufficient wallet balance. You need ₦${menteeChargeTotal.toFixed(2)} to book this session, but your wallet has ₦${Number(walletBalance || 0).toFixed(2)}.`,
        );
      }

      const data = await generatePrepSheet(goal.trim());

      onConfirm({
        mentorName: mentor.name,
        date: sessionDate,
        time: sessionTime,
        datetime,
        timezone,
        goal,
        bookingType,
        bookingLabel: bookingLabels[bookingType] || bookingType,
        priceSummary: {
          mentorPrice,
          menteeFee,
          mentorFee,
          menteeChargeTotal,
          mentorPayout,
        },
        aiPrepSheet: data.prepSheet || null,
      });
    } catch (error) {
      console.error("Booking confirmation failed:", error);
      setError(error.message || "Unable to confirm booking.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {mentor.initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-100">{mentor.name}</h3>
              <p className="text-xs text-slate-400">
                {mentor.level} • {mentor.university}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              Select Date & Time
            </label>
            <DatePicker
              selected={selectedDateTime}
              onChange={(date) => {
                setSelectedDateTime(date);
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const hours = String(date.getHours()).padStart(2, "0");
                  const minutes = String(date.getMinutes()).padStart(2, "0");
                  setSelectedDate(`${year}-${month}-${day}`);
                  setSelectedTime(`${hours}:${minutes}`);
                }
              }}
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
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Learn React hooks and manage my JAMB prep schedule"
              rows="3"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm resize-none"
            ></textarea>
          </div>

          <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  {bookingLabels[bookingType] || "Private booking"}
                </p>
                <p className="text-xs text-slate-400">
                  Secure payment is collected before the session is marked
                  active.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                Recommended
              </span>
            </div>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="PRIVATE_BOOKING">Private booking</option>
            </select>
            <p className="mt-2 text-xs text-slate-400">
              Money is collected from the mentee first. After completion, the
              mentor payout is created automatically.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-slate-300">
              <div className="rounded-lg bg-slate-950/50 p-3">
                <div className="text-slate-500">Session price</div>
                <div className="font-semibold text-base">
                  ₦{mentorPrice.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/50 p-3">
                <div className="text-slate-500">Total to pay</div>
                <div className="font-semibold text-base">
                  ₦{menteeChargeTotal.toFixed(2)}
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Freemium discovery remains visible, while premium booking uses
              this checkout flow.
            </p>
            <p
              className={`mt-2 text-xs ${canAffordBooking ? "text-emerald-300" : "text-red-300"}`}
            >
              Wallet balance: ₦{Number(walletBalance || 0).toFixed(2)}
              {canAffordBooking
                ? " — enough to book this session."
                : ` — you need ₦${menteeChargeTotal.toFixed(2)} to continue.`}
            </p>
          </div>

          {bookingGoalPreview && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mentee booking goal
              </p>
              <p className="mt-1 text-slate-200 text-sm leading-6">
                {bookingGoalPreview}
              </p>
            </div>
          )}

          {aiPrepSheet && (
            <div className="bg-emerald-600/10 border border-emerald-600/25 rounded-lg p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-emerald-300 mb-2">
                Session summary
              </p>
              <p className="text-slate-200 text-sm leading-6">
                {aiPrepSheet.summary ||
                  aiPrepSheet.title ||
                  "AI-generated session summary"}
              </p>
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
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || !canAffordBooking || isGenerating}
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
                Preparing Session...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
