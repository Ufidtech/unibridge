import { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminSignup from "./AdminSignup";

export default function AdminLoginPage({ onLoginSuccess }) {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
      {showSignup ? (
        <>
          <AdminSignup onSignupSuccess={onLoginSuccess} />
          <p className="mt-4 text-slate-400">
            Already have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={() => setShowSignup(false)}
            >
              Log in
            </button>
          </p>
        </>
      ) : (
        <>
          <AdminLogin onLoginSuccess={onLoginSuccess} />
          <p className="mt-4 text-slate-400">
            Don't have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={() => setShowSignup(true)}
            >
              Sign up
            </button>
          </p>
        </>
      )}
    </div>
  );
}
