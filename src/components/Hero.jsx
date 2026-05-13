export default function Hero({ onFindMentor, onBecomeMentor }) {
  return (
    <section className="bg-slate-950 py-16 md:py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-6 leading-tight">
          Get mentored by those doing it.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Navigate JAMB, build your tech career, and get the inside scoop on real university life.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
          {/* Primary Button */}
          <button 
            onClick={onFindMentor}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl">
            Find a Mentor
          </button>

          {/* Secondary Button */}
          <button 
            onClick={onBecomeMentor}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition border border-slate-700">
            Become a Mentor
          </button>
        </div>
      </div>
    </section>
  );
}
