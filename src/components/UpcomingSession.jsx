export default function UpcomingSession({ session, onJoinMeet = () => {} }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-4 hover:border-blue-500 transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Session Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
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
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="text-sm">
          <p className="text-slate-300 font-medium">
            📅 {session.date}
          </p>
          <p className="text-slate-400">
            🕐 {session.time}
          </p>
        </div>

        {/* Join Button */}
        <button
          onClick={() => onJoinMeet(session.id)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition whitespace-nowrap"
        >
          Join Google Meet
        </button>
      </div>
    </div>
  );
}
