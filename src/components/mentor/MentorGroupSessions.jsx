import { useEffect, useState } from "react";
import { fetchGroupSessions } from "../../lib/api/sessions";
import MentorGroupSessionFormModal from "./MentorGroupSessionFormModal";

export default function MentorGroupSessions() {
  const [groupSessions, setGroupSessions] = useState([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(false);
  const [groupSessionsError, setGroupSessionsError] = useState(null);
  const [showGroupCreate, setShowGroupCreate] = useState(false);

  async function loadGroupSessions() {
    setLoadingGroupSessions(true);
    setGroupSessionsError(null);

    try {
      const data = await fetchGroupSessions();
      setGroupSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (err) {
      console.error("Failed to load group sessions:", err);
      setGroupSessionsError(String(err.message || err));
      setGroupSessions([]);
    } finally {
      setLoadingGroupSessions(false);
    }
  }

  useEffect(() => {
    loadGroupSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Group Sessions</h2>
        <button
          onClick={() => setShowGroupCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create Group Session
        </button>
      </div>

      <MentorGroupSessionFormModal
        open={showGroupCreate}
        onClose={() => setShowGroupCreate(false)}
        onSubmit={async (groupForm) => {
          const { createGroupSession } = await import("../../lib/api/sessions");
          await createGroupSession({
            title: groupForm.title.trim(),
            description: groupForm.description.trim(),
            datetime: new Date(groupForm.datetime).toISOString(),
            durationMinutes: Number(groupForm.durationMinutes) || 60,
            capacity: Number(groupForm.capacity) || 50,
            isRecorded: !!groupForm.isRecorded,
          });
          setShowGroupCreate(false);
          await loadGroupSessions();
        }}
      />

      {groupSessionsError && (
        <div className="text-red-400 text-sm">{groupSessionsError}</div>
      )}

      {loadingGroupSessions ? (
        <p className="text-slate-400">Loading group sessions...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4"
            >
              <div className="text-slate-100 font-semibold">
                {session.title}
              </div>
              <div className="text-slate-400 text-sm mt-1">
                {session.datetime}
              </div>
              <div className="text-slate-300 text-sm mt-2">
                {session.description || "No description"}
              </div>
              <div className="text-slate-500 text-xs mt-3">
                {session.durationMinutes || 60} mins • Capacity{" "}
                {session.capacity || "unlimited"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
