export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Unibridge
            </span>
            <p className="text-slate-400 text-sm mt-2">
              Connecting students with mentor undergraduates.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  For Students
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  For Mentors
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-slate-100 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2026 Unibridge. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-slate-100 transition">
              Twitter
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-100 transition">
              LinkedIn
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-100 transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
