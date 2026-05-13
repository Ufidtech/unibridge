import { useState } from 'react';
import MentorSidebar from './MentorSidebar';
import StatCard from './StatCard';
import PendingRequest from './PendingRequest';
import UpcomingSession from './UpcomingSession';

export default function MentorDashboard({ mentorInfo = { name: 'Umar Farooq', role: 'Mentor' }, onNavigate = () => {} }) {
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      studentName: 'Ibrahim',
      studentClass: 'SS3',
      dreamCourse: 'Computer Science',
      topic: 'How to balance JAMB prep with learning React?',
      aiQuestions: [
        "What's your current JAMB study schedule like?",
        "How many hours per week can you dedicate to learning React?",
        "Have you built any projects before?",
      ],
    },
    {
      id: 2,
      studentName: 'Zainab',
      studentClass: 'SS2',
      dreamCourse: 'Medicine',
      topic: 'Pre-med preparation and time management',
      aiQuestions: [
        "What are your current grades in science subjects?",
        "How do you plan to manage clinical exposure during pre-med?",
        "What challenges are you anticipating?",
      ],
    },
  ]);

  const [upcomingSessions] = useState([
    {
      id: 1,
      studentName: 'Chioma',
      studentInitials: 'CH',
      studentClass: '100L',
      topic: 'Frontend Development Tips',
      date: 'May 15, 2026',
      time: '2:00 PM',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 2,
      studentName: 'Tunde',
      studentInitials: 'TU',
      studentClass: 'SS3',
      topic: 'Career Path in Tech',
      date: 'May 16, 2026',
      time: '3:30 PM',
      meetLink: 'https://meet.google.com/xyz-uvwx-abc',
    },
  ]);

  const stats = [
    {
      label: 'Students Mentored',
      value: '23',
      icon: '👥',
      subtext: '+5 this month',
    },
    {
      label: 'Upcoming Sessions',
      value: '2',
      icon: '📅',
      subtext: 'Next: Today at 2 PM',
    },
    {
      label: 'Average Rating',
      value: '4.9',
      icon: '⭐',
      subtext: 'Based on 28 reviews',
      variant: 'success',
    },
  ];

  const handleAcceptRequest = (requestId) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
    alert('Request accepted! Session scheduled.');
  };

  const handleDeclineRequest = (requestId) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
    alert('Request declined.');
  };

  const handleJoinMeet = (sessionId) => {
    const session = upcomingSessions.find((s) => s.id === sessionId);
    window.open(session.meetLink, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <MentorSidebar mentorInfo={mentorInfo} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 mt-12 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            Welcome back, {mentorInfo.name}!
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your sessions and help the next generation succeed.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-6 md:p-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                subtext={stat.subtext}
                variant={stat.variant}
              />
            ))}
          </div>

          {/* Pending Requests Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              📬 Session Requests
              {pendingRequests.length > 0 && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            {pendingRequests.length > 0 ? (
              <div>
                {pendingRequests.map((request) => (
                  <PendingRequest
                    key={request.id}
                    request={request}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  No pending requests. Great work keeping up! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Schedule Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              📅 Upcoming Schedule
            </h2>

            {upcomingSessions.length > 0 ? (
              <div>
                {upcomingSessions.map((session) => (
                  <UpcomingSession
                    key={session.id}
                    session={session}
                    onJoinMeet={handleJoinMeet}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  No upcoming sessions. Schedule is clear!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
