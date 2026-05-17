export function computeAverageRatingFromSessions(sessions = [], mentorId) {
  if (!Array.isArray(sessions) || sessions.length === 0) return { average: 0, count: 0 };
  // collect ratings for sessions that belong to mentorId (if provided) or all ratings
  const ratings = [];
  sessions.forEach((s) => {
    if (mentorId && String(s.mentorId || s.mentor?.id) !== String(mentorId)) return;
    if (Array.isArray(s.ratings)) {
      s.ratings.forEach((r) => {
        if (typeof r.rating === 'number') ratings.push(r.rating);
      });
    }
  });
  if (ratings.length === 0) return { average: 0, count: 0 };
  const sum = ratings.reduce((a, b) => a + b, 0);
  const avg = sum / ratings.length;
  return { average: Math.round(avg * 10) / 10, count: ratings.length };
}
