export default function About() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Our Mission: Bridging the Gap.
          </h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
        </div>

        {/* Main Content Grid: Text (Left) + Founder Card (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Vision & Why */}
          <div className="space-y-6">
            {/* The Vision */}
            <div>
              <h3 className="text-xl font-semibold text-blue-500 mb-3">
                The Near-Peer Model
              </h3>
              <p className="text-slate-300 leading-relaxed">
                University students aren't just older—they're recent. They remember the exact struggles
                you face: the late-night JAMB prep, the fear of campus, the uncertainty about your tech
                career. We connect secondary school students (JSS3–SS3) with undergraduates who've lived
                through what you're about to experience. That small age gap? It's everything. We speak
                your language, understand your fears, and show you the path that actually works.
              </p>
            </div>

            {/* The Why */}
            <div>
              <h3 className="text-xl font-semibold text-blue-500 mb-3">
                Survival & Reality
              </h3>
              <p className="text-slate-300 leading-relaxed">
                This isn't about acing JAMB alone—it's about surviving university and thriving in tech.
                We teach you the hidden curriculum: how to build real projects, how to network, how to
                secure internships, and how to start your career while still in school. Unibridge is your
                shortcut to success, guided by people who've walked the path just months or years before you.
              </p>
            </div>

            {/* Secondary CTA */}
            <div className="pt-6">
              <p className="text-sm text-slate-400">
                Join a growing community of mentors and mentees reshaping education in Nigeria.
              </p>
            </div>
          </div>

          {/* Right: Founder's Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm bg-slate-900 rounded-lg p-8 border border-slate-800 hover:border-blue-500 transition-colors duration-300">
              {/* Founder Avatar */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">ID</span>
                </div>
              </div>

              {/* Founder Info */}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white">Ibrahim Danjuma</h4>
                <p className="text-sm text-blue-400 font-medium">300L CS Student</p>
                <p className="text-sm text-slate-400">Microsoft Learn Student Ambassador</p>
              </div>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-blue-500 mx-auto mb-6"></div>

              {/* Quote */}
              <p className="text-center text-slate-300 italic leading-relaxed">
                "Building a community with an everlasting impact."
              </p>

              {/* Icon Accent */}
              <div className="flex justify-center gap-3 mt-6 text-blue-500">
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-16 pt-12 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            Unibridge is transforming mentorship for Nigerian students.
          </p>
        </div>
      </div>
    </section>
  );
}
