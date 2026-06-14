import { useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import AICommandCenter from "../AICommandCenter";
import MentorCard from "../mentor/MentorCard";
import MentorExplainModal from "../mentor/MentorExplainModal";
import MenteeSessions from "./MenteeSessions";
import MenteeProfile from "./MenteeProfile";
import { createPrivateSession } from "../../lib/api/sessions";
import {
  createWalletRequestLink,
  fetchMyWallet,
  fetchMyWalletTransactions,
} from "../../lib/api/wallet";

import GroupSessionsList from "./GroupSessionsList";
import { fetchMentorById, fetchMentors } from "../../lib/api/mentorsApi";

import { buildSessionPayload } from "../../lib/session";
import BookSessionModal from "./BookSessionModal";
import SuccessModal from "../SuccessModal";
import WalletCard from "../WalletCard";
import WalletFundModal from "../SponsorCheckoutModal";

import NIGERIA_UNIVERSITIES from "../../data/nigeriaUniversities";

const REQUEST_AMOUNT_KEY = "unibridge-request-amount";
const REQUEST_NOTE_KEY = "unibridge-request-note";
const REQUEST_SYNC_EVENT = "unibridge:request-funds-sync";

function readRequestState() {
  if (typeof window === "undefined") {
    return { amount: "5000", note: "" };
  }

  return {
    amount: window.localStorage.getItem(REQUEST_AMOUNT_KEY) || "5000",
    note: window.localStorage.getItem(REQUEST_NOTE_KEY) || "",
  };
}

function syncRequestState({ amount, note }) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(REQUEST_AMOUNT_KEY, String(amount || ""));
  window.localStorage.setItem(REQUEST_NOTE_KEY, String(note || ""));
  window.dispatchEvent(
    new CustomEvent(REQUEST_SYNC_EVENT, {
      detail: { amount: String(amount || ""), note: String(note || "") },
    }),
  );
}

async function hydrateMentorPrice(m = {}) {
  const mentorProfile = m.mentorProfile || m.profile || {};
  const sessionPrice = normalizeMentorPrice({ ...m, mentorProfile });
  if (sessionPrice > 0 || !m?.id) {
    return {
      ...m,
      mentorProfile,
      sessionPrice,
      mentorProfilePrice: mentorProfile.sessionPrice ?? null,
    };
  }

  try {
    const detailResp = await fetchMentorById(m.id);
    const detailMentor = detailResp?.mentor || {};
    const detailProfile = detailMentor.mentorProfile || {};
    return {
      ...m,
      ...detailMentor,
      mentorProfile: detailProfile,
      sessionPrice: normalizeMentorPrice({
        ...m,
        ...detailMentor,
        mentorProfile: detailProfile,
      }),
      mentorProfilePrice: detailProfile.sessionPrice ?? null,
    };
  } catch {
    return {
      ...m,
      mentorProfile,
      sessionPrice,
      mentorProfilePrice: mentorProfile.sessionPrice ?? null,
    };
  }
}

function normalizeMentorPrice(m = {}) {
  const profile = m.mentorProfile || m.profile || {};
  const candidates = [
    m.sessionPrice,
    profile.sessionPrice,
    m.price,
    profile.price,
    m.bookingPrice,
    profile.bookingPrice,
    m.session_price,
    profile.session_price,
    m.mentorPrice,
    profile.mentorPrice,
    m.mentorProfilePrice,
    profile.mentorProfilePrice,
    m.amount,
    profile.amount,
    m.rate,
    profile.rate,
    m.pricing?.session,
    profile.pricing?.session,
    m.pricing?.price,
    profile.pricing?.price,
  ];

  for (const value of candidates) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }

  return 0;
}

