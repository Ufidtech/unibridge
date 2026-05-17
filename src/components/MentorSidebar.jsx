import { useState } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../lib/api/auth";

export default function MentorSidebar({
  mentorInfo = { name: "Umar Farooq", role: "Mentor" },
  onNavigate = () => {},
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Starting logout...");
      await logout();
      console.log("✅ Logout successful");
    } catch (err) {
      console.warn("⚠️ Logout failed (ignored):", err);
    }

    setIsOpen(false);

    // Hard refresh to fully reset Firebase auth state
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Dashboard", icon: "📊", path: "/mentor-dashboard" },
    { label: "Session Requests", icon: "📬", path: "/mentor-dashboard?tab=requests" },
    { label: "My Schedule", icon: "📅", path: "/mentor-dashboard?tab=schedule" },
    { label: "Proposals", icon: "🔁", path: "/mentor-dashboard?tab=proposals" },
    { label: "History", icon: "🕰️", path: "/mentor-dashboard?tab=history" }, // <--- ADD THIS LINE
    { label: "Profile", icon: "👤", path: "/mentor-dashboard?tab=profile" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-6 z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition transform translate-x-10 cursor-pointer"
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
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar - Desktop Always Visible, Mobile in Overlay */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6 z-40 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="mb-12">
          <button
            onClick={() => {
              onNavigate("landing");
              setIsOpen(false);
            }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition cursor-pointer"
          >
            Unibridge
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4 mb-12">
          {navLinks.map((link) => {
            // split configured path into pathname and optional search
            const [linkPathname, linkQuery] = link.path.split('?');
            const isPathMatch = location.pathname === linkPathname;
            let isQueryMatch = true;
            
            if (linkQuery) {
              // build search params from linkQuery and compare
              const linkParams = new URLSearchParams(linkQuery);
              const currentParams = new URLSearchParams(location.search.replace(/^\?/, ''));
              for (const [k, v] of linkParams.entries()) {
                if (currentParams.get(k) !== v) {
                  isQueryMatch = false;
                  break;
                }
              }
            }
            
            // If there's NO query in the link (like Dashboard), ensure we are actually on the base URL with no tabs active
            if (!linkQuery && location.search) {
               isQueryMatch = false;
            }

            const isActive = isPathMatch && isQueryMatch;
            
            return (
              <button
                key={link.label}
                onClick={() => {
                  onNavigate(link.path);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2 py-2 w-full text-left transition cursor-pointer ${
                  isActive ? 'text-white bg-blue-600 rounded-lg px-3' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mentor Info - Bottom */}
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <button
            onClick={() => {
              onNavigate("/mentor-dashboard?tab=profile");
              setIsOpen(false);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mb-3 mx-auto">
              {mentorInfo.name.charAt(0)}
            </div>
            <p className="text-slate-100 font-semibold text-sm text-center">
              {mentorInfo.name}
            </p>
            <p className="text-slate-400 text-xs text-center">{mentorInfo.title || mentorInfo.role}</p>
            <p className="text-slate-500 text-xs text-center mt-1">{mentorInfo.university || 'University'}</p>
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        ></div>
      )}
    </>
  );
}