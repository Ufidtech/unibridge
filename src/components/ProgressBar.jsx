export default function ProgressBar({ currentStep, totalSteps, title }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-slate-950 border-b border-slate-800 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          {title}
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step Counter */}
        <p className="text-sm text-slate-400 mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
