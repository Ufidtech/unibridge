import { useState, useEffect } from "react";

import useAutoLogout from "./lib/useAutoLogout";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./components/LandingPage";
import LoginModal from "./components/LoginModal";
import MenteeAuthOnboarding from "./components/mentee/MenteeAuthOnboarding";
import MentorOnboarding from "./components/mentor/MentorOnboarding";
import MenteeDashboard from "./components/mentee/MenteeDashboard";
import MentorDashboard from "./components/mentor/MentorDashboard";
import DevLogin from "./components/DevLogin";
import AdminPayoutDashboard from "./components/admin/AdminPayoutDashboard";
import AdminLoginPage from "./components/admin/AdminLoginPage";
import AdminUserManagement from "./components/admin/AdminUserManagement";
import AdminRouteGuard from "./components/admin/AdminRouteGuard";
import RequestFundsPage from "./components/mentee/RequestFundsPage";
import WalletTransactionsPanel from "./components/mentee/WalletTransactionsPanel";
import { fetchMe } from "./lib/api/auth";

import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

function AppRoutes({
  menteeData,
  setMenteeData,
  mentorData,
  setMentorData,
  adminData,
  setAdminData,
}) {
  // Auto-logout on token expiry/401 (must be inside Router context)
  useAutoLogout();
  const navigate = useNavigate();

  const handleNavigation = (page, data) => {
    if (data) {
      if (page.includes("mentee")) {
        setMenteeData(data);
        localStorage.setItem("menteeData", JSON.stringify(data));
      } else if (page.includes("mentor")) {
        setMentorData(data);
        localStorage.setItem("mentorData", JSON.stringify(data));
      } else if (page.includes("admin")) {
        setAdminData(data);
        localStorage.setItem("adminData", JSON.stringify(data));
      }
    }
    localStorage.setItem("currentPage", page);
    navigate(page);
  };

  return (
    <Routes>
      {/* Dev-only helper route to seed localStorage for quick UI testing */}
      {import.meta.env.DEV && (
        <Route path="/dev-login" element={<DevLogin />} />
      )}
      {import.meta.env.DEV && (
        <>
          <Route
            path="/admin/login"
            element={
              <AdminLoginPage
                onLoginSuccess={(data) =>
                  handleNavigation("/admin/payouts", data)
                }
              />
            }
          />
          <Route
            path="/admin/payouts"
            element={
              <AdminRouteGuard adminData={adminData}>
                <AdminPayoutDashboard
                  onNavigate={handleNavigation}
                  adminInfo={adminData}
                />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRouteGuard adminData={adminData}>
                <AdminUserManagement
                  onNavigate={handleNavigation}
                  adminInfo={adminData}
                />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard adminData={adminData}>
                <AdminPayoutDashboard
                  onNavigate={handleNavigation}
                  adminInfo={adminData}
                />
              </AdminRouteGuard>
            }
          />
        </>
      )}
      <Route path="/" element={<LandingPage onNavigate={handleNavigation} />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route
        path="/login"
        element={
          <LoginModal
            onBack={() => handleNavigation("/")}
            onComplete={(data) => {
              if (data?.role === "MENTEE") {
                handleNavigation("/mentee-dashboard", data);
              } else {
                handleNavigation("/mentor-dashboard", data);
              }
            }}
          />
        }
      />
      <Route
        path="/onboarding"
        element={
          <MenteeAuthOnboarding
            onBack={() => handleNavigation("/")}
            onComplete={(data) => handleNavigation("/mentee-dashboard", data)}
            onNavigate={handleNavigation}
          />
        }
      />
      <Route
        path="/mentor-onboarding"
        element={
          <MentorOnboarding
            onBack={() => handleNavigation("/")}
            onComplete={(data) => handleNavigation("/mentor-dashboard", data)}
          />
        }
      />
      <Route
        path="/mentee-dashboard"
        element={
          <MenteeDashboard
            userInfo={menteeData || { name: "Student", level: "SS3" }}
            onNavigate={handleNavigation}
          />
        }
      />
      <Route
        path="/request-funds"
        element={
          <RequestFundsPage
            userInfo={menteeData || { name: "Student", level: "SS3" }}
            onNavigate={handleNavigation}
          />
        }
      />
      <Route
        path="/wallet/transactions"
        element={
          <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100">
            <div className="mx-auto max-w-4xl">
              <WalletTransactionsPanel wallet={menteeData?.wallet || {}} />
            </div>
          </div>
        }
      />

      <Route
        path="/mentor-dashboard"
        element={
          <MentorDashboard
            mentorInfo={mentorData || { name: "Mentor", role: "Mentor" }}
            onNavigate={handleNavigation}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  const [menteeData, setMenteeData] = useState(() => {
    try {
      const raw = localStorage.getItem("menteeData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [mentorData, setMentorData] = useState(() => {
    try {
      const raw = localStorage.getItem("mentorData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [adminData, setAdminData] = useState(() => {
    try {
      const raw = localStorage.getItem("adminData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");

    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      fetchMe()
        .then((res) => {
          const user = res.user;
          if (user?.role === "MENTEE") setMenteeData(user);
          if (user?.role === "MENTOR") setMentorData(user);
          if (user?.role === "ADMIN") setAdminData(user);
        })
        .catch(() => {
          // ignore, token may be invalid/expired
        });
    }
  }, []);

  return (
    /* Passed the dynamic basename down to the Router component */
    <Router basename="/unibridge">
      <AppRoutes
        menteeData={menteeData}
        setMenteeData={setMenteeData}
        mentorData={mentorData}
        setMentorData={setMentorData}
        adminData={adminData}
        setAdminData={setAdminData}
      />
      <Toaster position="top-right" />
    </Router>
  );
}
