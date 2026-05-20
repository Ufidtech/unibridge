import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MentorSidebar from "./MentorSidebar";
import StatCard from "../StatCard";
import PendingRequest from "./PendingRequest";
import UpcomingSession from "./UpcomingSession";
import MentorSchedule from "./MentorSchedule";
import MentorProfile from "./MentorProfile";
import MentorRequests from "./MentorRequests";
import MentorProposals from "./MentorProposals";
import MentorHistory from './MentorHistory';
import {
  fetchSessions,
  updateSessionStatus,
  mentorReschedule,
  respondToProposal,
  mentorComplete,
} from "../../lib/api/sessions";
import { updateMe, fetchMe } from "../../lib/api/auth";
import { buildMentorPayload } from "../../lib/profile";
import MentorRescheduleModal from "./MentorRescheduleModal";
import ProofModal from "./ProofModal";
import { computeAverageRatingFromSessions } from "../../lib/ratings";

export default function MentorDashboard({
  mentorInfo = { name: "Umar Farooq", role: "Mentor" },
  onNavigate = () => {},
}) {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const activeTab = qs.get("tab") || "";

  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [proposalsList, setProposalsList] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofTargetId, setProofTargetId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [declinedSessions, setDeclinedSessions] = useState([]);
  const [profileForm, setProfileForm] = useState({
    title: "",
    bio: "",
    university: "",
  });
  const [fullMentorProfile, setFullMentorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [computedRating, setComputedRating] = useState({
    average: 0,
    count: 0,
  });
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const stats = [
    {
      label: "Students Mentored",
      value: String(completedSessionsCount),
      icon: "👥",
      subtext:
        completedSessionsCount > 0
          ? `${completedSessionsCount} completed sessions`
          : "No completed sessions yet",
    },
    {
      label: "Upcoming Sessions",
      value: String(upcomingSessions.length),
      icon: "📅",
      subtext:
        upcomingSessions.length > 0
          ? `${upcomingSessions.length} confirmed sessions`
          : "No upcoming sessions",
    },
    {
      label: "Pending Requests",
      value: String(pendingRequests.length),
      icon: "📬",
      subtext:
        pendingRequests.length > 0
          ? `${pendingRequests.length} awaiting response`
          : "All caught up!",
    },
    {
      label: "Average Rating",
      value:
        computedRating && computedRating.average
          ? String(computedRating.average)
          : "—",
      icon: "⭐",
      subtext:
        computedRating && computedRating.count
          ? `Based on ${computedRating.count} reviews`
          : "No reviews yet",
      variant: "success",
    },
  ];

  const handleAcceptRequest = async (requestId) => {
    try {
      await updateSessionStatus(requestId, "CONFIRMED");
      toast.success("Request accepted and confirmed.");
      await loadSessions();
    } catch (err) {
      toast.error("Failed to accept request: " + (err.message || err));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await updateSessionStatus(requestId, "DECLINED");
      toast("Request declined.");
      await loadSessions();
    } catch (err) {
      toast.error("Failed to decline request: " + (err.message || err));
    }
  };

  const handleAcceptProposal = async (proposal) => {
    // Instantly remove from screen
    setProposalsList((prev) => prev.filter((p) => p.id !== proposal.id));

    try {
      await respondToProposal(proposal.sessionId, proposal.id, "ACCEPTED");
      toast.success("Proposal accepted");
      await loadSessions();
    } catch (err) {
      toast.error("Failed to accept proposal");
      await loadSessions();
    }
  };

  const handleDeclineProposal = async (proposal) => {
    // Instantly remove from screen
    setProposalsList((prev) => prev.filter((p) => p.id !== proposal.id));

    try {
      await respondToProposal(proposal.sessionId, proposal.id, "DECLINED");
      toast("Proposal declined");
      await loadSessions();
    } catch (err) {
      toast.error("Failed to decline proposal");
      await loadSessions();
    }
  };

  const handleJoinMeet = (sessionId) => {
    const session = upcomingSessions.find((s) => s.id === sessionId);
    window.open(session.meetLink, "_blank");
  };

  async function loadSessions() {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await fetchSessions();
      const allRequests = data.sessionRequests || [];

      // 1. Safely filter all the statuses once
      const requests = allRequests.filter((s) => s.status === "PENDING");
      const confirmed = allRequests.filter((s) => s.status === "CONFIRMED");
      const completed = allRequests.filter((s) => s.status === "COMPLETED");
      const declined = allRequests.filter((s) => s.status === "DECLINED" || s.status === "CANCELLED");

      // 2. Set History
      setCompletedSessions(completed);
      setDeclinedSessions(declined);

      // 3. Process and set Proposals (Show ALL statuses)
      const proposals = allRequests.flatMap((s) =>
        (s.proposals || []).map((p, idx) => ({
          id: p.id || `${s.id}-${idx}`,
          sessionId: s.id,
          sessionTopic: s.topic,
          menteeName: s.mentee?.name || "Student",
          status: p.status || "PENDING", // Ensure a fallback status exists
          ...p,
        }))
      );
      
      setProposalsList(proposals);

      // 4. Set Pending Requests
      setPendingRequests(
        requests.map((r) => ({
          ...r,
          studentName: r.mentee?.name || "Student", 
          studentInitials: (r.mentee?.name || "S")
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          studentClass: r.mentee?.classLevel || "",
          aiQuestions: r.aiQuestions || [],
        }))
      );

      // 5. Set Upcoming Sessions
      setUpcomingSessions(
        confirmed.map((c) => ({
          id: c.id,
          studentName: c.mentee?.name || "Student",
          studentInitials: (c.mentee?.name || "S")
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          studentClass: c.mentee?.classLevel || "",
          topic: c.topic,
          date: c.sessionDate,
          time: c.sessionTime,
          meetLink: c.meetLink,
        }))
      );

      // 6. Set Stats
      setCompletedSessionsCount(completed.length);

      try {
        const cr = computeAverageRatingFromSessions(allRequests, mentorInfo?.id);
        setComputedRating(cr);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setSessionsError(String(err.message || err));
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadMentorProfile() {
    setLoadingProfile(true);
    try {
      const data = await fetchMe();
      const mentorData = data?.user?.mentorProfile || data?.mentorProfile || {};
      const userData = data?.user || data || {};

      const fullProfile = {
        ...userData,
        ...mentorData,
        name: userData.name,
        email: userData.email,
      };

      setFullMentorProfile(fullProfile);
      setProfileForm({
        title: mentorData?.title || userData?.title || "",
        bio: mentorData?.bio || userData?.bio || "",
        university:
          mentorData?.universityName ||
          mentorData?.university ||
          userData?.university ||
          "",
        expertise: Array.isArray(mentorData?.skills)
          ? mentorData.skills.join(", ")
          : mentorData?.expertise || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    loadSessions();
    loadMentorProfile();
    setProfileForm({
      title: mentorInfo?.title || "",
      bio: mentorInfo?.bio || "",
      university: mentorInfo?.university || "",
    });
  }, []);

  const handleMentorReschedule = (session) => {
    setRescheduleTarget(session);
    setShowRescheduleModal(true);
  };

  const handleProfileSave = async () => {
    try {
      const payload = buildMentorPayload(profileForm);
      await updateMe(payload);
      toast.success("Profile updated successfully!");
      setEditingProfile(false);
      await loadMentorProfile();
    } catch (err) {
      toast.error("Failed to update profile: " + (err.message || err));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <MentorSidebar mentorInfo={mentorInfo} onNavigate={onNavigate} />

      <div className="flex-1 md:ml-0">
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 mt-12 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            Welcome back, {mentorInfo.name}!
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your sessions and help the next generation succeed.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {/* Default Dashboard View */}
          {!activeTab && (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                  <StatCard
                    key={idx}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    subtext={stat.subtext}
                    variant={stat.variant}
                  />
                ))}
              </div>

              {/* Pending Requests Summary */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    📬 Session Requests
                    {pendingRequests.length > 0 && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
                        {pendingRequests.length}
                      </span>
                    )}
                  </h2>
                  {pendingRequests.length > 0 && (
                    <button
                      onClick={() =>
                        onNavigate("/mentor-dashboard?tab=requests")
                      }
                      className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer"
                    >
                      View All →
                    </button>
                  )}
                </div>

                {pendingRequests.length > 0 ? (
                  <div>
                    {pendingRequests.slice(0, 2).map((request) => (
                      <PendingRequest
                        key={request.id}
                        request={request}
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                      />
                    ))}
                    {pendingRequests.length > 2 && (
                      <button
                        onClick={() =>
                          onNavigate("/mentor-dashboard?tab=requests")
                        }
                        className="mt-4 w-full px-4 py-2 text-slate-300 hover:text-slate-100 border border-slate-700 rounded cursor-pointer transition"
                      >
                        +{pendingRequests.length - 2} more requests
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                    <p className="text-slate-400">
                      No pending requests. Great work keeping up! 🎉
                    </p>
                  </div>
                )}
              </div>

              {/* Upcoming Sessions Summary */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-100">
                    📅 Upcoming Schedule
                  </h2>
                  {upcomingSessions.length > 0 && (
                    <button
                      onClick={() =>
                        onNavigate("/mentor-dashboard?tab=schedule")
                      }
                      className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer"
                    >
                      View All →
                    </button>
                  )}
                </div>

                {upcomingSessions.length > 0 ? (
                  <div>
                    {upcomingSessions.slice(0, 2).map((session) => (
                      <UpcomingSession
                        key={session.id}
                        session={session}
                        onJoinMeet={handleJoinMeet}
                        onReschedule={() => handleMentorReschedule(session)}
                        onMarkComplete={(id) => {
                          setProofTargetId(id);
                          setShowProofModal(true);
                        }}
                      />
                    ))}
                    {upcomingSessions.length > 2 && (
                      <button
                        onClick={() =>
                          onNavigate("/mentor-dashboard?tab=schedule")
                        }
                        className="mt-4 w-full px-4 py-2 text-slate-300 hover:text-slate-100 border border-slate-700 rounded cursor-pointer transition"
                      >
                        +{upcomingSessions.length - 2} more sessions
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                    <p className="text-slate-400">
                      No upcoming sessions. Schedule is clear!
                    </p>
                  </div>
                )}
              </div>

              {/* Pending Proposals Summary */}
              {(() => {
                // 1. Filter out only the pending proposals
                const pendingProposals = proposalsList.filter(
                  (p) => !p.status || p.status === "PENDING"
                );

                // 2. Only show this section if there are actually pending proposals
                if (pendingProposals.length === 0) return null;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        🔁 Pending Proposals
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-semibold rounded-full">
                          {pendingProposals.length}
                        </span>
                      </h2>
                      <button
                        onClick={() =>
                          onNavigate("/mentor-dashboard?tab=proposals")
                        }
                        className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {pendingProposals.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-900 border border-yellow-500/30 rounded-lg p-4 flex items-start justify-between transition hover:border-yellow-500/50"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <div className="text-slate-200 font-semibold">
                                {p.menteeName} — {p.sessionTopic}
                              </div>
                            </div>
                            
                            <div className="text-slate-400 text-sm mt-1">
                              Proposed: {p.sessionDate} {p.sessionTime} (
                              {p.timezone || "UTC"})
                            </div>
                            
                            {p.notes && (
                              <div className="text-slate-300 text-sm mt-2">
                                <span className="font-semibold text-slate-400">Note: </span>
                                {p.notes}
                              </div>
                            )}
                          </div>
                          
                          {/* Action buttons (We know these are always pending now) */}
                          <div className="flex flex-col gap-2 shrink-0 ml-4">
                            <button
                              onClick={() => handleAcceptProposal(p)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineProposal(p)}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {pendingProposals.length > 2 && (
                        <button
                          onClick={() =>
                            onNavigate("/mentor-dashboard?tab=proposals")
                          }
                          className="mt-4 w-full px-4 py-2 text-slate-300 hover:text-slate-100 border border-slate-700 rounded cursor-pointer transition"
                        >
                          +{pendingProposals.length - 2} more pending proposals
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Extracted Components */}
          {activeTab === "requests" && (
            <MentorRequests
              pendingRequests={pendingRequests}
              loadingSessions={loadingSessions}
              sessionsError={sessionsError}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          )}

          {activeTab === 'schedule' && (
            <MentorSchedule 
              upcomingSessions={upcomingSessions}
              onJoinMeet={handleJoinMeet}
              onReschedule={handleMentorReschedule}
              onMarkComplete={(id) => { setProofTargetId(id); setShowProofModal(true); }}
            />
          )}

          {activeTab === 'proposals' && (
            <MentorProposals 
              proposalsList={proposalsList}
              onAcceptProposal={handleAcceptProposal}
              onDeclineProposal={handleDeclineProposal}
            />
          )}

{activeTab === 'history' && (
            <MentorHistory 
              completedSessions={completedSessions}
              declinedSessions={declinedSessions}
            />
          )}

          {activeTab === "profile" && (
            <MentorProfile
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              fullMentorProfile={fullMentorProfile}
              loadingProfile={loadingProfile}
              mentorInfo={mentorInfo}
              computedRating={computedRating}
              onSave={handleProfileSave}
            />
          )}
        </div>

        {/* Modals */}
        {showRescheduleModal && rescheduleTarget && (
          <MentorRescheduleModal
            open={true}
            initialDate={rescheduleTarget.date}
            initialTime={rescheduleTarget.time}
            onClose={() => {
              setShowRescheduleModal(false);
              setRescheduleTarget(null);
            }}
            onConfirm={async ({ sessionDate, sessionTime, timezone }) => {
              try {
                // Pass the already-formatted data straight to the API
                await mentorReschedule(
                  rescheduleTarget.id,
                  sessionDate,
                  sessionTime,
                  timezone, // Added timezone here based on our previous fix!
                );
                toast.success("Session rescheduled.");
                await loadSessions();
              } catch (err) {
                toast.error("Failed to reschedule: " + (err.message || err));
              } finally {
                setShowRescheduleModal(false);
                setRescheduleTarget(null);
              }
            }}
          />
        )}

        {showProofModal && proofTargetId && (
          <ProofModal
            open={true}
            onClose={() => {
              setShowProofModal(false);
              setProofTargetId(null);
            }}
            onConfirm={async ({ proof, notes }) => {
              try {
                await mentorComplete(proofTargetId, proof, notes);
                toast.success("Session marked complete.");
                await loadSessions();
              } catch (err) {
                toast.error("Failed to mark complete: " + (err.message || err));
              } finally {
                setShowProofModal(false);
                setProofTargetId(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
