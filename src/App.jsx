import { useState, useEffect } from "react";

import useAutoLogout from "./lib/useAutoLogout";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LandingPage from "./components/LandingPage";
import LoginModal from "./components/LoginModal";
import MenteeAuthOnboarding from "./components/mentee/MenteeAuthOnboarding";
import MentorOnboarding from "./components/mentor/MentorOnboarding";
import MenteeDashboard from "./components/mentee/MenteeDashboard";
import MentorDashboard from "./components/mentor/MentorDashboard";
import DevLogin from "./components/DevLogin";
import { fetchMe } from "./lib/api/auth";

function AppRoutes({ menteeData, setMenteeData, mentorData, setMentorData }) {
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
      }
    }
    localStorage.setItem("currentPage", page);
    navigate(page);
  };

  return (
    <Routes>
  {/* Dev-only helper route to seed localStorage for quick UI testing */}
  {process.env.NODE_ENV !== 'production' && <Route path="/dev-login" element={<DevLogin />} />}
      <Route path="/" element={<LandingPage onNavigate={handleNavigation} />} />
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

function App() {
  const [menteeData, setMenteeData] = useState(null);
  const [mentorData, setMentorData] = useState(null);


  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");

    const savedMenteeData = localStorage.getItem("menteeData");
    const savedMentorData = localStorage.getItem("mentorData");

    if (savedMenteeData) setMenteeData(JSON.parse(savedMenteeData));
    if (savedMentorData) setMentorData(JSON.parse(savedMentorData));

    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      fetchMe()
        .then((res) => {
          const user = res.user;
          if (user?.role === "MENTEE") setMenteeData(user);
          if (user?.role === "MENTOR") setMentorData(user);
        })
        .catch(() => {
          // ignore, token may be invalid/expired
        });
    }

    if (savedPage) {
      window.location.hash = `#${savedPage}`;
    }
  }, []);

  return (
    <Router>
      <AppRoutes
        menteeData={menteeData}
        setMenteeData={setMenteeData}
        mentorData={mentorData}
        setMentorData={setMentorData}
      />
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
