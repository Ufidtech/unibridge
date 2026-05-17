import { useState } from "react";

export default function PendingRequest({
  request,
  onAccept = () => {},
  onDecline = () => {},
}) {
  const [showProfile, setShowProfile] = useState(false);

  const mentee = request?.mentee || {};
  const menteeProfile = mentee?.menteeProfile || {};

  const menteeName =
    mentee?.name ||
    request?.studentName ||
    "Unknown Student";

  const menteeEmail =
    mentee?.email || "No email";

  const menteeSchool =
    menteeProfile?.school ||
    "School not specified";

  const menteeClass =
    menteeProfile?.classLevel ||
    "Class not specified";

  const menteeCourse =
    menteeProfile?.dreamCourse ||
    "Not specified";

  const menteeBio =
    menteeProfile?.bio ||
    "";

  const menteeVibes = Array.isArray(
    menteeProfile?.selectedVibes
  )
    ? menteeProfile.selectedVibes
    : [];

  const aiQuestions = Array.isArray(request?.aiQuestions)
    ? request.aiQuestions
    : [];

  return (
    <>
      <div className="bg-slate-900 border-2 border-blue-500/30 rounded-xl p-6 mb-6 hover:border-blue-500 transition">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {menteeName}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              {menteeClass} • {menteeCourse}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {menteeEmail}
            </p>
          </div>

          <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-semibold rounded-full">
            Pending
          </span>
        </div>

        {/* Topic */}
        <div className="mb-5">
          <p className="text-slate-300">
            <span className="font-semibold">
              Topic:
            </span>{" "}
            {request?.topic || "General Guidance"}
          </p>
        </div>

        {/* AI Questions */}
        {aiQuestions.length > 0 && (
          <div className="bg-slate-950 border border-blue-600/30 rounded-lg p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span>✨</span>

              <p className="font-semibold text-blue-400 text-sm">
                AI Pre-Screened Questions
              </p>
            </div>

            <ul className="space-y-2">
              {aiQuestions.map((question, idx) => (
                <li
                  key={idx}
                  className="text-slate-300 text-sm flex items-start gap-2"
                >
                  <span className="text-blue-500">
                    •
                  </span>

                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span>📅</span>

            <p className="font-semibold text-blue-400 text-sm">
              Session Schedule
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              <span className="text-slate-500">
                Date:
              </span>{" "}
              {request?.sessionDate || "-"}
            </p>

            <p className="text-slate-300">
              <span className="text-slate-500">
                Time:
              </span>{" "}
              {request?.sessionTime || "-"}
            </p>
          </div>
        </div>

        {/* View Profile */}
        <button
          onClick={() => setShowProfile(true)}
          className="w-full mb-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg transition"
        >
          View Full Mentee Profile
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
          >
            ✓ Accept
          </button>

          <button
            onClick={() => onDecline(request.id)}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
          >
            Decline
          </button>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {menteeName}
                </h2>

                <p className="text-slate-400 mt-1">
                  {menteeEmail}
                </p>
              </div>

              <button
                onClick={() => setShowProfile(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Profile Body */}
            <div className="space-y-6">
              
              {/* School */}
              <div>
                <p className="text-slate-500 text-sm mb-1">
                  School
                </p>

                <p className="text-white">
                  {menteeSchool}
                </p>
              </div>

              {/* Class */}
              <div>
                <p className="text-slate-500 text-sm mb-1">
                  Class Level
                </p>

                <p className="text-white">
                  {menteeClass}
                </p>
              </div>

              {/* Dream Course */}
              <div>
                <p className="text-slate-500 text-sm mb-1">
                  Dream Course
                </p>

                <p className="text-white">
                  {menteeCourse}
                </p>
              </div>

              {/* Bio */}
              {menteeBio && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">
                    Bio
                  </p>

                  <p className="text-slate-300 leading-relaxed">
                    {menteeBio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {menteeVibes.length > 0 && (
                <div>
                  <p className="text-slate-500 text-sm mb-2">
                    Interests / Vibes
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {menteeVibes.map((vibe, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}