import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-800 bg-slate-900 p-6 md:p-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mb-6 text-sm text-slate-400">Last updated: May 21, 2026</p>

        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Use of the Platform</h2>
            <p>
              By using Unibridge, you agree to use the platform respectfully and only for lawful
              mentoring, learning, and collaboration purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Accounts and Responsibilities</h2>
            <p>
              You are responsible for maintaining accurate account details and keeping your login
              credentials secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Content and Conduct</h2>
            <p>
              Harmful, abusive, or fraudulent behavior is not allowed. We may suspend or terminate
              accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Service Changes</h2>
            <p>
              We may update or improve the service over time and revise these terms when needed.
              Continued use after updates means you accept the revised terms.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link to="/" className="text-blue-400 transition hover:text-blue-300">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
