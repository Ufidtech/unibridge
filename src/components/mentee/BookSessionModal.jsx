import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function BookSessionModal({ mentor = {
  name: 'Umar Farooq',
  initials: 'UF',
  level: '300L',
  university: 'FUT Minna',
  bio: 'Frontend Dev and AI enthusiast',
}, onConfirm = () => {}, onClose = () => {}, initialDate = '', initialTime = '', confirmLabel = 'Confirm Booking' }) {
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [goal, setGoal] = useState('');
  const [timezone, setTimezone] = useState('');
  const [aiQuestions] = useState([
    "What specific areas of React do you want to master?",
    "What challenges are you facing with your JAMB prep?",
  ]);

  const timeSlots = ['2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  const dateOptions = [
    '2026-05-15',
    '2026-05-16',
    '2026-05-17',
    '2026-05-18',
  ];

  // initialize with provided values (for reschedule flows)
  useEffect(() => {
    if (initialDate && initialTime) {
      try {
        const dt = new Date(initialDate + 'T' + (initialTime.length === 5 ? initialTime + ':00' : initialTime));
        setSelectedDateTime(dt);
      } catch (e) {
        setSelectedDateTime(null);
      }
    }
    // detect browser timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setTimezone(tz);
    } catch (e) {
      setTimezone('UTC');
    }
  }, [initialDate, initialTime]);

  const canConfirm = selectedDateTime && goal.trim();

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm({
        mentorName: mentor.name,
        datetime: selectedDateTime ? selectedDateTime.toISOString() : null,
        timezone,
        goal: goal,
      });
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
              <h3 className="font-bold text-slate-100">
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
            <label className="block text-slate-300 font-semibold mb-2 text-sm">Select Date & Time</label>
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
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Learn React hooks and manage my JAMB prep schedule"
              rows="3"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm resize-none"
            ></textarea>
          </div>

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
            <label className="block text-slate-300 font-semibold mb-2 text-sm">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm">
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
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
