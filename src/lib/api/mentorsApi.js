// src/lib/api/mentorsApi.js

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? "/_/backend" : "");

export async function fetchMentors() {
  const resp = await fetch(`${API_BASE}/api/mentors`);
  if (!resp.ok) throw new Error('Failed to fetch mentors');
  return resp.json();
}

export async function fetchMentorById(id) {
  const resp = await fetch(`${API_BASE}/api/mentors/${id}`);
  if (!resp.ok) throw new Error('Failed to fetch mentor');
  return resp.json();
}