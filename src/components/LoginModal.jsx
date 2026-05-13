import { useState } from "react";
import { loginMentee, loginMentor } from "../lib/api/auth";

export default function LoginModal({
  onBack = () => {},
  onComplete = () => {},
}) {
  const [userType, setUserType] = useState(null); // 'mentee' or 'mentor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loginFn = userType === "mentee" ? loginMentee : loginMentor;
      const { user } = await loginFn(email, password);

      try {
        localStorage.setItem(
          userType === "mentee" ? "menteeData" : "mentorData",
          JSON.stringify(user),
        );
      } catch {}

      onComplete(user);
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(
        errorMsg.includes("user-not-found") ||
          errorMsg.includes("wrong-password")
          ? "Invalid email or password"
          : errorMsg,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={onBack}
              className="text-blue-500 hover:text-blue-400 font-medium transition flex items-center gap-2 mb-6 mx-auto"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">
              Welcome back! Choose how you'd like to sign in.
            </p>
          </div>

          {/* Login Type Selection */}
          <div className="space-y-3">
            <button
              onClick={() => setUserType("mentee")}
              className="w-full px-6 py-4 bg-slate-900 border-2 border-slate-800 hover:border-blue-500 text-white rounded-lg transition flex flex-col gap-2"
            >
              <span className="font-semibold text-lg">Sign in as Mentee</span>
              <span className="text-sm text-slate-400">
                Access your mentorship journey
              </span>
            </button>

            <button
              onClick={() => setUserType("mentor")}
              className="w-full px-6 py-4 bg-slate-900 border-2 border-slate-800 hover:border-blue-500 text-white rounded-lg transition flex flex-col gap-2"
            >
              <span className="font-semibold text-lg">Sign in as Mentor</span>
              <span className="text-sm text-slate-400">
                Manage your mentoring sessions
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setUserType(null)}
            className="text-blue-500 hover:text-blue-400 font-medium transition flex items-center gap-2 mb-6 mx-auto"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sign in as {userType === "mentee" ? "Mentee" : "Mentor"}
          </h1>
          <p className="text-slate-400">Enter your credentials to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          {/* Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-400 font-medium transition"
          >
            Get started
          </button>
        </p>
      </div>
    </div>
  );
}
