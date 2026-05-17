import { useState } from "react";
import Select from "react-select";
import { registerMentor } from "../lib/api/auth";
import NIGERIA_UNIVERSITIES from "../data/nigeriaUniversities";

export default function MentorOnboarding({
  onBack = () => {},
  onComplete = () => {},
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    universityName: "",
    universityAbbr: "",
    level: "",
    bio: "",
    expertise: [],
    availability: "",
    avatarFile: null,
    transcriptFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const universities = NIGERIA_UNIVERSITIES;

  const levels = ["200L", "300L", "400L"];

  const availabilityOptions = [
    "Not Available",
    "1-2 hours/week",
    "3-4 hours/week",
    "5+ hours/week",
  ];

  const expertiseTags = [
    "1st Class Strategy",
    "ReactJS",
    "Hostel Survival",
    "JAMB Prep",
    "Course Selection",
    "Time Management",
    "Leadership",
    "Networking",
    "Coding Fundamentals",
    "Career Planning",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // react-select options
  const uniOptions = universities.map((u) => ({
    value: u.abbr,
    label: `${u.name} — ${u.abbr}`,
    name: u.name,
  }));
  const handleUniChange = (opt) => {
    if (!opt) return;
    setFormData({
      ...formData,
      universityName: opt.name,
      universityAbbr: opt.value,
    });
  };

  const toggleExpertise = (tag) => {
    const updated = formData.expertise.includes(tag)
      ? formData.expertise.filter((t) => t !== tag)
      : [...formData.expertise, tag];
    setFormData({ ...formData, expertise: updated });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
    }
  };

  const handleTranscriptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, transcriptFile: file });
    }
  };

  const canSubmit = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.email.includes("@") &&
      formData.password &&
      formData.password.length >= 8 &&
      formData.universityName &&
      formData.level &&
      formData.bio &&
      formData.expertise.length > 0 &&
      formData.availability
    );
  };

  const handleSubmit = () => {
    if (canSubmit()) {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        universityName: formData.universityName,
        universityAbbr: formData.universityAbbr,
        level: formData.level,
        bio: formData.bio,
        skills: formData.expertise,
        responseTime: formData.availability,
        selectedVibes: [],
      };

      registerMentor(payload)
        .then(({ user }) => {
          try {
            localStorage.setItem("mentorData", JSON.stringify(user));
          } catch {}

          setSuccess("Mentor profile created successfully!");
          setError(null);

          setTimeout(() => {
            onComplete(user);
          }, 1500);
        })
        .catch((err) => {
          const message =
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong. Please try again.";

          setError(message);
          setSuccess(null);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-400 font-medium transition flex items-center gap-2 mb-8 cursor-pointer"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-3">
            Join as a Mentor.
          </h1>
          <p className="text-lg text-slate-400">Inspire the next generation.</p>
        </div>

        {/* Form Container */}
        <form className="bg-slate-900 border border-slate-800 rounded-xl p-8 md:p-12">
          {/* SECTION 1: Basic Info */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              Basic Information
            </h2>

            <div className="flex flex-col md:flex-row gap-8 mb-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4 overflow-hidden">
                  {formData.avatarFile ? (
                    <img
                      src={URL.createObjectURL(formData.avatarFile)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-slate-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <p className="text-xs text-slate-400 mt-2">Add Photo</p>
                    </div>
                  )}
                </div>
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition text-sm">
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Form Inputs */}
              <div className="flex-1">
                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-slate-300 font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g., Ibrahim Adeyemi"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-slate-300 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                {/* University */}
                <div className="mb-4">
                  <label className="block text-slate-300 font-semibold mb-2">
                    University *
                  </label>
                  <div className="mt-2">
                    <Select
                      options={uniOptions}
                      onChange={handleUniChange}
                      isClearable
                      placeholder="Search or select university"
                      styles={{
                        control: (base) => ({
                          ...base,
                          background: "#0f1724",
                          borderColor: "#374151",
                          color: "#e5e7eb",
                        }),
                        menu: (base) => ({ ...base, background: "#0f1724" }),
                        option: (base, state) => ({
                          ...base,
                          background: state.isFocused
                            ? "#1f2937"
                            : "transparent",
                          color: "#e5e7eb",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  >
                    <option value="">Select Level</option>
                    {levels.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Bio & Proof */}
          <div className="mb-12 pb-12 border-b border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              Bio & Verification
            </h2>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-slate-300 font-semibold mb-2">
                Short Bio *
              </label>
              <p className="text-sm text-slate-400 mb-3">
                Tell mentees about yourself, your achievements, and why they
                should learn from you.
              </p>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="e.g., I'm a 300L CS student with a 4.2 CGPA, experienced in React and Node.js. I've mentored 15+ students into tech. Let's build your future together!"
                rows="4"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              ></textarea>
            </div>

            {/* Transcript Upload */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Upload Transcript or Student ID (Optional)
              </label>
              <p className="text-sm text-slate-400 mb-3">
                Add proof of your academic achievement to build trust.
              </p>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={handleTranscriptUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div>
                  <svg
                    className="w-10 h-10 text-slate-500 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-slate-300 font-medium">
                    {formData.transcriptFile
                      ? formData.transcriptFile.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, JPG, or PNG (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Expertise & Schedule */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              Expertise & Availability
            </h2>

            {/* Expertise Tags */}
            <div className="mb-8">
              <label className="block text-slate-300 font-semibold mb-3">
                Your Areas of Expertise * (select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expertiseTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleExpertise(tag)}
                    className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                      formData.expertise.includes(tag)
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Availability */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">
                Weekly Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              >
                <option value="">Select Availability</option>
                {availabilityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Button */}

          {/* Success Message */}
          {success && (
            <div className="p-4 mb-4 bg-green-900/20 border border-green-500 rounded-lg text-green-300 text-sm">
              {success}
            </div>
          )}
          {/* Error Message - Display when error occurs */}
          {error && (
            <div className="p-4 mb-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit() || loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition cursor-pointer"
          >
            {loading ? "Creating Profile..." : "Launch Mentor Profile"}
          </button>

          {/* Help Text */}
          {!canSubmit() && (
            <p className="text-sm text-slate-400 mt-3 text-center">
              Complete all required fields (*) to launch your profile
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
