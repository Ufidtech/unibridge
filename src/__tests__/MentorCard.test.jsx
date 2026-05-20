import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MentorCard from '../components/mentor/MentorCard';

describe('MentorCard', () => {
  it('displays computed rating when provided', () => {
    const mentor = { id: 'm1', initials: 'UF', name: 'Umar', university: 'FUT', level: '300L', bio: 'bio', skills: [], rating: 4.9, reviews: 12, responseTime: '2 hours' };
    render(<MentorCard mentor={mentor} computedRating={{ average: 4.2, count: 5 }} />);
    expect(screen.getByText('4.2')).toBeDefined();
    expect(screen.getByText('(5)')).toBeDefined();
  });
});
