// src/lib/api/mentorsApi.js

export async function fetchMentors() {
  const resp = await fetch('/api/mentors');
  if (!resp.ok) throw new Error('Failed to fetch mentors');
  return resp.json();
}

export async function fetchMentorById(id) {
  const resp = await fetch(`/api/mentors/${id}`);
  if (!resp.ok) throw new Error('Failed to fetch mentor');
  return resp.json();
}