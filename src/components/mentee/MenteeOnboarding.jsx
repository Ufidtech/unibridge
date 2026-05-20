import { useState } from 'react';
import ProgressBar from '../ProgressBar';
import ChatStep from '../ChatStep';
import VibeSelector from '../VibeSelector';

export default function MenteeOnboarding({ onBack = () => {}, onComplete = () => {}, onNavigate = () => {} }) {
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
      // Pass user data to dashboard
      const userData = {
        name: formData.studentClass, // Using class as temporary name
        level: formData.studentClass,
        dreamCourse: formData.dreamCourse,
        interests: formData.selectedVibes,
      };
      onComplete(userData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with Back Button and Sign In */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={currentStep > 1 ? handlePrevious : onBack}
            className="text-blue-500 hover:text-blue-400 font-medium transition flex items-center gap-2 cursor-pointer"
          >
            ← {currentStep > 1 ? 'Previous Step' : 'Back to Home'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-blue-500 hover:text-blue-400 font-medium transition cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>

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
              className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition cursor-pointer"
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
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition cursor-pointer"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceedNext()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition cursor-pointer"
            >
              Build My Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
