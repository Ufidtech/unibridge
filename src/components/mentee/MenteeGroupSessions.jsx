import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchGroupSessions, joinGroupSession } from "../../lib/api/sessions";
import MenteeSessions from "./MenteeSessions";

export default function MenteeGroupSessions({
  onNavigate = () => {},
  mentors = [],
}) {
  const [groupSessions, setGroupSessions] = useState([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingGroupSessions(true);
        const data = await fetchGroupSessions();
        setGroupSessions(Array.isArray(data.sessions) ? data.sessions : []);
      } catch (err) {
        console.error("Failed to load group sessions:", err);
      } finally {
        setLoadingGroupSessions(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4 break-words">
          Free Group Sessions
        </h2>
        {loadingGroupSessions && (
          <p className="text-slate-400">Loading group sessions...</p>
        )}
        {!loadingGroupSessions && groupSessions.length === 0 && (
          <p className="text-slate-400">No upcoming group sessions yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-w-0"
            >
              <div className="text-slate-100 font-semibold break-words">
                {session.title}
              </div>
              <div className="text-slate-400 text-sm mt-1 break-words">
                By {session.mentorName || "Mentor"}
              </div>
              <div className="text-slate-300 text-sm mt-2 break-words">
                {session.description || "Free group session"}
              </div>
              <div className="text-slate-400 text-xs mt-3 break-words">
                {session.datetime} • {session.durationMinutes || 60} mins
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    try {
                      setJoiningSessionId(session.id);
                      const result = await joinGroupSession(session.id);
                      toast.success("Joined group session");
                      setGroupSessions((prev) =>
                        prev.map((item) =>
                          item.id === session.id
                            ? {
                                ...item,
                                attendees: Array.isArray(result.attendees)
                                  ? result.attendees
                                  : item.attendees,
                              }
                            : item,
                        ),
                      );
                    } catch (err) {
                      toast.error(err.message || "Failed to join session");
                    } finally {
                      setJoiningSessionId(null);
                    }
                  }}
                  disabled={joiningSessionId === session.id}
                  className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {joiningSessionId === session.id
                    ? "Joining..."
                    : "Join Free Session"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MenteeSessions onNavigate={onNavigate} mentors={mentors} />
    </div>
  );
}