export default function MenteeDashboard({
  userInfo = { name: "Ibrahim", level: "SS3" },
  onNavigate = () => {},
}) {
  const location = useLocation();
  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "recommended",
    [location.search],
  );

  // Initialize with an empty array instead of default mentors
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [mentorsError, setMentorsError] = useState(null);

  const [selectedMentorForBooking, setSelectedMentorForBooking] =
    useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);
  const [selectedMentorForExplain, setSelectedMentorForExplain] =
    useState(null);
  const [showSponsorCheckout, setShowSponsorCheckout] = useState(false);

  const [wallet, setWallet] = useState(
    () => userInfo?.wallet || { currentBalance: 0, transactionHistory: [] },
  );
  const menteeId = userInfo?.id || userInfo?.uid || userInfo?.user?.uid || "me";

  const [walletLoading, setWalletLoading] = useState(false);

  const [prepSheet, setPrepSheet] = useState(null);
  const initialRequestState = readRequestState();
  const [requestAmount, setRequestAmount] = useState(
    initialRequestState.amount,
  );
  const [requestNote, setRequestNote] = useState(initialRequestState.note);

  const requestFundsLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    const search = new URLSearchParams();
    search.set("menteeId", menteeId);

    search.set("amount", String(requestAmount));
    search.set("note", requestNote);
    return `${window.location.origin}/request-funds?${search.toString()}`;
  }, [requestAmount, requestNote, menteeId]);

  const persistWallet = (nextWallet) => {
    setWallet(nextWallet);
    try {
      if (typeof window !== "undefined") {
        const key = `unibridge-wallet:${menteeId}`;

        window.localStorage.setItem(key, JSON.stringify(nextWallet));
      }
    } catch {
      void 0;
    }
  };

  // Scroll to section handling
  useEffect(() => {
    if (activeTab === "recommended" && location.hash === "#recommended") {
      const el = document.getElementById("recommended-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-4", "ring-yellow-400", "ring-offset-2");
        setTimeout(
          () =>
            el.classList.remove("ring-4", "ring-yellow-400", "ring-offset-2"),
          2200,
        );
      }
    }
  }, [activeTab, location.hash]);

  // Fetch Mentors (AI Recommendations fallback to All Mentors)
  // Extracted loader so it can be called from an event handler when AI runs
  async function loadMentorsData() {
    setLoadingMentors(true);
    setMentorsError(null);

    try {
      // Try fetching AI recommendations first
      if (menteeId && menteeId !== "me") {
        const resp = await fetch("/api/ai/recommend-mentors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menteeId, limit: 12 }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data.mentors) ? data.mentors : [];

          if (list.length > 0) {
            const uiList = list.map((m, i) => {
              const mentorProfile = m.mentorProfile || m.profile || {};
              return {
                id: m.id || `m-${i}`,
                name: m.name || m.fullName || "Unknown",
                initials: m.name
                  ? m.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("")
                  : "??",
                university: m.university || "",
                level: m.level || "",
                bio: m.bio || "",
                skills: m.skills || [],
                rating: m.rating || 0,
                reviews: m.reviews || 0,
                mentorProfile,
                mentorProfilePrice: mentorProfile.sessionPrice ?? null,
                sessionPrice: normalizeMentorPrice({ ...m, mentorProfile }),

                freemiumSplit: m.freemiumSplit || { free: true, premium: true },
                bookingGoal: m.bookingGoal || m.goal || m.targetGoal || "",
                aiQuestions: m.aiQuestions || m.suggestedQuestions || [],
                aiPrepSheet: m.aiPrepSheet || null,
              };
            });

            const hydrated = await Promise.all(
              uiList.map((m) => hydrateMentorPrice(m)),
            );
            setMentors(hydrated);
            return; // Successfully loaded recommendations, exit early
          }
        }
      }

      // Fallback: If AI fails or returns empty, fetch ALL mentors from the database
      const data = await fetchMentors();

      console.log("API RESPONSE:", data);
      console.log("MENTORS:", data.mentors);

      setMentors(data.mentors || []);
      const generalMentors = (data.mentors || []).map((m, index) => {
        const mentorUi = {
          ...m,
          sessionPrice: normalizeMentorPrice(m),
          mentorProfilePrice: m.mentorProfile?.sessionPrice ?? null,
          // Ensure initials exist just in case the backend missed it
          initials:
            m.initials ||
            (m.name
              ? m.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join("")
              : "??"),
        };

        console.log(`[Mentors for You] Mentor #${index + 1}`, {
          id: mentorUi.id,
          name: mentorUi.name,
          initials: mentorUi.initials,
          university: mentorUi.university,
          level: mentorUi.level,
          bio: mentorUi.bio,
          skills: mentorUi.skills,
          rating: mentorUi.rating,
          reviews: mentorUi.reviews,
          responseTime: mentorUi.responseTime,
          sessionPrice: mentorUi.sessionPrice,
          rawSessionPrice: mentorUi.rawSessionPrice,
          mentorProfilePrice: mentorUi.mentorProfilePrice,
          freemiumSplit: mentorUi.freemiumSplit,
          bookingGoal: mentorUi.bookingGoal,
          aiQuestions: mentorUi.aiQuestions,
          aiPrepSheet: mentorUi.aiPrepSheet,
          mentorProfile: mentorUi.mentorProfile,
        });

        return mentorUi;
      });

      const hydratedMentors = await Promise.all(
        generalMentors.map((m) => hydrateMentorPrice(m)),
      );
      console.log("[Mentors for You] Full mentor list:", hydratedMentors);
      setMentors(hydratedMentors);
    } catch (err) {
      console.error("Failed to load mentors:", err);
      setMentorsError(String(err.message || err));
      setMentors([]); // Reset on failure
    } finally {
      setLoadingMentors(false);
    }
  }

  // Load on mount and when userInfo changes
  useEffect(() => {
    let cancelled = false;

    async function loadWalletData() {
      setWalletLoading(true);
      try {
        const [walletResp, txResp] = await Promise.all([
          fetchMyWallet(),
          fetchMyWalletTransactions(),
        ]);
        if (cancelled) return;

        const fetchedWallet = walletResp?.wallet || walletResp || {};

        const transactions = Array.isArray(txResp?.transactions)
          ? txResp.transactions
          : Array.isArray(fetchedWallet?.transactionHistory)
            ? fetchedWallet.transactionHistory
            : [];

        const savedWallet = {
          ...fetchedWallet,
          currentBalance: txResp?.balance ?? fetchedWallet?.currentBalance ?? 0,
          escrowBalance:
            txResp?.escrowBalance ?? fetchedWallet?.escrowBalance ?? 0,
          transactionHistory: transactions,
        };

        setWallet(savedWallet);
        try {
          if (typeof window !== "undefined") {
            const key = `unibridge-wallet:${menteeId}`;

            window.localStorage.setItem(key, JSON.stringify(savedWallet));
          }
        } catch {
          void 0;
        }
      } catch {
        try {
          if (typeof window !== "undefined") {
            const key = `unibridge-wallet:${menteeId}`;

            const saved = window.localStorage.getItem(key);
            if (saved && !cancelled) {
              const parsed = JSON.parse(saved);
              if (parsed) setWallet(parsed);
            }
          }
        } catch {
          void 0;
        }
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    }

    loadWalletData();
    loadMentorsData();

    // When AICommandCenter dispatches mentors directly, update without refetching.
    const doneHandler = (ev) => {
      try {
        const list = ev?.detail?.mentors || [];
        if (Array.isArray(list) && list.length > 0) {
          const uiList = list.map((m, i) => {
            const mentorProfile = m.mentorProfile || m.profile || {};
            return {
              id: m.id || `m-${i}`,
              name: m.name || m.fullName || "Unknown",
              initials: m.name
                ? m.name
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")
                : "??",
              university: m.university || "",
              level: m.level || "",
              bio: m.bio || "",
              skills: m.skills || [],
              rating: m.rating || 0,
              reviews: m.reviews || 0,
              mentorProfile,
              mentorProfilePrice: mentorProfile.sessionPrice ?? null,
              sessionPrice: normalizeMentorPrice({ ...m, mentorProfile }),

              freemiumSplit: m.freemiumSplit || { free: true, premium: true },
              bookingGoal: m.bookingGoal || m.goal || m.targetGoal || "",
              aiQuestions: m.aiQuestions || m.suggestedQuestions || [],
              aiPrepSheet: m.aiPrepSheet || null,
            };
          });
        } else {
          // If empty, fall back to a full reload
          loadMentorsData();
        }
      } catch (err) {
        console.warn("ai:recommend:done handler failed", err);
        loadMentorsData();
      }
    };

    const fallbackHandler = () => loadMentorsData();

    if (typeof window !== "undefined") {
      window.addEventListener("ai:recommend:done", doneHandler);
      window.addEventListener("ai:recommend", fallbackHandler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ai:recommend:done", doneHandler);
        window.removeEventListener("ai:recommend", fallbackHandler);
      }
      cancelled = true;
    };
  }, [menteeId]);

  const universitySuggestions = Array.from(
    new Set([
      ...mentors.map((m) => m.university).filter(Boolean),
      ...NIGERIA_UNIVERSITIES.map((u) => u.name),
    ]),
  ).filter(Boolean);

  const handleConfirmInitialBooking = async (sessionData) => {
    try {
      const mentor = selectedMentorForBooking;
      if (!mentor) {
        toast.error("Please select a mentor first");
        return;
      }
      const payload = buildSessionPayload({
        mentorId: String(mentor.id),
        topic: sessionData.goal || sessionData.mentorName,
        sessionDate: sessionData.date || sessionData.datetime?.split("T")[0],
        sessionTime:
          sessionData.time || sessionData.datetime?.split("T")[1]?.slice(0, 5),

        timezone: sessionData.timezone,
        notes: sessionData.goal,
        mentorName: mentor.name,
        aiQuestions: sessionData.aiQuestions || [],
        aiPrepSheet: sessionData.aiPrepSheet || null,
        mentorPrice: normalizeMentorPrice(mentor),
      });
      if (sessionData.datetime) {
        payload.datetime = sessionData.datetime;
      }

      const bookingAmount = normalizeMentorPrice(mentor);

      const res = await createPrivateSession({
        ...payload,
        bookingAmount,
        privateBooking: true,
      });
      const sessionRequest = res?.sessionRequest || res?.session || res || {};
      const meetLink =
        sessionRequest.meetLink ||
        sessionRequest.meetingLink ||
        sessionRequest.googleMeetLink ||
        `https://meet.google.com/${String(sessionRequest.id || Date.now()).slice(-3)}-${String(Date.now()).slice(-4)}-${String(Date.now()).slice(-3)}`;

      setBookedSession({
        mentorName: sessionRequest.mentor?.name || mentor.name,
        date: sessionRequest.sessionDate || sessionData.date,
        time: sessionRequest.sessionTime || sessionData.time,
        meetLink,
        bookingType: sessionData.bookingType || "PRIVATE_BOOKING",
        bookingLabel: sessionData.bookingLabel || "Private booking",
        priceSummary: sessionData.priceSummary || null,
        aiPrepSheet: sessionData.aiPrepSheet || null,
      });

      setShowBookModal(false);
      setShowSuccessModal(true);
      toast.success("Booking created successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to create session");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar userInfo={userInfo} onNavigate={onNavigate} />

      <div className="flex-1 min-w-0 md:ml-0">
        <div
          className="
    sticky
    top-0
    z-30
    bg-slate-900
    border-b
    border-slate-800
    p-4
    sm:p-6
    md:p-8
  "
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 break-words">
            Welcome back!
          </h1>

          <p className="text-slate-400 mt-2">
            Discover mentors who align with your goals.
          </p>
        </div>
        <div className="p-4 sm:p-6 md:p-8 min-w-0">
          {activeTab === "recommended" && (
            <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <AICommandCenter userInfo={userInfo} onPrepSheet={setPrepSheet} />
              {prepSheet && (
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Session Notes
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-100">
                    Your AI Summary
                  </h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-300">
                    {prepSheet.summary && (
                      <p className="leading-6">{prepSheet.summary}</p>
                    )}
                  </div>
                </div>
              )}
              <WalletCard
                wallet={wallet}
                shareLink={requestFundsLink}
                onCopyShareLink={async () => {
                  try {
                    await navigator.clipboard.writeText(requestFundsLink);
                    toast.success("Request funds link copied");
                  } catch (e) {
                    toast.error("Could not copy share link");
                  }
                }}
                shareLinkText={
                  walletLoading ? "Loading..." : "Share request link"
                }
                balanceLabel="Wallet balance"
                onRequestFunds={() => setShowSponsorCheckout(true)}
                onViewTransactions={() => onNavigate("/wallet/transactions")}
              />
            </div>
          )}

          <div>
            {activeTab === "recommended" && (
              <div id="recommended-section">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-slate-100">
                    Mentors for You
                  </h2>
                  <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                    Freemium: Free masterclasses + Premium 1-on-1
                  </div>
                </div>
                <div className="mb-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Wallet request amount
                    </p>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      onBlur={() =>
                        syncRequestState({
                          amount: requestAmount,
                          note: requestNote,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Request note
                    </p>
                    <input
                      type="text"
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      onBlur={() =>
                        syncRequestState({
                          amount: requestAmount,
                          note: requestNote,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                {loadingMentors && (
                  <p className="text-slate-400 mb-4">Loading mentors...</p>
                )}
                {mentorsError && (
                  <p className="text-red-400 mb-4">{mentorsError}</p>
                )}
                {!loadingMentors && !mentorsError && mentors.length === 0 && (
                  <p className="text-slate-400 mb-4">
                    No mentors found at this time.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onBookSession={(id) => {
                        const selectedMentor = mentors.find((m) => m.id === id);
                        const selectedPrice =
                          normalizeMentorPrice(selectedMentor);
                        const fallbackPrice = Number(
                          selectedMentor?.mentorProfile?.sessionPrice ??
                            selectedMentor?.mentorProfile?.price ??
                            0,
                        );
                        const finalPrice = selectedPrice || fallbackPrice;
                        console.log("Selected mentor for booking:", {
                          mentor: selectedMentor,
                          sessionPrice: finalPrice,
                          mentorProfilePrice:
                            selectedMentor?.mentorProfile?.sessionPrice,
                        });
                        setSelectedMentorForBooking({
                          ...selectedMentor,
                          sessionPrice: finalPrice,
                          mentorProfilePrice:
                            selectedMentor?.mentorProfile?.sessionPrice,
                        });

                        setShowBookModal(true);
                      }}
                      onExplain={(m) => setSelectedMentorForExplain(m)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "groupsessions" && (
              <div id="group-sessions-section">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">
                  Available Group Sessions
                </h2>
                <GroupSessionsList />
              </div>
            )}

            {activeTab === "sessions" && (
              <MenteeSessions onNavigate={onNavigate} mentors={mentors} />
            )}

            {activeTab === "schedule" && (
              <div id="schedule-section">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">
                  Your Schedule
                </h2>
                {/* Reuse sessions view for schedule overview for now */}
                <MenteeSessions onNavigate={onNavigate} mentors={mentors} />
              </div>
            )}

            {activeTab === "proposals" && (
              <div id="proposals-section">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">
                  Proposals
                </h2>
                <p className="text-slate-400">
                  You don't have any proposals yet.
                </p>
              </div>
            )}

            {activeTab === "requests" && (
              <div id="requests-section">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">
                  Requests
                </h2>
                <p className="text-slate-400">
                  You have no requests at the moment.
                </p>
              </div>
            )}

            {activeTab === "profile" && (
              <MenteeProfile
                userInfo={userInfo}
                universitySuggestions={universitySuggestions}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </div>
      </div>

      {showBookModal && selectedMentorForBooking && (
        <BookSessionModal
          mentor={selectedMentorForBooking}
          onConfirm={handleConfirmInitialBooking}
          confirmLabel="Confirm Booking"
          onClose={() => setShowBookModal(false)}
          price={Number(normalizeMentorPrice(selectedMentorForBooking) ?? 0)}
          walletBalance={Number(wallet?.currentBalance || 0)}
        />
      )}

      {showSuccessModal && bookedSession && (
        <SuccessModal
          sessionDetails={bookedSession}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {selectedMentorForExplain && (
        <MentorExplainModal
          open={Boolean(selectedMentorForExplain)}
          mentor={selectedMentorForExplain}
          onClose={() => setSelectedMentorForExplain(null)}
        />
      )}

      {showSponsorCheckout && (
        <WalletFundModal
          amount={Number(requestAmount || 0)}
          menteeName={userInfo?.name || "Mentee"}
          shareLink={requestFundsLink ? `${requestFundsLink}&sponsor=1` : ""}
          onClose={() => setShowSponsorCheckout(false)}
          onConfirm={async (fundingAmount) => {
            try {
              const nextAmount = Number(fundingAmount || requestAmount || 0);
              setRequestAmount(String(nextAmount));
              syncRequestState({ amount: nextAmount, note: requestNote });

              const [walletResp, transactionsResp, requestLink] =
                await Promise.all([
                  fetchMyWallet(),
                  fetchMyWalletTransactions(),
                  createWalletRequestLink({
                    amount: nextAmount,
                    note: requestNote,
                  }),
                ]);

              const fetchedWallet = walletResp?.wallet || walletResp || {};
              const transactions = Array.isArray(transactionsResp?.transactions)
                ? transactionsResp.transactions
                : Array.isArray(fetchedWallet?.transactionHistory)
                  ? fetchedWallet.transactionHistory
                  : [];

              const updatedWallet = {
                ...fetchedWallet,
                currentBalance:
                  transactionsResp?.balance ??
                  fetchedWallet?.currentBalance ??
                  0,
                escrowBalance:
                  transactionsResp?.escrowBalance ??
                  fetchedWallet?.escrowBalance ??
                  0,
                transactionHistory: transactions,
                requestLinks: [
                  requestLink?.requestLink,
                  ...(fetchedWallet?.requestLinks || []),
                ].filter(Boolean),
              };

              persistWallet(updatedWallet);
              setShowSponsorCheckout(false);
              toast.success(
                `Wallet funded successfully. New balance: ₦${Number(updatedWallet.currentBalance || 0).toFixed(2)}`,
              );
            } catch (err) {
              toast.error(err.message || "Failed to fund wallet");
            }
          }}
        />
      )}
    </div>
  );
}
