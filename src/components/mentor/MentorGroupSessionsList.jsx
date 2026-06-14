import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  fetchMentorSessions,
  notifyRegisteredMentees,
  cancelMentorSession,
  completeMentorSession,
} from "../../lib/api/sessions";

import GroupSessionCreate from "./GroupSessionCreate";

export default function MentorGroupSessionsList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState({
    proof: "",
    notes: "",
    sessionId: null,
  });

  const [showUsersModal, setShowUsersModal] = useState(false);

  const [selectedSessionUsers, setSelectedSessionUsers] = useState([]);

  const [sendingReminder, setSendingReminder] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);

      setError(null);

      const data = await fetchMentorSessions();

      setSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch (err) {
      console.log(err);

      setError(err.message || "Failed loading sessions");
    } finally {
      setLoading(false);
    }
  }

  async function sendReminder(sessionId) {
    try {
      setSendingReminder((prev) => ({
        ...prev,
        [sessionId]: true,
      }));

      const response = await notifyRegisteredMentees(sessionId);

      toast.success(response.message || "Reminder sent");
    } catch (err) {
      toast.error(err.message || "Failed sending reminder");
    } finally {
      setSendingReminder((prev) => ({
        ...prev,
        [sessionId]: false,
      }));
    }
  }

  async function handleDelete(sessionId) {
    // Open delete modal
    setDeleteSessionId(sessionId);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteSessionId) return;

    try {
      await cancelMentorSession(deleteSessionId);

      toast.success("Session cancelled");

      setShowDeleteModal(false);
      setDeleteSessionId(null);

      await loadSessions();
    } catch (err) {
      toast.error(err.message || "Failed to cancel session");
    }
  }

  function openEdit(session) {
    setEditingSession(session);
    setShowModal(true);
  }

  function openComplete(session) {
    setCompleteData({ proof: "", notes: "", sessionId: session.id });
    setShowCompleteModal(true);
  }

  async function submitComplete() {
    try {
      const { sessionId, proof, notes } = completeData;
      await completeMentorSession(sessionId, proof, notes);
      toast.success("Session marked complete");
      setShowCompleteModal(false);
      await loadSessions();
    } catch (err) {
      toast.error(err.message || "Failed to complete session");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div
        className="
flex
justify-between
items-center
"
      >
        <div>
          <h1
            className="
text-2xl
font-bold
text-white
"
          >
            Group Sessions
          </h1>

          <p
            className="
text-slate-400
text-sm
"
          >
            Manage mentor-created sessions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
bg-blue-600
hover:bg-blue-500
px-4
py-2
rounded-lg
text-white
cursor-pointer
"
        >
          + Create Session
        </button>
      </div>

      {/* Loading */}

      {loading && (
        <div
          className="
text-slate-300
"
        >
          Loading sessions...
        </div>
      )}

      {/* Error */}

      {error && (
        <div
          className="
bg-red-900
rounded-lg
p-4
text-red-300
"
        >
          {error}
        </div>
      )}

      {/* Empty */}

      {!loading && !sessions.length && (
        <div
          className="
bg-slate-900
rounded-lg
p-6
text-slate-400
"
        >
          No sessions available
        </div>
      )}

      {/* Session Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between"
          >
            {/* Top */}
            <div
              className="
flex
justify-between
items-start
"
            >
              <div>
                <h2
                  className="
text-xl
font-bold
text-white
"
                >
                  {session.topic}
                </h2>

                <p
                  className="
text-slate-400
text-sm
mt-1
"
                >
                  {session.notes || "No description"}
                </p>
              </div>

              <span
                className={`
px-3
py-1
rounded-full
text-xs
font-semibold

${
  session.status === "OPEN"
    ? "bg-green-900 text-green-300"
    : "bg-red-900 text-red-300"
}
`}
              >
                {session.status}
              </span>
            </div>
            {/* Details */}
            <div
              className="
grid
grid-cols-2
gap-5
mt-6
"
            >
              <div>
                <div
                  className="
text-xs
uppercase
text-slate-500
"
                >
                  Session Date
                </div>

                <div className="text-white">{session.sessionDate}</div>
              </div>

              <div>
                <div
                  className="
text-xs
uppercase
text-slate-500
"
                >
                  Session Time
                </div>

                <div className="text-white">{session.sessionTime}</div>
              </div>

              <div>
                <div
                  className="
text-xs
uppercase
text-slate-500
"
                >
                  Mentor
                </div>

                <div className="text-white">{session.mentor?.name}</div>
              </div>

              <div>
                <div
                  className="
text-xs
uppercase
text-slate-500
"
                >
                  Meeting Provider
                </div>

                <div className="text-white">
                  {session.meetingProvider === "GOOGLE_MEET"
                    ? "Google Meet"
                    : "Temporary Room"}
                </div>
              </div>
            </div>
            {/* Registered */}
            <div
              className="
mt-6
flex
justify-between
items-center
"
            >
              <div>
                <div
                  className="
text-xs
uppercase
text-slate-500
"
                >
                  Registered Mentees
                </div>

                <div className="text-white">
                  {session.registeredMentees?.length || 0}

                  {" / "}

                  {session.maxParticipants}
                </div>
              </div>

              {session.registeredMentees?.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedSessionUsers(session.registeredMentees);

                    setShowUsersModal(true);
                  }}
                  className="
bg-slate-800
hover:bg-slate-700
px-4
py-2
rounded-lg
text-white
cursor-pointer
"
                >
                  View Users
                </button>
              )}
            </div>
            {/* Actions */}
            gap-3
            <div className="flex gap-2 mt-6 flex-wrap justify-end">
              <button
                onClick={() => sendReminder(session.id)}
                disabled={sendingReminder[session.id]}
                className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-md text-white cursor-pointer text-sm"
              >
                {sendingReminder[session.id] ? "Sending..." : "Send Reminder"}
              </button>

              {session.meetLink && (
                <a
                  href={session.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-white cursor-pointer text-sm"
                >
                  Join Session
                </a>
              )}

              {/* Edit / Delete / Complete actions */}
              <button
                onClick={() => openEdit(session)}
                className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1.5 rounded-md text-white cursor-pointer text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(session.id)}
                className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md text-white cursor-pointer text-sm"
              >
                Delete
              </button>

              <button
                onClick={() => openComplete(session)}
                className="bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-md text-white cursor-pointer text-sm"
              >
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Users Modal */}

      {showUsersModal && (
        <div
          className="
fixed
inset-0
bg-black/70
flex
items-center
justify-center
z-50
"
        >
          <div
            className="
bg-slate-900
rounded-xl
w-full
max-w-3xl
mx-4
relative
p-6
max-h-[85vh]
overflow-y-auto
"
          >
            <button
              onClick={() => {
                setShowUsersModal(false);

                setSelectedSessionUsers([]);
              }}
              className="
absolute
top-4
right-5
text-white
text-2xl
cursor-pointer
"
            >
              ×
            </button>

            <h2
              className="
text-2xl
font-bold
text-white
mb-1
"
            >
              Registered Mentees
            </h2>

            <p
              className="
text-slate-400
mb-6
"
            >
              View registered mentee details
            </p>

            <div
              className="
space-y-4
"
            >
              {selectedSessionUsers.map((user, index) => (
                <div
                  key={user.id || index}
                  className="
    bg-slate-800
    rounded-xl
    p-5
    border
    border-slate-700
    "
                >
                  {/* User Header */}

                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="
        w-14
        h-14
        rounded-full
        bg-slate-700
        flex
        items-center
        justify-center
        text-white
        font-bold
        text-lg
        "
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <div className="text-lg font-bold text-white">
                        {user.name || "Unknown User"}
                      </div>

                      <div className="text-slate-400 text-sm">
                        Registered Mentee
                      </div>
                    </div>
                  </div>

                  {/* User Details */}

                  <div
                    className="
      grid
      grid-cols-1
      md:grid-cols-2
      gap-5
      "
                  >
                    {/* Email */}

                    {user.email && (
                      <div>
                        <div
                          className="
          text-xs
          uppercase
          text-slate-500
          "
                        >
                          Email Address
                        </div>

                        <div
                          className="
          text-white
          break-all
          "
                        >
                          {user.email}
                        </div>
                      </div>
                    )}

                    {/* Edit/Create Modal (reuses GroupSessionCreate) */}
                    {/* Users Modal content (no nested edit/complete modals) */}

                    {/* Phone */}

                    {user.phone && (
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          Phone Number
                        </div>

                        <div className="text-white">{user.phone}</div>
                      </div>
                    )}

                    {/* University */}

                    {user.university && (
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          University
                        </div>

                        <div className="text-white">{user.university}</div>
                      </div>
                    )}

                    {/* Department */}

                    {user.department && (
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          Department
                        </div>

                        <div className="text-white">{user.department}</div>
                      </div>
                    )}

                    {/* Level */}

                    {user.level && (
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          Level
                        </div>

                        <div className="text-white">{user.level}</div>
                      </div>
                    )}

                    {/* Bio */}

                    {user.bio && (
                      <div className="md:col-span-2">
                        <div className="ext-xs uppercase text-slate-500">
                          Bio
                        </div>

                        <div className="text-white">{user.bio}</div>
                      </div>
                    )}

                    {/* Registration Date */}

                    {user.registeredAt && (
                      <div className="md:col-span-2">
                        <div className="text-xs uppercase text-slate-500">
                          Registration Date
                        </div>

                        <div className="text-white">
                          {new Date(user.registeredAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}

      {showModal && (
        <div
          className="
fixed
inset-0
bg-black/70
flex
justify-center
items-center
z-50
"
        >
          <div
            className="
bg-slate-900
rounded-xl
w-full
max-w-2xl
mx-4
relative
max-h-[90vh]
overflow-y-auto
"
          >
            <button
              onClick={() => {
                setShowModal(false);
                setEditingSession(null);
              }}
              className="
absolute
top-4
right-5
text-white
text-2xl
cursor-pointer
"
            >
              ×
            </button>

            <GroupSessionCreate
              onSessionCreated={() => {
                loadSessions();
                setShowModal(false);
                setEditingSession(null);
              }}
              initialValues={editingSession}
              onDelete={(id) => {
                setDeleteSessionId(id);
                setShowDeleteModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Top-level Complete Modal (moved out of users modal so it always appears) */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-3">
              Complete Session
            </h3>

            <div className="mb-3">
              <label className="block text-sm text-slate-300">
                Proof (URL)
              </label>
              <input
                type="text"
                value={completeData.proof}
                onChange={(e) =>
                  setCompleteData((p) => ({ ...p, proof: e.target.value }))
                }
                className="w-full p-2 rounded bg-slate-800 text-white"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-slate-300">Notes</label>
              <textarea
                value={completeData.notes}
                onChange={(e) =>
                  setCompleteData((p) => ({ ...p, notes: e.target.value }))
                }
                className="w-full p-2 rounded bg-slate-800 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitComplete}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white"
              >
                Submit
              </button>

              <button
                onClick={() => setShowCompleteModal(false)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteSessionId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-2">
              Confirm Delete
            </h3>

            <p className="text-slate-300 mb-4">
              Are you sure you want to cancel this session? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteSessionId(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
