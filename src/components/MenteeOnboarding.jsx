import { useState } from 'react';
import ProgressBar from './ProgressBar';
import ChatStep from './ChatStep';
import VibeSelector from './VibeSelector';

export default function MenteeOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentClass: '',
    dreamCourse: '',
    selectedVibes: [],
  });

  const totalSteps = 2;

  // Validate current step before allowing next
  const canProceedNext = () => {
    if (currentStep === 1) {
      return formData.studentClass && formData.dreamCourse;
    }
    if (currentStep === 2) {
      return formData.selectedVibes.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (canProceedNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (canProceedNext()) {
      console.log('Form Data:', formData);
      alert('Dashboard will open next!');
      // TODO: Navigate to dashboard
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Profile Setup"
      />

      {/* Step Content */}
      <div className="flex-grow">
        {currentStep === 1 && (
          <ChatStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 2 && (
          <VibeSelector formData={formData} setFormData={setFormData} />
        )}
      </div>

      {/* Footer with Navigation Buttons */}
      <div className="bg-slate-900 border-t border-slate-800 py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 justify-between">
          {/* Previous Button */}
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition"
            >
              ← Previous
            </button>
          )}

          {/* Spacer */}
          {currentStep === 1 && <div className="flex-1 md:flex-none"></div>}

          {/* Next or Submit Button */}
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceedNext()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceedNext()}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              Build My Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
