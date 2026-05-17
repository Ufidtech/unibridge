import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MentorRescheduleModal({
  open = true,
  initialDate = "",
  initialTime = "",
  onConfirm = () => {},
  onClose = () => {},
}) {
  const [dateTime, setDateTime] = useState(null);
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimezone(tz);
    } catch (e) {
      setTimezone("UTC");
    }
    if (initialDate && initialTime) {
      try {
        setDateTime(
          new Date(
            initialDate +
              "T" +
              (initialTime.length === 5 ? initialTime + ":00" : initialTime),
          ),
        );
      } catch (e) {
        setDateTime(null);
      }
    }
  }, []);

  if (!open) return null;

  const canConfirm = dateTime;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            Reschedule Session
          </h3>
          <p className="text-slate-400 text-sm">
            Pick a new date and time (timezone: {timezone})
          </p>
        </div>
        <div className="p-6">
          <label className="block text-slate-300 text-sm mb-2">
            New Date & Time
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
        </div>
        <div className="p-6 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                sessionDate: dateTime.toISOString().split("T")[0],
                sessionTime: dateTime.toTimeString().slice(0, 5),
                timezone,
              })
            }
            disabled={!canConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:bg-slate-700 cursor-pointer"
          >
            Reschedule
          </button>{" "}
        </div>
      </div>
    </div>
  );
}
