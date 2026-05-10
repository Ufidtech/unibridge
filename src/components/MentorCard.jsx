export default function MentorCard() {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-blue-500 transition-all cursor-pointer group flex flex-col h-full">
      {/* Top Section: Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold text-xl border-2 border-blue-500/50">
          UF
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            Umar Farooq
          </h3>
          <p className="text-sm text-slate-400">300L Computer Science</p>
          <p className="text-xs text-blue-300 font-medium mt-1">FUT Minna</p>
        </div>
      </div>

      {/* Middle Section: The "Why" */}
      <div className="flex-grow">
        <p className="text-slate-300 text-sm mb-4 line-clamp-3">
          I'm a Frontend Dev and AI enthusiast. I can help you navigate your
          100L courses, balance your GPA with learning to code, and avoid the
          mistakes I made as a fresher.
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded-md">
            Frontend
          </span>
          <span className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded-md">
            Tech & CGPA
          </span>
        </div>
      </div>

      {/* Bottom Section: Action */}
      <button className="w-full bg-slate-700 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors mt-auto">
        Book Session
      </button>
    </div>
  );
}
