export default function UpcomingSession({ session, onJoinMeet = () => {}, onReschedule = () => {}, onMarkComplete = () => {} }) {
  return (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-blue-500 transition min-h-[240px] flex flex-col justify-between">
      <div>
        {/* Session Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {session.studentInitials}
          </div>
          <div>
            <h4 className="font-bold text-slate-100">
              {session.studentName}
            </h4>
            <p className="text-sm text-slate-400">
              {session.studentClass} • {session.topic}
            </p>
            {session.studentDreamCourse && (
              <p className="text-xs text-slate-500 mt-1">🎯 Dream: {session.studentDreamCourse}</p>
            )}
          </div>
        </div>

        <div className="text-sm text-slate-300 mb-2">
          📅 {session.date} • 🕐 {session.time}
        </div>
      </div>

      {/* Footer with actions */}
      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-1">
          <button
            onClick={() => onJoinMeet(session.id)}
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition"
          >
            Join Google Meet
          </button>

          <button
            onClick={() => onReschedule(session.id)}
            className="w-full sm:w-auto px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium rounded-md transition"
          >
            Reschedule
          </button>

          <button
            onClick={() => onMarkComplete(session.id)}
            className="w-full sm:w-auto px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-md transition"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}
