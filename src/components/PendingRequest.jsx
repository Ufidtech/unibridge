export default function PendingRequest({ request, onAccept = () => {}, onDecline = () => {} }) {
  return (
    <div className="bg-slate-900 border-2 border-blue-500/30 rounded-lg p-6 mb-6 hover:border-blue-500 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">
            {request.studentName}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {request.studentClass} • {request.dreamCourse}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-semibold rounded-full">
          Pending
        </span>
      </div>

      {/* Topic */}
      <p className="text-slate-300 mb-4">
        <span className="font-semibold">Topic:</span> {request.topic}
      </p>

      {/* AI Pre-Screened Questions Box */}
      <div className="bg-slate-950 border border-blue-600/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <p className="font-semibold text-blue-400 text-sm">
            AI Pre-Screened Questions
          </p>
        </div>
        <ul className="space-y-2">
          {request.aiQuestions.map((question, idx) => (
            <li key={idx} className="text-slate-300 text-sm flex items-start gap-3">
              <span className="text-blue-500 mt-1">•</span>
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onAccept(request.id)}
          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
        >
          ✓ Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
