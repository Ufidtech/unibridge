import { useState } from 'react';

export default function SuccessModal({ sessionDetails = {
  mentorName: 'Umar Farooq',
  date: '2026-05-15',
  time: '2:00 PM',
  meetLink: 'https://meet.google.com/abc-defg-hij',
}, onClose = () => {} }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Review the AI pre-screened questions', completed: false },
    { id: 2, text: 'Prepare your notes and questions', completed: false },
    { id: 3, text: 'Test your internet connection', completed: false },
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionDetails.meetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleChecklistItem = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const formattedDate = new Date(sessionDetails.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border-b border-green-500/30 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Session Confirmed!
          </h2>
          <p className="text-slate-400 text-sm">
            Your booking with {sessionDetails.mentorName} is confirmed
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* Session Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wide">
              Session Details
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-100 font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-slate-100 font-medium">{sessionDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mentor:</span>
                <span className="text-slate-100 font-medium">{sessionDetails.mentorName}</span>
              </div>
            </div>
          </div>

          {/* Google Meet Link */}
          <div>
            <p className="text-slate-300 font-semibold text-sm mb-2">
              Google Meet Link
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionDetails.meetLink}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  copiedLink
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {copiedLink ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* AI Prep Sheet */}
          <div>
            <p className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
              ✨ AI Prep Sheet
            </p>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition text-left group"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}
                  >
                    {item.completed && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.completed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
