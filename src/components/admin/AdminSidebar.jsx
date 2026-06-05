import { useState } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../../lib/api/auth";

export default function AdminSidebar({ onNavigate = () => {} }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { label: "Dashboard", path: "/admin/payouts" },
    { label: "User Management", path: "/admin/users" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      void 0;
    }

    onNavigate("/");
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition cursor-pointer"
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

      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-64 bg-slate-900 border-r border-slate-800 p-6 z-40 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-12">
          <button
            onClick={() => {
              onNavigate("/");
              setIsOpen(false);
            }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition cursor-pointer"
          >
            Unibridge Admin
          </button>
        </div>

        <nav className="space-y-3 mb-12">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => {
                  onNavigate(link.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left cursor-pointer min-w-0 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <span className="font-medium truncate">{link.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-left font-medium text-white transition hover:bg-red-500"
        >
          Logout
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        ></div>
      )}
    </>
  );
}
