import { useState } from "react";
import { registerMentee } from "../lib/api/auth";

export default function MenteeAuthOnboarding({
  onBack = () => {},
  onComplete = () => {},
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    studentClass: "",
    dreamCourse: "",
    selectedVibes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 3;

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Class chip handler
  const handleClassSelect = (className) => {
    setFormData((prev) => ({
      ...prev,
      studentClass: prev.studentClass === className ? "" : className,
    }));
  };

  // Vibe tag handler
  const handleVibeToggle = (vibe) => {
    setFormData((prev) => ({
      ...prev,
      selectedVibes: prev.selectedVibes.includes(vibe)
        ? prev.selectedVibes.filter((v) => v !== vibe)
        : [...prev.selectedVibes, vibe],
    }));
  };

  // Validation
  const canProceedNext = () => {
    if (currentStep === 1) {
      return (
        formData.fullName.trim() &&
        formData.email.includes("@") &&
        formData.password.length >= 8
      );
    }
    if (currentStep === 2) {
      return formData.studentClass && formData.dreamCourse.trim();
    }
    if (currentStep === 3) {
      return formData.selectedVibes.length > 0;
    }
    return true;
  };

  const handleContinue = () => {
    if (canProceedNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    if (!canProceedNext()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      school: null,
      classLevel: formData.studentClass,
      dreamCourse: formData.dreamCourse,
      selectedVibes: formData.selectedVibes,
    };

    registerMentee(payload)
      .then(({ user }) => {
        try {
          localStorage.setItem("menteeData", JSON.stringify(user));
        } catch {}
        onComplete(user);
      })
      .catch((err) => setError(err.message || "Registration failed"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with Progress Bar */}
      <div className="bg-slate-950 border-b border-slate-800 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-white">
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Tell Us About You"}
                {currentStep === 3 && "What Interests You?"}
              </h1>
              <span className="text-sm text-slate-400">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-400 font-medium transition flex items-center gap-2 text-sm"
          >
            ← {currentStep > 1 ? "Back" : "Back to Home"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* STEP 1: Account Creation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ibrahim Danjuma"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Password with Visibility Toggle */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10C1.732 14.057 5.522 17 10 17a9.958 9.958 0 004.512-1.074l1.78 1.781a1 1 0 001.414-1.414l-2.023-2.023z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <button className="text-blue-500 hover:text-blue-400 font-medium transition">
                  Sign in
                </button>
              </p>
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Sign In Link */}
              {/* <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button className="text-blue-500 hover:text-blue-400 font-medium transition">
                Sign in
              </button>
            </p> */}
            </div>
          )}

          {/* STEP 2: AI Chat UI */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* AI Chat Bubble */}
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">UB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300 mb-1">
                      Unibridge AI
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      Hi {formData.fullName}! 👋 To match you with the best
                      mentors, what class are you in and what is your dream
                      course?
                    </p>
                  </div>
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  What class are you in?
                </label>
                <div className="flex flex-wrap gap-3">
                  {["JSS3", "SS1", "SS2", "SS3", "JAMBite"].map((className) => (
                    <button
                      key={className}
                      onClick={() => handleClassSelect(className)}
                      className={`px-4 py-2 rounded-full font-medium transition ${
                        formData.studentClass === className
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-blue-500"
                      }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream Course Input */}
              <div>
                <label
                  htmlFor="dreamCourse"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  What is your dream course?
                </label>
                <input
                  type="text"
                  id="dreamCourse"
                  name="dreamCourse"
                  value={formData.dreamCourse}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Medicine, Engineering..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Vibe Selector */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-slate-300">
                Select the topics that interest you most. These help us
                personalize your mentorship experience.
              </p>

              {/* Vibe Tags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Academic Excellence",
                  "Coding & Tech",
                  "Campus Life",
                  "Scholarships",
                  "Side Hustles",
                  "Mental Health",
                ].map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => handleVibeToggle(vibe)}
                    className={`px-6 py-3 rounded-lg font-medium transition border ${
                      formData.selectedVibes.includes(vibe)
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-blue-500"
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>

              {/* Selection Count */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold text-blue-400">
                    {formData.selectedVibes.length}
                  </span>{" "}
                  topic{formData.selectedVibes.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Action Button */}
      <div className="bg-slate-900 border-t border-slate-800 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Message - Display for all steps */}
          {error && (
            <div className="p-4 mb-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={currentStep < totalSteps ? handleContinue : handleSubmit}
            disabled={!canProceedNext() || loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading
              ? "Processing..."
              : currentStep < totalSteps
                ? "Continue"
                : "Build My Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
