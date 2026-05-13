import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-16 md:py-24 px-6 md:px-12 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Got Questions? We&apos;ve got answers.
          </h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
        </div>

        {/* Main Content Grid: Form (Left) + AI Helper Note (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Left: Contact Form (takes 2 columns) */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ibrahim Danjuma"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
                ></textarea>
              </div>

              {/* Submit Button & Success Message */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Send Message
                </button>
                {submitted && (
                  <span className="text-sm font-medium text-green-400">
                    ✓ Message sent! We&apos;ll get back to you soon.
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right: AI Helper Note */}
          <div className="md:col-span-1">
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-6 sticky top-20">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-semibold text-blue-400">Quick Support</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Our AI usually answers support tickets in under 5 minutes!
              </p>
              <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
              <div className="mt-4 text-xs text-slate-400">
                <p className="mb-2">We respond to:</p>
                <ul className="space-y-1">
                  <li>• Account issues</li>
                  <li>• Feature requests</li>
                  <li>• General inquiries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-400 text-sm">Follow us on social media</p>
            <div className="flex gap-6">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors duration-200"
                title="LinkedIn"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.721-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.825 0-9.749h3.554v1.381c.432-.666 1.204-1.608 2.928-1.608 2.136 0 3.745 1.393 3.745 4.393v5.583zM5.337 9.433c-1.144 0-1.915-.759-1.915-1.708 0-.955.771-1.71 1.954-1.71 1.18 0 1.915.75 1.938 1.71 0 .949-.758 1.708-1.977 1.708zm1.582 11.019H3.771V9.704h3.148v10.748zM22.224 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.224 0z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors duration-200"
                title="GitHub"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
