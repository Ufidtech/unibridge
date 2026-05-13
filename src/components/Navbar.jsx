import { useState } from "react";

export default function Navbar({ onNavigate = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoClick = () => {
    onNavigate("landing");
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex-shrink-0 hover:opacity-80 transition"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Unibridge
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex md:space-x-8 md:items-center">
            <a
              href="#how-it-works"
              className="text-slate-300 hover:text-slate-100 transition"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-slate-100 transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-slate-300 hover:text-slate-100 transition"
            >
              Contact
            </a>
          </div>

          {/* Sign In Button (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={() => onNavigate("login")}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-300 hover:text-slate-100 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800">
            <a
              href="#how-it-works"
              className="block px-2 py-2 text-slate-300 hover:text-slate-100"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="block px-2 py-2 text-slate-300 hover:text-slate-100"
            >
              About
            </a>
            <a
              href="#contact"
              className="block px-2 py-2 text-slate-300 hover:text-slate-100"
            >
              Contact
            </a>
            <button
              onClick={() => {
                onNavigate("login");
                setIsOpen(false);
              }}
              className="w-full mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
