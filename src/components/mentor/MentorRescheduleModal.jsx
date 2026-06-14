import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValidTimeZone, toISODateTime } from "../../lib/session";

export default function MentorRescheduleModal({
  open = true,
  initialDate = "",
  initialTime = "",
  onConfirm = () => {},
  onClose = () => {},
}) {
  const [dateTime, setDateTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedTime, setSelectedTime] = useState(initialTime || "");

  const [timezone, setTimezone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      setTimezone(tz);
    } catch {
      setTimezone("UTC");
    }

    // Load current session date/time
    if (initialDate && initialTime) {
      try {
        const nextDateTime = new Date(
          `${initialDate}T${
            initialTime.length === 5 ? initialTime + ":00" : initialTime
          }`,
        );
        setDateTime(Number.isNaN(nextDateTime.getTime()) ? null : nextDateTime);
        setSelectedDate(initialDate);
        setSelectedTime(initialTime.slice(0, 5));
      } catch {
        setDateTime(null);
      }
    }
  }, [initialDate, initialTime]);

  if (!open) return null;

  const canConfirm = !!dateTime && isValidTimeZone(timezone);

  const handleConfirm = () => {
    if (!dateTime || !isValidTimeZone(timezone)) {
      setError("Please choose a valid date, time, and timezone.");
      return;
    }

    const sessionDate = selectedDate;
    const sessionTime = selectedTime;

    const datetime = toISODateTime({ sessionDate, sessionTime, timezone });

    if (!datetime) {
      setError("The selected time is invalid in the chosen timezone.");
      return;
    }

    setError("");
    onConfirm({
      sessionDate,
      sessionTime,
      timezone,
      datetime,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            Reschedule Session
          </h3>

          <p className="text-sm text-slate-400">Pick a new date and time</p>

          <p className="text-xs text-blue-400 mt-1">Timezone: {timezone}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <label className="block text-sm text-slate-300 mb-2">
            New Date & Time
          </label>

          <DatePicker
            selected={dateTime}
            onChange={(date) => {
              setDateTime(date);
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
            minDate={new Date()}
            minTime={
              dateTime && dateTime.toDateString() === new Date().toDateString()
                ? new Date()
                : new Date(0, 0, 0, 0, 0)
            }
            maxTime={new Date(0, 0, 0, 23, 45)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
            type="button"
          >
            Cancel
          </button>

          <button
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:bg-slate-700 disabled:cursor-not-allowed cursor-pointer"
            type="button"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
