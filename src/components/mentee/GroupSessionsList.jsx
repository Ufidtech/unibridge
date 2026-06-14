import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { fetchMe } from "../../lib/api/auth";
import {
  fetchSessionsForMentees,
  rsvpMentorGroupSession,
} from "../../lib/api/sessions";
import { fetchUserProfile } from "../../lib/api/auth";

export default function GroupSessionsList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(null);
  const [confirmSession, setConfirmSession] = useState(null);
  const [mentorModal, setMentorModal] = useState({
    open: false,
    mentor: null,
    loading: false,
    error: null,
  });
  const mentorCache = useRef({});

  // pagination / progressive reveal to improve perceived load
  const [allSessions, setAllSessions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  async function openMentorModal(mentorId) {
    setMentorModal({ open: true, mentor: null, loading: true, error: null });
    try {
      if (mentorCache.current[mentorId]) {
        setMentorModal({
          open: true,
          mentor: mentorCache.current[mentorId],
          loading: false,
          error: null,
        });
        return;
      }

      const data = await fetchUserProfile(mentorId);
      mentorCache.current[mentorId] = data;
      setMentorModal({ open: true, mentor: data, loading: false, error: null });
    } catch (err) {
      setMentorModal({
        open: true,
        mentor: null,
        loading: false,
        error: err.message || "Failed to load mentor details",
      });
    }
  }

  function closeMentorModal() {
    setMentorModal({ open: false, mentor: null, loading: false, error: null });
  }

  useEffect(() => {
    // fetch user + sessions in parallel to reduce waiting time
    async function boot() {
      setLoading(true);
      try {
        const [meData, sessionsData] = await Promise.all([
          fetchMe().catch(() => null),
          fetchSessionsForMentees().catch(() => null),
        ]);
        if (meData) setUser(meData);

        const loaded = Array.isArray(sessionsData)
          ? sessionsData
          : (sessionsData && sessionsData.sessions) || [];
        setAllSessions(loaded);
        setSessions(loaded.slice(0, visibleCount));
      } catch (err) {
        setError(err?.message || "Failed loading sessions");
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, [visibleCount]);

  // helper to reveal more sessions on demand
  function showMore() {
    const next = visibleCount + 6;
    setVisibleCount(next);
    setSessions(allSessions.slice(0, next));
  }

  const me = user?.user || user;
  const myId = me?.uid || me?.id;

  function getSessionState(session, myId) {
    const isRegistered = session.registeredMentees?.some((m) => m.id === myId);

    const now = new Date();
    const sessionDateTime = new Date(
      `${session.sessionDate} ${session.sessionTime}`,
    );

    const isPast = now > sessionDateTime;
    const isLive = Math.abs(now - sessionDateTime) < 1000 * 60 * 30; // 30 min window

    if (!isRegistered) return "NOT_REGISTERED";
    if (isPast) return "COMPLETED";
    if (isLive) return "LIVE";
    return "REGISTERED";
  }

  async function handleRSVP(session) {
    // optimistic update: add me to registeredMentees locally while API call proceeds
    const prevAll = allSessions.slice();
    try {
      setRsvpLoading(session.id);

      const updated = allSessions.map((s) => {
        if (s.id !== session.id) return s;
        const copy = { ...s };
        const existing = Array.isArray(copy.registeredMentees)
          ? copy.registeredMentees.slice()
          : [];
        existing.push({ id: myId, name: me?.name || me?.displayName || "You" });
        copy.registeredMentees = existing;
        return copy;
      });

      setAllSessions(updated);
      setSessions(updated.slice(0, visibleCount));

      await rsvpMentorGroupSession(session.id);
      toast.success("Successfully registered");
      setConfirmSession(null);
    } catch (err) {
      // rollback
      setAllSessions(prevAll);
      setSessions(prevAll.slice(0, visibleCount));
      toast.error(err?.message || "Registration failed");
    } finally {
      setRsvpLoading(null);
    }
  }

  if (loading) {
    // lightweight skeleton cards to improve perceived performance
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
            <div className="h-20 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  if (error) return <div className="text-red-400 p-6">{error}</div>;

  return (
    <div className="space-y-6">
      {sessions.length === 0 && allSessions.length === 0 && (
        <div className="p-6 text-slate-400">
          No group sessions are available right now. Check back later.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const state = getSessionState(session, myId);

          const labelConfig = {
            NOT_REGISTERED: {
              text: "Open to Join",
              classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            },
            REGISTERED: {
              text: "Registered",
              classes:
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            },
            LIVE: {
              text: "🔴 Live Now",
              classes:
                "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
            },
            COMPLETED: {
              text: "Ended",
              classes: "bg-slate-800 text-slate-400 border-slate-700",
            },
          };

          const currentLabel = labelConfig[state] || labelConfig.NOT_REGISTERED;

          return (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:border-slate-700/80 transition-all duration-200"
            >
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="space-y-2">
                  {/* TOPIC LABEL */}
                  <div className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                    TOPIC:
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                    {session.topic}
                  </h2>

                  {/* DATE LABEL & ROW */}
                  <div className="pt-1">
                    <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                      DATE & TIME:
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <span>📅 {session.sessionDate}</span>
                      <span className="text-slate-600">•</span>
                      <span>⏰ {session.sessionTime}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 w-fit sm:self-start ${currentLabel.classes}`}
                >
                  {currentLabel.text}
                </span>
              </div>

              {/* DESCRIPTION LABEL & CONTENT */}
              <div className="mt-4 mb-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                  DESCRIPTION:
                </div>
                {session.notes ? (
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                    {session.notes}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm italic bg-slate-950/10 p-3 rounded-lg border border-dashed border-slate-800/40">
                    No additional notes provided for this session.
                  </p>
                )}
              </div>

              {/* Meta Information Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-t border-slate-800/60 pt-4 mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    Host Mentor:
                  </span>
                  <span className="text-slate-200 font-medium">
                    {session.mentor?.name || "Assigned Mentor"}
                  </span>
                </div>

                {session.mentor?.id && (
                  <div className="mt-2">
                    <button
                      onClick={() => openMentorModal(session.mentor.id)}
                      className="text-blue-400 underline text-sm font-medium bg-transparent p-0 hover:text-blue-300 transition"
                      aria-label={`View details for ${session.mentor?.name || "mentor"}`}
                    >
                      View Mentor Details
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400 sm:justify-end">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    Availability:
                  </span>
                  <span className="text-slate-200 font-medium">
                    {session.registeredMentees?.length || 0} /{" "}
                    {session.maxParticipants || "∞"} slots filled
                  </span>
                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="flex items-center justify-end pt-2">
                {state === "NOT_REGISTERED" && (
                  <button
                    onClick={() => setConfirmSession(session)}
                    disabled={rsvpLoading === session.id}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 px-5 py-2 rounded-lg text-white cursor-pointer transition text-sm font-semibold shadow-lg shadow-blue-600/10"
                  >
                    {rsvpLoading === session.id
                      ? "Registering..."
                      : "Reserve Spot"}
                  </button>
                )}

                {state === "REGISTERED" && (
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5 bg-slate-950/50 p-2 px-3 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                      ✨ Confirmed Seat
                    </span>
                    {session.meetLink && (
                      <span className="text-xs text-slate-500 border-l border-slate-800 pl-2.5 hidden sm:inline">
                        Meeting connection link unlocks when live.
                      </span>
                    )}
                  </div>
                )}

                {state === "LIVE" && session.meetLink && (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-white inline-block cursor-pointer transition text-sm font-semibold shadow-lg shadow-green-600/20"
                  >
                    Join Meeting Room
                  </a>
                )}

                {state === "COMPLETED" && (
                  <span className="text-slate-500 text-sm font-medium italic select-none">
                    Registration Window Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mentor Details Modal */}
      {mentorModal.open && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-white text-lg font-bold mb-2 flex items-center gap-2">
              👤 Mentor Details
            </h2>
            {mentorModal.loading && (
              <div className="text-slate-300">Loading mentor details...</div>
            )}
            {mentorModal.error && (
              <div className="text-red-400">{mentorModal.error}</div>
            )}
            {mentorModal.mentor && mentorModal.mentor.user && (
              <>
                {console.log("MENTOR MODAL DATA:", mentorModal.mentor)}
                <div className="space-y-2 mt-2">
                  <div>
                    <span className="font-semibold text-slate-400">Name:</span>{" "}
                    <span className="text-slate-100">
                      {mentorModal.mentor.user.name || "Not available"}
                    </span>
                  </div>
                  {mentorModal.mentor.user.email && (
                    <div>
                      <span className="font-semibold text-slate-400">
                        Email:
                      </span>
                      <span className="text-slate-100">
                        {mentorModal.mentor.user.email}
                      </span>
                    </div>
                  )}{" "}
                  {mentorModal.mentor.user.mentorProfile?.bio && (
                    <div>
                      <span className="font-semibold text-slate-400">Bio:</span>{" "}
                      <span className="text-slate-100">
                        {mentorModal.mentor.user.mentorProfile.bio}
                      </span>
                    </div>
                  )}
                  {mentorModal.mentor.user.mentorProfile?.level && (
                    <div>
                      <span className="font-semibold text-slate-400">
                        Level:
                      </span>{" "}
                      <span className="text-slate-100">
                        {mentorModal.mentor.user.mentorProfile.level}
                      </span>
                    </div>
                  )}
                  {mentorModal.mentor.user.mentorProfile?.rating !==
                    undefined && (
                    <div>
                      <span className="font-semibold text-slate-400">
                        Rating:
                      </span>{" "}
                      <span className="text-slate-100">
                        {mentorModal.mentor.user.mentorProfile.rating}
                      </span>
                    </div>
                  )}
                  {mentorModal.mentor.user.mentorProfile?.universityName && (
                    <div>
                      <span className="font-semibold text-slate-400">
                        University:
                      </span>{" "}
                      <span className="text-slate-100">
                        {mentorModal.mentor.user.mentorProfile.universityName}
                      </span>
                    </div>
                  )}
                  {mentorModal.mentor.user.mentorProfile?.skills &&
                    mentorModal.mentor.user.mentorProfile.skills.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-400">
                          Skills:
                        </span>{" "}
                        <span className="text-slate-100">
                          {mentorModal.mentor.user.mentorProfile.skills.join(
                            ", ",
                          )}
                        </span>
                      </div>
                    )}
                  {/* Add more fields as needed */}
                </div>
              </>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={closeMentorModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer text-sm font-medium border border-slate-700/60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION INLINE MODAL */}
      {confirmSession && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-white text-lg font-bold mb-2 flex items-center gap-2">
              🎟️ Group Session RSVP
            </h2>

            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to register for{" "}
              <span className="text-blue-400 font-semibold">
                {confirmSession.topic}
              </span>
              ? This will secure your participant slot and register your account
              profile.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmSession(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer text-sm font-medium border border-slate-700/60"
              >
                Cancel
              </button>

              <button
                onClick={() => handleRSVP(confirmSession)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition cursor-pointer text-sm font-semibold shadow-md shadow-blue-600/20"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show more pagination control */}
      {allSessions.length > sessions.length && (
        <div className="flex justify-center">
          <button
            onClick={showMore}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
