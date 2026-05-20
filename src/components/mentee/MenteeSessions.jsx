import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  fetchSessions,
  cancelSession,
  proposeNewTime,
  rateSession,
  updateSession,
} from "../../lib/api/sessions";
import { buildSessionPayload } from "../../lib/session";
import MenteeProposeModal from "./MenteeProposeModal";
import RateModal from "./RateModal";
import BookSessionModal from "./BookSessionModal";
import SuccessModal from "../SuccessModal";

// Helper for date formatting
const isoToDateTimeStrings = (iso, tz) => {
  if (!iso) return { date: "", time: "" };
  const dt = new Date(iso);
  const timeZone =
    tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  try {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(dt);
    return { date, time };
  } catch (e) {
    const s = dt.toISOString();
    return { date: s.slice(0, 10), time: s.slice(11, 16) };
  }
};

export default function MenteeSessions({ onNavigate, mentors }) {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [confirmCancelFor, setConfirmCancelFor] = useState(null);

  // Modal States
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposeSessionId, setProposeSessionId] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateTargetId, setRateTargetId] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleSessionId, setRescheduleSessionId] = useState(null);
  const [selectedMentorForReschedule, setSelectedMentorForReschedule] =
    useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);

  const fetchUpdatedSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(
        Array.isArray(data.sessionRequests) ? data.sessionRequests : [],
      );
    } catch (err) {
      setSessionsError(String(err.message || err));
    }
  };

  useEffect(() => {
    setLoadingSessions(true);
    fetchUpdatedSessions().finally(() => setLoadingSessions(false));
  }, []);

  const handleCancelClick = async (sessionId) => {
    if (confirmCancelFor !== sessionId) {
      setConfirmCancelFor(sessionId);
      setTimeout(() => setConfirmCancelFor(null), 8000);
      return;
    }
    try {
      await cancelSession(sessionId);
      await fetchUpdatedSessions();
      toast.success("Session cancelled");
    } catch (err) {
      toast.error("Failed to cancel: " + err.message);
    } finally {
      setConfirmCancelFor(null);
    }
  };

  const handleOpenReschedule = (session) => {
    const mentor = session.mentor ||
      mentors.find((m) => m.id === session.mentorId) || {
        id: session.mentorId,
        name: session.mentor?.name || "Mentor",
      };
    setSelectedMentorForReschedule(mentor);
    setRescheduleSessionId(session.id);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async (sessionData) => {
    try {
      let sessionDate = sessionData.date;
      let sessionTime = sessionData.time;
      const timezone = sessionData.timezone;

      if (sessionData.datetime) {
        const parts = isoToDateTimeStrings(
          sessionData.datetime,
          sessionData.timezone || timezone,
        );
        sessionDate = parts.date;
        sessionTime = parts.time;
      }

      const payload = buildSessionPayload({
        mentorId: String(selectedMentorForReschedule.id),
        topic: sessionData.goal || sessionData.mentorName,
        sessionDate,
        sessionTime,
        timezone: sessionData.timezone,
        notes: sessionData.goal,
        mentorName: selectedMentorForReschedule.name,
      });

      const res = await updateSession(rescheduleSessionId, {
        sessionDate: payload.sessionDate,
        sessionTime: payload.sessionTime,
        timezone: payload.timezone,
        notes: payload.notes,
      });

      setBookedSession({
        mentorName:
          res.sessionRequest.mentor?.name || selectedMentorForReschedule.name,
        date: res.sessionRequest.sessionDate,
        time: res.sessionRequest.sessionTime,
        meetLink: res.sessionRequest.meetLink,
      });

      setShowRescheduleModal(false);
      setShowSuccessModal(true);
      await fetchUpdatedSessions();
    } catch (err) {
      toast.error("Failed to reschedule: " + (err.message || err));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">My Sessions</h2>

      {loadingSessions && <p className="text-slate-400">Loading sessions...</p>}
      {sessionsError && <p className="text-red-400">{sessionsError}</p>}

      {!loadingSessions && !sessionsError && sessions.length === 0 && (
        <div className="text-slate-400 space-y-4">
          <p>
            You have no upcoming sessions yet. Book a mentor to get started.
          </p>
          <button
            onClick={() =>
              onNavigate
                ? onNavigate("/mentee-dashboard?tab=recommended")
                : null
            }
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition"
          >
            Book a session
          </button>
        </div>
      )}

      {!loadingSessions && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-slate-200 font-semibold">{s.topic}</div>
                  <div className="text-slate-400 text-sm">
                    Mentor: {s.mentor?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-200">
                    {s.sessionDate} • {s.sessionTime}
                  </div>
                  <div className="text-xs text-slate-400">
                    Status: {s.status}
                  </div>
                </div>
              </div>

              {s.notes && (
                <div className="mt-2 text-slate-400">Notes: {s.notes}</div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">

  {/* ONLY CONFIRMED SESSIONS */}
  {s.status === "CONFIRMED" && (
    <>
      {/* Join Meeting */}
      {s.meetLink && (
        <a
          href={s.meetLink}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 transition"
        >
          Join Meeting
        </a>
      )}

      {/* Propose New Time */}
      <button
        onClick={() => {
          setProposeSessionId(s.id);
          setShowProposeModal(true);
        }}
        className="px-3 py-2 bg-yellow-600 text-white rounded cursor-pointer hover:bg-yellow-700 transition"
      >
        Propose new time
      </button>

      {/* Cancel */}
      <button
        onClick={() => handleCancelClick(s.id)}
        className="px-3 py-2 bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 transition"
      >
        {confirmCancelFor === s.id
          ? "Confirm cancel"
          : "Cancel"}
      </button>
    </>
  )}

  {/* COMPLETED SESSION */}
  {s.status === "COMPLETED" &&
    s.proof &&
    (() => {
      const alreadyRated =
        Array.isArray(s.ratings) &&
        s.ratings.length > 0;

      return alreadyRated ? (
        <span className="px-3 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded font-medium flex items-center gap-1 cursor-default">
          ⭐ Rated
        </span>
      ) : (
        <button
          onClick={() => {
            setRateTargetId(s.id);
            setShowRateModal(true);
          }}
          className="px-3 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-700 transition"
        >
          Rate Mentor
        </button>
      );
    })()}
</div>

              {Array.isArray(s.proposals) && s.proposals.length > 0 && (
                <div className="mt-4 text-sm text-slate-400 border-t border-slate-800 pt-3">
                  <div className="font-semibold text-slate-200 mb-2">
                    Proposals
                  </div>
                  {s.proposals.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-800 border border-slate-700 rounded p-2 mb-2"
                    >
                      <div>
                        {p.sessionDate} • {p.sessionTime} —{" "}
                        <span className="font-semibold">{p.status}</span>
                      </div>
                      {p.notes && (
                        <div className="text-slate-400 mt-1">
                          Notes: {p.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Local Modals */}
      {showProposeModal && proposeSessionId && (
        <MenteeProposeModal
          open={true}
          onClose={() => {
            setShowProposeModal(false);
            setProposeSessionId(null);
          }}
          onConfirm={async ({ datetime, notes, timezone }) => {
            try {
              let sd = "",
                st = "";
              if (datetime) {
                const parts = isoToDateTimeStrings(datetime, timezone);
                sd = parts.date;
                st = parts.time;
              }
              await proposeNewTime(proposeSessionId, sd, st, notes);
              toast.success("Proposal sent to mentor");
              await fetchUpdatedSessions();
            } catch (err) {
              toast.error("Failed to send proposal: " + (err.message || err));
            } finally {
              setShowProposeModal(false);
              setProposeSessionId(null);
            }
          }}
        />
      )}

      {showRateModal && rateTargetId && (
        <RateModal
          open={true}
          onClose={() => {
            setShowRateModal(false);
            setRateTargetId(null);
          }}
          onConfirm={async ({ rating, feedback }) => {
            try {
              await rateSession(rateTargetId, rating, feedback);
              toast.success("Thanks for your rating!");
              await fetchUpdatedSessions();
            } catch (err) {
              toast.error("Failed to submit rating: " + (err.message || err));
            } finally {
              setShowRateModal(false);
              setRateTargetId(null);
            }
          }}
        />
      )}

      {showRescheduleModal && selectedMentorForReschedule && (
        <BookSessionModal
          mentor={selectedMentorForReschedule}
          onConfirm={handleConfirmReschedule}
          initialDate={
            sessions.find((s) => s.id === rescheduleSessionId)?.sessionDate ||
            ""
          }
          initialTime={
            sessions.find((s) => s.id === rescheduleSessionId)?.sessionTime ||
            ""
          }
          confirmLabel="Reschedule"
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedMentorForReschedule(null);
          }}
        />
      )}

      {showSuccessModal && bookedSession && (
        <SuccessModal
          sessionDetails={bookedSession}
          onClose={() => {
            setShowSuccessModal(false);
            setBookedSession(null);
          }}
        />
      )}
    </div>
  );
}
