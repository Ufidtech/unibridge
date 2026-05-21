import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-800 bg-slate-900 p-6 md:p-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-6 text-sm text-slate-400">Last updated: May 21, 2026</p>

        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Information We Collect</h2>
            <p>
              We collect account details you provide directly, including your name, email address,
              and profile information needed to connect mentees and mentors.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">How We Use Information</h2>
            <p>
              We use your information to provide mentorship services, improve platform safety,
              support scheduling and communication, and respond to support requests.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Data Sharing</h2>
            <p>
              We only share information with service providers needed to operate the platform and
              as required by law. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">Your Choices</h2>
            <p>
              You can request updates to your account information and request account deletion by
              contacting support.
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
