import { useEffect, useState } from "react";
import { fetchMentorSessions, createGroupSession } from "../../lib/api/sessions";
import GroupSessionCreate from "./GroupSessionCreate";
import toast from "react-hot-toast";

export default function MentorGroupSessions() {
  const [groupSessions, setGroupSessions] = useState([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(false);
  const [groupSessionsError, setGroupSessionsError] = useState(null);
  const [showGroupCreate, setShowGroupCreate] = useState(false);

  async function loadGroupSessions() {
    try {
      setLoadingGroupSessions(true);
      setGroupSessionsError(null);

      const data = await fetchMentorSessions();

      setGroupSessions(
        Array.isArray(data.sessions)
          ? data.sessions
          : []
      );
    } catch (err) {
      console.error(err);
      setGroupSessionsError(
        err.message || "Failed to load sessions"
      );
    } finally {
      setLoadingGroupSessions(false);
    }
  }

  useEffect(() => {
    loadGroupSessions();
  }, []);

  async function handleCreateSession(groupForm) {
    try {
      const sessionDateTime = new Date(groupForm.datetime);

      await createGroupSession({
        topic: groupForm.title.trim(),

        notes: groupForm.description.trim(),

        sessionDate: sessionDateTime
          .toISOString()
          .split("T")[0],

        sessionTime: sessionDateTime
          .toTimeString()
          .slice(0, 5),

        timezone:
          Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone,

        maxParticipants:
          Number(groupForm.capacity) || 50,
      });

      toast.success(
        "Session created successfully"
      );

      setShowGroupCreate(false);

      await loadGroupSessions();
    } catch (err) {
      toast.error(
        err.message ||
          "Failed to create session"
      );
    }
  }

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">
          Group Sessions
        </h2>

        <button
          onClick={() => setShowGroupCreate(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          Create Group Session
        </button>
      </div>

      {/* Create Modal - reuse GroupSessionCreate used in MentorDashboard */}
      {showGroupCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowGroupCreate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            <GroupSessionCreate
              onSessionCreated={async () => {
                await loadGroupSessions();
                setShowGroupCreate(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {groupSessionsError && (
        <div className="text-red-400">
          {groupSessionsError}
        </div>
      )}

      {/* Loading */}
      {loadingGroupSessions ? (
        <div className="text-slate-400">
          Loading sessions...
        </div>
      ) : groupSessions.length === 0 ? (
        <div className="text-slate-500">
          No group sessions created yet.
        </div>
      ) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              {/* Topic */}
              <h3 className="text-lg font-bold text-slate-100">
                {session.topic}
              </h3>

              {/* Notes */}
              <p className="text-slate-400 mt-2 text-sm">
                {session.notes ||
                  "No description provided"}
              </p>

              {/* Session Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="text-slate-300">
                  📅 {session.sessionDate}
                </div>

                <div className="text-slate-300">
                  ⏰ {session.sessionTime}
                </div>

                <div className="text-slate-300">
                  👥{" "}
                  {
                    session.registeredMentees
                      ?.length
                  }
                  /
                  {session.maxParticipants}
                </div>

                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      session.status ===
                      "OPEN"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                {session.meetingProvider && (
                  <div className="text-slate-400 text-xs">
                    Provider:{" "}
                    {
                      session.meetingProvider
                    }
                  </div>
                )}
              </div>

              {/* Meeting Link */}
              {session.meetLink && (
                <div className="mt-4">
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Open Meeting Room
                  </a>
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}