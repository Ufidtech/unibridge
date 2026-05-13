export default function ChatStep({ formData, setFormData }) {
  const classOptions = ['SS1', 'SS2', 'SS3', 'Recent Graduate'];

  const handleClassSelect = (selectedClass) => {
    setFormData({ ...formData, studentClass: selectedClass });
  };

  const handleDreamCourseChange = (e) => {
    setFormData({ ...formData, dreamCourse: e.target.value });
  };

  return (
    <div className="bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* AI Chat Bubble */}
        <div className="mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <p className="text-slate-200">
                Hi! To match you, what class are you in and what is your dream course?
              </p>
            </div>
          </div>
        </div>

        {/* Class Selection Chips */}
        <div className="mb-8">
          <label className="block text-slate-300 font-semibold mb-3">
            What class are you in?
          </label>
          <div className="flex flex-wrap gap-3">
            {classOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleClassSelect(option)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  formData.studentClass === option
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Dream Course Input */}
        <div className="mb-8">
          <label className="block text-slate-300 font-semibold mb-3">
            What's your dream course?
          </label>
          <input
            type="text"
            placeholder="e.g., Computer Science, Medicine, Engineering..."
            value={formData.dreamCourse}
            onChange={handleDreamCourseChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
