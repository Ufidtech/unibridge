import React from 'react';

export default function MentorExplainModal({ open, onClose, mentor }) {
  if (!open) return null;

  const bd = mentor?.breakdown || {};
  
  // Format rating and reviews
  const displayRating = Number(mentor?.rating || 0).toFixed(1);
  const displayCount = mentor?.reviews || 0;

  // ==========================================
  // REAL-TIME SCORE CALCULATOR
  // ==========================================
  
  // 1. Get raw values (0 to 1 scale for Jaccard/Bio/Availability)
  const courseMatch = bd.dreamSkillJaccard || 0;
  const interestMatch = bd.interestSkillJaccard || 0;
  const bioMatch = bd.bioMatch || 0;
  const availability = bd.availabilityScore || 0;
  
  // 2. Get raw values for standard numbers
  const ratingRaw = Number(mentor?.rating || 0);
  const vibes = Number(bd.vibeMatches || 0);

  // 3. Apply Weights (Total = 100)
  // Feel free to tweak these multipliers depending on what matters most to your platform!
  const weightedScore = (
    (courseMatch * 35) +          // Course match is worth 35% of the score
    (interestMatch * 30) +        // Interest match is worth 30%
    (availability * 20) +         // Availability is worth 20%
    (bioMatch * 5) +              // Bio similarity is worth 5%
    ((ratingRaw / 5) * 10)        // A 5.0 rating gives the full remaining 10%
  );

  // 4. Add bonus points and cap at 100%
  // Gives +2 bonus points for every shared vibe
  let calculatedScore = Math.round(weightedScore + (vibes * 2));
  if (calculatedScore > 100) calculatedScore = 100;

  const displayScore = `${calculatedScore}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 rounded-lg w-11/12 max-w-xl p-6 border border-slate-800 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100">Why we recommended {mentor?.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer p-1">✕</button>
        </div>

        <div className="text-sm text-slate-300 space-y-3">
          
          {/* Now displaying our actual math! */}
          <p className="text-slate-400 text-base">
            Overall Match Score: <span className="font-bold text-blue-400">{displayScore}</span>
          </p>

          <div className="mt-4">
            <div className="font-medium text-slate-200 mb-1">Match breakdown</div>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Course match: {Math.round(courseMatch * 100)}%</li>
              <li>Interest-&gt;skill match: {Math.round(interestMatch * 100)}%</li>
              <li>Bio similarity: {Math.round(bioMatch * 100)}%</li>
              <li>Shared vibes: {vibes}</li>
              <li>Rating: {displayRating} ⭐</li>
              <li>Reviews: {displayCount}</li>
              <li>Availability score: {Math.round(availability * 100)}%</li>
            </ul>
          </div>

          {mentor?.bio && (
            <div className="mt-4">
              <div className="font-medium text-slate-200 mb-1">Mentor bio</div>
              <p className="text-slate-400 leading-relaxed">{mentor.bio}</p>
            </div>
          )}

          {mentor?.skills && mentor.skills.length > 0 && (
            <div className="mt-4">
              <div className="font-medium text-slate-200 mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg cursor-pointer transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}