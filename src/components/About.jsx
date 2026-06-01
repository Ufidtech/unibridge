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
          {/* Left: Mission Cards Grid */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-500 transition-transform transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14l6.16-3.422A12.083 12.083 0 0119 19.5c0 .667-.06 1.313-.174 1.928L12 14z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Mentors Who Just Lived It
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Your mentors aren't just older—they were in your shoes
                  yesterday. Connect with undergrads who know exactly how to
                  beat late-night JAMB prep and campus anxiety.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-500 transition-transform transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Beyond the Books
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Acing JAMB is just the start. We teach the "hidden
                  curriculum": how to network, secure internships, and thrive in
                  tech while still in school.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-500 transition-transform transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 10V7a5 5 0 0110 0v3"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Your Shortcut to Success
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Stop guessing. Get guided by someone who walked your exact
                  path just a few months ago, speaking your language and
                  understanding your fears.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-sm text-slate-400">
                Join a growing community of mentors and mentees reshaping
                education in Nigeria.
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
                <h4 className="text-xl font-bold text-white">
                  Ibrahim Danjuma
                </h4>
                <p className="text-sm text-blue-400 font-medium">
                  300L CS Student
                </p>
                <p className="text-sm text-slate-400">
                  Microsoft Learn Student Ambassador
                </p>
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
