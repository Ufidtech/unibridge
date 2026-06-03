// React import not required in modern JSX runtimes
import PendingRequest from "./PendingRequest";
import EmailPreviewPanel from "../EmailPreviewPanel";
import { useState } from "react";

export default function MentorRequests({
  pendingRequests,
  loadingSessions,
  sessionsError,
  onAcceptRequest,
  onDeclineRequest,
}) {
  const [compact, setCompact] = useState(false);
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

        {loadingSessions && (
          <p className="text-slate-400">Loading session requests...</p>
        )}
        {sessionsError && <p className="text-red-400">{sessionsError}</p>}

        {pendingRequests.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompact((c) => !c)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition text-sm"
                >
                  {compact ? "Grid view" : "Compact list"}
                </button>
              </div>
            </div>

            <div className={compact ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
              {pendingRequests.map((request) => (
                <PendingRequest
                  key={request.id}
                  request={request}
                  onAccept={onAcceptRequest}
                  onDecline={onDeclineRequest}
                  compact={compact}
                />
              ))}
            </div>
          </>
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
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          ✉️ Email Previews (dev)
        </h2>
        <EmailPreviewPanel />
      </div>
    </div>
  );
}
