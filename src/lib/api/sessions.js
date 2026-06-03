import { apiRequest } from "./client";

/**
 * Mentor-specific group session endpoints
 */
export async function createGroupSession(payload) {
  console.log("Sending mentor group session:", payload);

  return apiRequest("/api/sessions/mentor-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchSessionsForMentees() {
  return apiRequest("/api/sessions/mentor-session/public");
}

export async function fetchMentorSessions() {
  return apiRequest("/api/sessions/mentor-session");
}

export async function rsvpMentorGroupSession(sessionId) {
  return apiRequest(`/api/sessions/mentor-session/${sessionId}/rsvp`, {
    method: "POST",
  });
}

export async function notifyRegisteredMentees(sessionId) {
  return apiRequest(`/api/sessions/mentor-session/${sessionId}/notify-registered`, {
    method: "POST",
  });
}


/**
 * Existing session helpers
 */
export async function fetchSessions() {
  return apiRequest("/api/sessions");
}

export async function createSession(payload) {
  console.log("📝 Creating session:", payload);

  return apiRequest("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export async function mentorReschedule(sessionId, sessionDate, sessionTime, timezone) {
  console.log("📅 Mentor rescheduling session:", {
    sessionId,
    sessionDate,
    sessionTime,
    timezone,
  });

  return apiRequest(`/api/sessions/${sessionId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({
      sessionDate,
      sessionTime,
      timezone,
    }),
  });
}

export async function proposeNewTime(sessionId, sessionDate, sessionTime, notes = "") {
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

export async function respondToProposal(sessionId, proposalId, status) {
  console.log("📨 Responding to proposal:", {
    sessionId,
    proposalId,
    status,
  });

  return apiRequest(`/api/sessions/${sessionId}/proposals/${proposalId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function cancelSession(sessionId) {
  console.log("❌ Cancelling session:", sessionId);

  return apiRequest(`/api/sessions/${sessionId}/cancel`, {
    method: "PATCH",
  });
}

export async function mentorComplete(sessionId, proof, notes) {
  console.log("✅ Completing session:", { sessionId });

  return apiRequest(`/api/sessions/${sessionId}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ proof, notes }),
  });
}

// Mentor-specific wrappers that call mentor-session endpoints
export async function updateMentorSession(sessionId, payload) {
  console.log("✏️ Updating mentor session:", { sessionId, payload });

  return apiRequest(`/api/sessions/mentor-session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function cancelMentorSession(sessionId) {
  console.log("❌ Cancelling mentor session:", sessionId);

  return apiRequest(`/api/sessions/mentor-session/${sessionId}/cancel`, {
    method: "PATCH",
  });
}

export async function completeMentorSession(sessionId, proof, notes) {
  console.log("✅ Completing mentor session:", { sessionId });

  return apiRequest(`/api/sessions/mentor-session/${sessionId}/complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proof, notes }),
  });
}

export async function rateSession(sessionId, rating, feedback) {
  console.log("⭐ Rating session:", { sessionId, rating });

  return apiRequest(`/api/sessions/${sessionId}/rate`, {
    method: "POST",
    body: JSON.stringify({ rating, feedback }),
  });
}