import { useState } from 'react';
import BookSessionModal from './BookSessionModal';
import SuccessModal from './SuccessModal';

export default function ModalDemo() {
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);

  const mentorData = {
    name: 'Umar Farooq',
    initials: 'UF',
    level: '300L',
    university: 'FUT Minna',
    bio: 'Frontend Dev and AI enthusiast',
  };

  const handleConfirmBooking = (sessionData) => {
    setBookedSession({
      mentorName: sessionData.mentorName,
      date: sessionData.date,
      time: sessionData.time,
      meetLink: 'https://meet.google.com/abc-defg-hij',
    });
    setShowBookModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            Action Modals Demo
          </h1>
          <p className="text-lg text-slate-400">
            Interactive booking and success modals
          </p>
        </div>

        {/* Demo Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Session Modal Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              📅 Book Session Modal
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Modal shows mentor profile, date/time picker, goal textarea, AI-suggested questions, and confirmation button.
            </p>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
            >
              Open Book Session
            </button>
          </div>

          {/* Success Modal Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              ✅ Success Modal
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Modal displays green checkmark, session details, copyable Meet link, and interactive prep checklist.
            </p>
            <button
              onClick={() => setShowSuccessModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition"
            >
              Open Success State
            </button>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-slate-100 mb-6">Features</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Book Session Features */}
            <div>
              <h4 className="font-bold text-blue-400 mb-4">Book Session Modal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  Mentor mini-profile with initials avatar
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  Date picker with 4 available dates
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  Time slot selection (4 slots)
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  Goal textarea for session purpose
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  AI Suggested Questions highlight box
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">✓</span>
                  Confirm/Cancel buttons with validation
                </li>
              </ul>
            </div>

            {/* Success Modal Features */}
            <div>
              <h4 className="font-bold text-green-400 mb-4">Success Modal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Large green checkmark icon
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Session confirmed message
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Session details display
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Copyable Google Meet link
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Interactive AI Prep Sheet checklist
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  Back to Dashboard button
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Design Notes</h3>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>• Both modals use <code className="bg-slate-800 px-2 py-1 rounded">bg-black/70</code> backdrop</li>
            <li>• Mobile-safe with <code className="bg-slate-800 px-2 py-1 rounded">p-4</code> padding that prevents edge touching</li>
            <li>• Max-width of 28rem (448px) for comfortable reading on mobile</li>
            <li>• Scrollable content area for long lists on small screens</li>
            <li>• All form inputs follow design system (blue focus rings, slate colors)</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookSessionModal
          mentor={mentorData}
          onConfirm={handleConfirmBooking}
          onClose={() => setShowBookModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          sessionDetails={bookedSession || {
            mentorName: 'Umar Farooq',
            date: '2026-05-15',
            time: '2:00 PM',
            meetLink: 'https://meet.google.com/abc-defg-hij',
          }}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
}
