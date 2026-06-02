// RSVP/register for a group session
export async function rsvpGroupSession(sessionId) {
  return apiRequest(`/api/group-sessions/${sessionId}/rsvp`, {
    method: "POST"
  });
}

// Fetch group sessions (already used in GroupSessionsList)
export async function fetchGroupSessions() {
  return apiRequest("/api/group-sessions");
}
