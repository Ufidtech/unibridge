import { useState } from "react";
import { logout } from "../lib/api/auth";

export default function Sidebar({
  userInfo = { name: "Ibrahim", level: "SS3" },
  onNavigate = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate("landing");
    setIsOpen(false);
  };

  const navLinks = [
    { label: "Dashboard", icon: "📊" },
    { label: "My Sessions", icon: "📅" },
    { label: "Profile", icon: "👤" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition transform translate-x-10"
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
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            Unibridge
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4 mb-12">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition text-left"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info - Bottom */}
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mb-3">
              {userInfo.name.charAt(0)}
            </div>
            <p className="text-slate-100 font-semibold text-sm">
              {userInfo.name}
            </p>
            <p className="text-slate-400 text-xs">{userInfo.level}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
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
