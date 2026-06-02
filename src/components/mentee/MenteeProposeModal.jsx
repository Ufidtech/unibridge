import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValidTimeZone, toISODateTime } from "../../lib/session";

export default function MenteeProposeModal({
  open = true,
  initialDate = "",
  initialTime = "",
  onConfirm = () => {},
  onClose = () => {},
}) {
  const [dateTime, setDateTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [timezone, setTimezone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimezone(tz);
    } catch {
      setTimezone("UTC");
    }
    if (initialDate && initialTime) {
      try {
        const nextDateTime = new Date(
          initialDate +
            "T" +
            (initialTime.length === 5 ? initialTime + ":00" : initialTime),
        );
        setDateTime(Number.isNaN(nextDateTime.getTime()) ? null : nextDateTime);
      } catch {
        setDateTime(null);
      }
    }
  }, []);

  if (!open) return null;

  const canConfirm = dateTime && isValidTimeZone(timezone);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Propose New Time</h3>
          <p className="text-slate-400 text-sm">
            Suggest a new date/time for your session (timezone: {timezone})
          </p>
        </div>
        <div className="p-6">
          <label className="block text-slate-300 text-sm mb-2">
            Date & Time
          </label>
          <DatePicker
            selected={dateTime}
            onChange={(d) => setDateTime(d)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 mb-4"
          />
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block text-slate-300 text-sm mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 mb-4"
            rows={3}
          />
        </div>
        <div className="p-6 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!canConfirm) {
                setError("Please choose a valid date, time, and timezone.");
                return;
              }

              const sessionDate = dateTime.toISOString().split("T")[0];
              const sessionTime = dateTime.toTimeString().slice(0, 5);
              const datetime = toISODateTime({
                sessionDate,
                sessionTime,
                timezone,
              });

              if (!datetime) {
                setError(
                  "The selected time is invalid in the chosen timezone.",
                );
                return;
              }

              setError("");
              onConfirm({
                datetime,
                notes,
                timezone,
              });
            }}
            disabled={!canConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:bg-slate-700"
          >
            Propose
          </button>
        </div>
      </div>
    </div>
  );
}
