export default function VibeSelector({ formData, setFormData }) {
  const vibes = [
    'Academic Excellence',
    'Coding & Tech',
    'Campus Life',
    'Scholarships',
  ];

  const toggleVibe = (vibe) => {
    const updated = formData.selectedVibes.includes(vibe)
      ? formData.selectedVibes.filter((v) => v !== vibe)
      : [...formData.selectedVibes, vibe];
    setFormData({ ...formData, selectedVibes: updated });
  };

  return (
    <div className="bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Section Title */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-100 mb-2">
            What do you want to explore?
          </h3>
          <p className="text-slate-400">
            Select the areas where you'd like mentorship (you can pick multiple)
          </p>
        </div>

        {/* Vibe Pills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vibes.map((vibe) => (
            <button
              key={vibe}
              onClick={() => toggleVibe(vibe)}
              className={`px-6 py-4 rounded-lg font-semibold transition duration-200 transform ${
                formData.selectedVibes.includes(vibe)
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>

        {/* Selected Vibes Display */}
        {formData.selectedVibes.length > 0 && (
          <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Selected interests:</p>
            <div className="flex flex-wrap gap-2">
              {formData.selectedVibes.map((vibe) => (
                <span
                  key={vibe}
                  className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-sm"
                >
                  ✓ {vibe}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
