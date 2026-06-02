export default function Hero({ onFindMentor, onBecomeMentor }) {
  return (
    <section className="bg-slate-950 py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: Headline + CTAs */}
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 mb-4 leading-tight tracking-tight break-words">
            Get mentored by those doing it.
          </h1>

          <p className="text-base md:text-lg text-slate-300/85 mb-6 max-w-xl break-words">
            Navigate JAMB, build your tech career, and get the inside scoop on
            real university life.
          </p>

          {/* Two-sided marketplace CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 max-w-xl">
            <button
              type="button"
              onClick={onFindMentor}
              className="min-h-11 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition transform hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Find My Mentor
            </button>

            <button
              type="button"
              onClick={onBecomeMentor}
              className="min-h-11 px-6 py-3 bg-transparent text-slate-100 font-semibold rounded-xl transition transform hover:-translate-y-0.5 hover:scale-[1.01] border border-slate-600 hover:border-blue-500 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
            >
              Become a Mentor
            </button>
          </div>
        </div>

        {/* Right: AI Matching visual placeholder */}
        <div className="w-full flex justify-center md:justify-end min-w-0">
          <div className="w-full max-w-md bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl hover:shadow-2xl transition-transform transform hover:scale-[1.01]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">
                  SS
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white break-words">
                    Seyi, SS3
                  </div>
                  <div className="text-xs text-slate-400 break-words">
                    Looking for JAMB tips & CS pathway
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500">AI Match</div>
            </div>

            <div className="relative py-4">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-r from-slate-700 to-slate-600 opacity-60" />

              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300 mb-2 break-words">
                    Connecting you with
                  </div>
                  <div className="text-sm font-semibold text-white break-words">
                    Ife, 300L CS
                  </div>
                  <div className="text-xs text-slate-400 break-words">
                    Mentor • Computer Science • Internship tips
                  </div>
                </div>

                <div className="w-16 h-16 rounded-lg bg-linear-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white shadow-inner">
                  🎓
                </div>
              </div>

              <div className="mt-4 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-80" />
            </div>

            <div className="mt-3 text-sm text-slate-400 break-words">
              AI matching preview — powered by intent and shared experience.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
