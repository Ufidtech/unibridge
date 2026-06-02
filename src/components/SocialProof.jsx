export default function SocialProof() {
  const schools = ["FUT Minna", "UNILAG", "OAU"];

  return (
    <section className="bg-slate-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-sm text-slate-400">
            Mentors from top universities
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 overflow-hidden">
            {schools.map((school) => (
              <div
                key={school}
                className="flex items-center gap-2 text-slate-300 opacity-80 transition transform hover:scale-105 hover:opacity-100 min-w-0"
              >
                <svg
                  width="36"
                  height="24"
                  viewBox="0 0 36 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="grayscale opacity-70"
                  aria-hidden="true"
                >
                  <rect width="36" height="24" rx="3" fill="#cbd5e1" />
                </svg>
                <div className="text-sm text-slate-400 truncate">{school}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
