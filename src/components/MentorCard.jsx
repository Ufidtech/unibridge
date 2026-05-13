export default function MentorCard({ mentor = {
  id: 1,
  initials: 'UF',
  name: 'Umar Farooq',
  university: 'FUT Minna',
  level: '300L',
  bio: 'I\'m a Frontend Dev and AI enthusiast. I can help you navigate your 100L courses, balance your GPA with learning to code.',
  skills: ['Frontend', 'React', 'Tech & CGPA'],
  rating: 4.9,
  reviews: 28,
  responseTime: '2 hours',
}, onBookSession = () => {} }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition">
      {/* Mentor Avatar & Info */}
      <div className="p-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
          {mentor.initials}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-100 mb-1">
          {mentor.name}
        </h3>

        {/* University & Level */}
        <p className="text-sm text-slate-400 mb-3">
          {mentor.university} • {mentor.level}
        </p>

        {/* Bio - 2 lines */}
        <p className="text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed">
          {mentor.bio}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Rating & Response Rate */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-semibold text-slate-300">
              {mentor.rating}
            </span>
            <span className="text-xs text-slate-500">
              ({mentor.reviews})
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {mentor.responseTime}
          </p>
        </div>

        {/* Book Session Button */}
        <button
          onClick={() => onBookSession(mentor.id)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}
