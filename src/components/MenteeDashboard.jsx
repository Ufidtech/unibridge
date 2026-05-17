import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import AICommandCenter from './AICommandCenter';
import MentorCard from './MentorCard';
import MentorExplainModal from './MentorExplainModal';
import MenteeSessions from './MenteeSessions';
import MenteeProfile from './MenteeProfile';
import { createSession } from '../lib/api/sessions'; // Updated to use your new API structure
import { fetchMentors } from '../lib/api/mentorsApi';
import { buildSessionPayload } from '../lib/session';
import BookSessionModal from './BookSessionModal';
import SuccessModal from './SuccessModal';
import NIGERIA_UNIVERSITIES from '../data/nigeriaUniversities';

export default function MenteeDashboard({ userInfo = { name: 'Ibrahim', level: 'SS3' }, onNavigate = () => {} }) {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const activeTab = qs.get('tab') || 'recommended';

  // Initialize with an empty array instead of default mentors
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [mentorsError, setMentorsError] = useState(null);

  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);
  const [selectedMentorForExplain, setSelectedMentorForExplain] = useState(null);

  // Scroll to section handling
  useEffect(() => {
    if (activeTab === 'recommended' && location.hash === '#recommended') {
      const el = document.getElementById('recommended-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-yellow-400', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400', 'ring-offset-2'), 2200);
      }
    }
  }, [activeTab, location.hash]);

  // Fetch Mentors (AI Recommendations fallback to All Mentors)
  useEffect(() => {
    async function loadMentorsData() {
      setLoadingMentors(true);
      setMentorsError(null);

      try {
        // Try fetching AI recommendations first
        if (userInfo?.id) {
          const resp = await fetch('/api/ai/recommend-mentors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menteeId: userInfo.id, limit: 12 }),
          });

          if (resp.ok) {
            const data = await resp.json();
            const list = Array.isArray(data.mentors) ? data.mentors : [];

            if (list.length > 0) {
              const uiList = list.map((m, i) => ({
                id: m.id || `m-${i}`,
                name: m.name || m.fullName || 'Unknown',
                initials: m.name ? m.name.split(' ').slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') : '??',
                university: m.university || '',
                level: m.level || '',
                bio: m.bio || '',
                skills: m.skills || [],
                rating: m.rating || 0,
                reviews: m.reviews || 0,
              }));
              setMentors(uiList);
              return; // Successfully loaded recommendations, exit early
            }
          }
        }

        // Fallback: If AI fails or returns empty, fetch ALL mentors from the database
        const data = await fetchMentors();
        const generalMentors = (data.mentors || []).map(m => ({
          ...m,
          // Ensure initials exist just in case the backend missed it
          initials: m.initials || (m.name ? m.name.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase()).join('') : '??')
        }));
        
        setMentors(generalMentors);

      } catch (err) {
        console.error('Failed to load mentors:', err);
        setMentorsError(String(err.message || err));
        setMentors([]); // Reset on failure
      } finally {
        setLoadingMentors(false);
      }
    }

    loadMentorsData();
  }, [userInfo?.id]);

  const universitySuggestions = Array.from(new Set([
    ...mentors.map((m) => m.university).filter(Boolean),
    ...NIGERIA_UNIVERSITIES.map((u) => u.name),
  ])).filter(Boolean);

  const handleConfirmInitialBooking = async (sessionData) => {
    try {
      const mentor = selectedMentorForBooking;
      const payload = buildSessionPayload({
        mentorId: String(mentor.id),
        topic: sessionData.goal || sessionData.mentorName,
        sessionDate: sessionData.date || sessionData.datetime?.split('T')[0],
        sessionTime: sessionData.time || sessionData.datetime?.split('T')[1].slice(0,5),
        timezone: sessionData.timezone,
        notes: sessionData.goal,
        mentorName: mentor.name,
      });

      const res = await createSession(payload);
      setBookedSession({
        mentorName: res.sessionRequest.mentor?.name || mentor.name,
        date: res.sessionRequest.sessionDate,
        time: res.sessionRequest.sessionTime,
        meetLink: res.sessionRequest.meetLink,
      });

      setShowBookModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      toast.error('Failed to create session: ' + (err.message || err));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar userInfo={userInfo} onNavigate={onNavigate} />

      <div className="flex-1 md:ml-0">
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 mt-12 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Welcome back!</h1>
          <p className="text-slate-400 mt-2">Discover mentors who align with your goals.</p>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'recommended' && (
            <div className="mb-12"><AICommandCenter userInfo={userInfo} /></div>
          )}

          <div>
            {activeTab === 'recommended' && (
              <div id="recommended-section">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Mentors for You</h2>
                
                {loadingMentors && <p className="text-slate-400 mb-4">Loading mentors...</p>}
                {mentorsError && <p className="text-red-400 mb-4">{mentorsError}</p>}
                {!loadingMentors && !mentorsError && mentors.length === 0 && (
                  <p className="text-slate-400 mb-4">No mentors found at this time.</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onBookSession={(id) => { setSelectedMentorForBooking(mentors.find(m => m.id === id)); setShowBookModal(true); }}
                      onExplain={(m) => setSelectedMentorForExplain(m)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <MenteeSessions onNavigate={onNavigate} mentors={mentors} />
            )}

            {activeTab === 'profile' && (
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
        />
      )}

      {showSuccessModal && bookedSession && (
        <SuccessModal sessionDetails={bookedSession} onClose={() => setShowSuccessModal(false)} />
      )}

      {selectedMentorForExplain && (
        <MentorExplainModal open={true} mentor={selectedMentorForExplain} onClose={() => setSelectedMentorForExplain(null)} />
      )}
    </div>
  );
}