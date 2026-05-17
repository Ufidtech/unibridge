import React from "react";
import UpcomingSession from "./UpcomingSession";

export default function MentorSchedule({
  upcomingSessions,
  onJoinMeet,
  onReschedule,
  onMarkComplete,
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">
        📅 Upcoming Schedule
      </h2>

      {upcomingSessions.length > 0 ? (
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <UpcomingSession
              key={session.id}
              session={session}
              onJoinMeet={onJoinMeet}
              onReschedule={() => onReschedule(session)}
              onMarkComplete={onMarkComplete}
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
  );
}