export default function MentorCard({
  mentor = {},
  onBookSession = () => {},
  onExplain = () => {},
  computedRating = null,
}) {
  const rawRating = computedRating?.average ?? mentor?.rating ?? 0;

  const displayRating = Number(rawRating).toFixed(1);
  const displayCount = computedRating?.count ?? mentor?.reviews ?? 0;

  const breakdown = mentor?.breakdown || {};
  const dreamMatch = breakdown.dreamSkillJaccard
    ? Math.round(Number(breakdown.dreamSkillJaccard) * 100)
    : 0;
  const interestMatch = breakdown.interestSkillJaccard
    ? Math.round(Number(breakdown.interestSkillJaccard) * 100)
    : 0;
  const availability =
    breakdown.availabilityScore != null
      ? Math.round(Number(breakdown.availabilityScore) * 100)
      : null;
  const vibes = Number(breakdown.vibeMatches) || 0;

  const initials = mentor?.initials || "??";
  const name = mentor?.name || "Unknown Mentor";
  const university = mentor?.university || "University Not Listed";
  const level = mentor?.level || "";
  const bio = mentor?.bio || "No bio provided.";
  const skills = Array.isArray(mentor?.skills) ? mentor.skills : [];
  const responseTime = mentor?.responseTime || "Response time unknown";
  const rawSessionPrice =
    mentor?.sessionPrice ??
    mentor?.mentorProfile?.sessionPrice ??
    mentor?.mentorProfilePrice ??
    mentor?.price ??
    mentor?.bookingPrice ??
    mentor?.session_price ??
    mentor?.mentorPrice ??
    mentor?.amount ??
    mentor?.rate ??
    mentor?.pricing?.session ??
    mentor?.pricing?.price ??
    0;

  const sessionPriceValue = Number(rawSessionPrice);
  const sessionPrice = Number.isFinite(sessionPriceValue)
    ? sessionPriceValue
    : 0;
  const menteeFee = Number((sessionPrice * 0.1).toFixed(2));
  const menteeTotal = Number((sessionPrice + menteeFee).toFixed(2));
  const priceLabel =
    mentor?.priceLabel || mentor?.pricingLabel || mentor?.currency || "₦";

  const freemiumSplit = mentor?.freemiumSplit || { free: true, premium: true };
  const isFreeVisible = freemiumSplit?.free !== false;
  const isPremiumVisible = freemiumSplit?.premium !== false;
  const bookingGoal =
    mentor?.bookingGoal || mentor?.goal || mentor?.targetGoal || "";
  const aiPrepSheet = mentor?.aiPrepSheet || null;
  const aiSuggestedQuestions = Array.isArray(mentor?.aiQuestions)
    ? mentor.aiQuestions
    : Array.isArray(mentor?.suggestedQuestions)
      ? mentor.suggestedQuestions
      : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shrink-0">
          {initials}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-100 mb-1">{name}</h3>

        {/* University & Level */}
        <p className="text-sm text-slate-400 mb-3">
          {university} {level && `• ${level}`}
        </p>

        {/* Bio - 2 lines */}
        <p className="text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed flex-1">
          {bio}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-xs font-medium">
              +{skills.length - 3}
            </span>
          )}
        </div>

        {/* Rating & Response Rate */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-semibold text-slate-300">
              {displayRating}
            </span>
            {/* Always show the review count now */}
            <span className="text-xs text-slate-500">({displayCount})</span>
          </div>
          <p className="text-xs text-slate-400">{responseTime}</p>
        </div>

        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <p className="text-xs text-slate-400">Session price</p>
          <p className="text-sm font-semibold text-emerald-300">
            {Number.isFinite(sessionPrice) && sessionPrice >= 0
              ? `${priceLabel}${sessionPrice.toFixed(2)}`
              : "Price not set yet"}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {isFreeVisible ? "Free discovery visible" : "Free discovery hidden"}
            {" • "}
            {isPremiumVisible
              ? `Premium booking available • Total ${priceLabel}${menteeTotal.toFixed(2)}`
              : "Premium booking hidden"}
          </p>
        </div>

        {/* Recommendation breakdown */}
        {mentor.breakdown && (
          <div className="mb-4 text-xs text-slate-400">
            <div className="font-semibold text-slate-200 mb-1">
              Why this mentor?
            </div>
            <ul className="list-disc list-inside space-y-1">
              {dreamMatch > 0 && (
                <li>Matches your course focus ({dreamMatch}%)</li>
              )}
              {interestMatch > 0 && <li>Relevant skills ({interestMatch}%)</li>}
              {vibes > 0 && (
                <li>
                  {vibes} shared vibe{vibes > 1 ? "s" : ""}
                </li>
              )}
              {availability !== null && (
                <li>Availability score: {availability}%</li>
              )}
            </ul>
          </div>
        )}

        {bookingGoal && (
          <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-slate-300">
            <p className="text-[11px] uppercase tracking-wide text-blue-300">
              Mentee booking goal
            </p>
            <p className="mt-1 leading-5">{bookingGoal}</p>
          </div>
        )}

        {(aiPrepSheet || aiSuggestedQuestions.length > 0) && (
          <div className="mb-4 grid gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-300">
            {aiPrepSheet && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Mentor prep notes
                </p>
                <p className="mt-1 leading-5 text-slate-300">
                  {aiPrepSheet.summary ||
                    aiPrepSheet.title ||
                    "Prepared session context"}
                </p>
              </div>
            )}
            {aiSuggestedQuestions.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  AI suggested questions
                </p>
                <ul className="mt-1 space-y-1">
                  {aiSuggestedQuestions.slice(0, 4).map((question, idx) => (
                    <li key={idx} className="leading-5">
                      • {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => onBookSession(mentor.id)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition cursor-pointer"
          >
            Book Session
          </button>
          <button
            onClick={() => onExplain(mentor)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
          >
            Explain
          </button>
        </div>
      </div>
    </div>
  );
}
