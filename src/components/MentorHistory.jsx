import React, { useState } from 'react';

export default function MentorHistory({ completedSessions, declinedSessions }) {
  const [view, setView] = useState('completed'); // 'completed' or 'declined'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-100">🕰️ Session History</h2>
        
        {/* Toggle Buttons */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setView('completed')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition cursor-pointer ${
              view === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedSessions.length})
          </button>
          <button
            onClick={() => setView('declined')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition cursor-pointer ${
              view === 'declined' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Declined/Cancelled ({declinedSessions.length})
          </button>
        </div>
      </div>

      {/* Completed View */}
      {view === 'completed' && (
        <div className="space-y-4">
          {completedSessions.length > 0 ? (
            completedSessions.map((session) => (
              <div key={session.id} className="bg-slate-900 border-l-4 border-green-500 rounded-r-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{session.mentee?.name || 'Student'}</h3>
                    <p className="text-sm text-slate-400 mt-1">{session.topic}</p>
                    <div className="text-sm text-slate-500 mt-2">
                      {session.sessionDate} • {session.sessionTime}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">
                    Completed
                  </span>
                </div>
                {session.proof && (
                  <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">Completion Notes: </span>
                    {session.notes || 'No notes provided.'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
              No completed sessions yet.
            </div>
          )}
        </div>
      )}

      {/* Declined View */}
      {view === 'declined' && (
        <div className="space-y-4">
          {declinedSessions.length > 0 ? (
            declinedSessions.map((session) => (
              <div key={session.id} className="bg-slate-900 border-l-4 border-red-500 rounded-r-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{session.mentee?.name || 'Student'}</h3>
                    <p className="text-sm text-slate-400 mt-1">{session.topic}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full uppercase">
                    {session.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
              No declined or cancelled sessions.
            </div>
          )}
        </div>
      )}
    </div>
  );
}