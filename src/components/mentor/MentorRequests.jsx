import React from 'react';
import PendingRequest from './PendingRequest';
import EmailPreviewPanel from '../EmailPreviewPanel';

export default function MentorRequests({
  pendingRequests,
  loadingSessions,
  sessionsError,
  onAcceptRequest,
  onDeclineRequest
}) {
  return (
    <div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          📬 Session Requests
          {pendingRequests.length > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </h2>
        
        {loadingSessions && <p className="text-slate-400">Loading session requests...</p>}
        {sessionsError && <p className="text-red-400">{sessionsError}</p>}

        {pendingRequests.length > 0 ? (
          <div>
            {pendingRequests.map((request) => (
              <PendingRequest
                key={request.id}
                request={request}
                onAccept={onAcceptRequest}
                onDecline={onDeclineRequest}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-400">
              No pending requests. Great work keeping up! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Dev: Email Preview Panel */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">✉️ Email Previews (dev)</h2>
        <EmailPreviewPanel />
      </div>
    </div>
  );
}