import { useState } from 'react';
import Sidebar from './Sidebar';
import AICommandCenter from './AICommandCenter';
import MentorCard from './MentorCard';
import BookSessionModal from './BookSessionModal';
import SuccessModal from './SuccessModal';

export default function MenteeDashboard({ userInfo = { name: 'Ibrahim', level: 'SS3' }, onNavigate = () => {} }) {
  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);

  const [mentors] = useState([
    {
      id: 1,
      initials: 'UF',
      name: 'Umar Farooq',
      university: 'FUT Minna',
      level: '300L',
      bio: 'Frontend Dev and AI enthusiast. Help you balance GPA with coding. Avoid fresher mistakes.',
      skills: ['Frontend', 'React', 'Tech & CGPA'],
      rating: 4.9,
      reviews: 28,
      responseTime: '2 hours',
    },
    {
      id: 2,
      initials: 'AJ',
      name: 'Aisha Johnson',
      university: 'University of Lagos',
      level: '400L',
      bio: 'Med student with 4.3 CGPA. Specialize in JAMB prep and pre-med strategies. Helped 45+ students.',
      skills: ['JAMB Prep', 'Medical Track', 'Leadership'],
      rating: 4.8,
      reviews: 45,
      responseTime: '1 hour',
    },
    {
      id: 3,
      initials: 'CK',
      name: 'Chisom Kwame',
      university: 'Covenant University',
      level: '300L',
      bio: 'Engineering student, 1st Class holder. Expert in physics prep and engineering stack.',
      skills: ['Engineering', 'Physics', 'Problem Solving'],
      rating: 5.0,
      reviews: 32,
      responseTime: '30 mins',
    },
    {
      id: 4,
      initials: 'TO',
      name: 'Tunde Okafor',
      university: 'OAU',
      level: '200L',
      bio: 'Recent top performer. Can help with course selection and hostel survival tips.',
      skills: ['Hostel Life', 'Course Selection', 'Networking'],
      rating: 4.7,
      reviews: 19,
      responseTime: '3 hours',
    },
    {
      id: 5,
      initials: 'LD',
      name: 'Lara Dada',
      university: 'University of Ibadan',
      level: '400L',
      bio: 'Tech entrepreneur and CS graduate. Help students transition from academics to industry.',
      skills: ['Tech Career', 'Startups', 'JavaScript'],
      rating: 4.9,
      reviews: 51,
      responseTime: '2 hours',
    },
    {
      id: 6,
      initials: 'NE',
      name: 'Nonso Eze',
      university: 'ABU',
      level: '300L',
      bio: 'Business student with scholarship. Expert in scholarship applications and campus leadership.',
      skills: ['Scholarships', 'Leadership', 'Business'],
      rating: 4.8,
      reviews: 24,
      responseTime: '4 hours',
    },
  ]);

  const handleBookSession = (mentorId) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    setSelectedMentorForBooking(mentor);
    setShowBookModal(true);
  };

  const handleConfirmBooking = (sessionData) => {
    setBookedSession({
      mentorName: sessionData.mentorName,
      date: sessionData.date,
      time: sessionData.time,
      meetLink: 'https://meet.google.com/abc-defg-hij-' + Math.random().toString(36).substr(2, 9),
    });
    setShowBookModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setSelectedMentorForBooking(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar userInfo={userInfo} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 mt-12 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            Welcome back! Let's plan your journey.
          </h1>
          <p className="text-slate-400 mt-2">
            Discover mentors who align with your goals and aspirations.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-6 md:p-8">
          {/* AI Command Center */}
          <div className="mb-12">
            <AICommandCenter />
          </div>

          {/* Mentor Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              Recommended for You
            </h2>

            {/* Responsive Grid: 1 col (mobile) → 3 cols (desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onBookSession={handleBookSession}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookModal && selectedMentorForBooking && (
        <BookSessionModal
          mentor={selectedMentorForBooking}
          onConfirm={handleConfirmBooking}
          onClose={() => setShowBookModal(false)}
        />
      )}

      {showSuccessModal && bookedSession && (
        <SuccessModal
          sessionDetails={bookedSession}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
}
