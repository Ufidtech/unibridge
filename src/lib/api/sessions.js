import { apiRequest } from "./client";


/**
 * Fetch all sessions
 */
export async function fetchSessions() {
  return apiRequest("/api/sessions");
}

export async function fetchGroupSessions() {
  return apiRequest("/api/group-sessions");
}

export async function createGroupSession(payload) {
  return apiRequest("/api/group-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function joinGroupSession(sessionId) {
  return apiRequest(`/api/group-sessions/${sessionId}/join`, {
    method: "POST",
  });
}

/**
 * Create session request
 */
export async function createSession(payload) {
  console.log("📝 Creating session:", payload);

  return apiRequest("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update session (mentee)
 */
export async function updateSession(sessionId, payload) {
  console.log("✏️ Updating session:", {
    sessionId,
    payload,
  });

  return apiRequest(`/api/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Update session status (mentor)
 */
export async function updateSessionStatus(sessionId, status) {
  console.log("🔄 Updating session status:", {
    sessionId,
    status,
  });

  return apiRequest(`/api/sessions/${sessionId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Mentor reschedule
 */
export async function mentorReschedule(
  sessionId,
  sessionDate,
  sessionTime,
  timezone
) {
  console.log("📅 Mentor rescheduling session:", {
    sessionId,
    sessionDate,
    sessionTime,
    timezone
  });

  return apiRequest(`/api/sessions/${sessionId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({
      sessionDate,
      sessionTime,
      timezone, // Send timezone to backend for accurate calendar syncing
    }),
  });
}

/**
 * Mentee propose new time
 */
export async function proposeNewTime(
  sessionId,
  sessionDate,
  sessionTime,
  notes = ""
) {
  if (!sessionDate || !sessionTime) {
    throw new Error("sessionDate and sessionTime are required");
  }

  return apiRequest(`/api/sessions/${sessionId}/propose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionDate,
      sessionTime,
      notes,
    }),
  });
}

/**
 * Mentor respond to proposal
 */
export async function respondToProposal(
  sessionId,
  proposalId,
  status
) {
  console.log("📨 Responding to proposal:", {
    sessionId,
    proposalId,
    status,
  });

  return apiRequest(
    `/api/sessions/${sessionId}/proposals/${proposalId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

/**
 * Cancel session
 */
export async function cancelSession(sessionId) {
  console.log("❌ Cancelling session:", sessionId);

  return apiRequest(`/api/sessions/${sessionId}/cancel`, {
    method: "PATCH",
  });
}

/**
 * Mentor complete session
 */
export async function mentorComplete(
  sessionId,
  proof,
  notes
) {
  console.log("✅ Completing session:", {
    sessionId,
  });

  return apiRequest(`/api/sessions/${sessionId}/complete`, {
    method: "PATCH",
    body: JSON.stringify({
      proof,
      notes,
    }),
  });
}

/**
 * Mentee rate session
 */
export async function rateSession(
  sessionId,
  rating,
  feedback
) {
  console.log("⭐ Rating session:", {
    sessionId,
    rating,
  });

  return apiRequest(`/api/sessions/${sessionId}/rate`, {
    method: "POST",
    body: JSON.stringify({
      rating,
      feedback,
    }),
  });
}