export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Ask the AI",
      description: "Tell our AI what you're struggling with. We'll help you find the right mentor and prep your questions.",
    },
    {
      num: "02",
      title: "Pick a Mentor",
      description: "Get matched with high-performing undergrads who've walked the same path. Book a 30-minute session.",
    },
    {
      num: "03",
      title: "Grow Together",
      description: "Get insider knowledge on JAMB prep, course selection, tech skills, and surviving 100L.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-slate-950 py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Three simple steps to get the mentorship you deserve.
          </p>
        </div>

        {/* Grid: Stack on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-lg p-8 hover:border-blue-500 hover:shadow-lg transition"
            >
              {/* Step Number */}
              <div className="text-5xl font-bold text-blue-600 mb-4">
                {step.num}
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
