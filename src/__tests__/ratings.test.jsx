import { describe, it, expect } from 'vitest';
import { computeAverageRatingFromSessions } from '../lib/ratings';

describe('computeAverageRatingFromSessions', () => {
  it('returns 0 when no sessions', () => {
    const res = computeAverageRatingFromSessions([]);
    expect(res).toEqual({ average: 0, count: 0 });
  });

  it('computes average across sessions for a mentor', () => {
    const sessions = [
      { mentorId: 'm1', ratings: [{ rating: 5 }, { rating: 4 }] },
      { mentorId: 'm1', ratings: [{ rating: 3 }] },
      { mentorId: 'm2', ratings: [{ rating: 5 }] },
    ];
    const res = computeAverageRatingFromSessions(sessions, 'm1');
    // ratings: 5,4,3 -> avg = 4.0, count=3
    expect(res.average).toBe(4.0);
    expect(res.count).toBe(3);
  });
});
