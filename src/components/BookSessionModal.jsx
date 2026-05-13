import { useState } from 'react';

export default function BookSessionModal({ mentor = {
  name: 'Umar Farooq',
  initials: 'UF',
  level: '300L',
  university: 'FUT Minna',
  bio: 'Frontend Dev and AI enthusiast',
}, onConfirm = () => {}, onClose = () => {} }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [goal, setGoal] = useState('');
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

  const canConfirm = selectedDate && selectedTime && goal.trim();

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm({
        mentorName: mentor.name,
        date: selectedDate,
        time: selectedTime,
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
          {/* Date Picker */}
          <div className="mb-4">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            >
              <option value="">Choose a date...</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time Picker */}
          <div className="mb-4">
            <label className="block text-slate-300 font-semibold mb-2 text-sm">
              Select Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
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
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
