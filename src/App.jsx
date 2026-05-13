import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import MenteeAuthOnboarding from "./components/MenteeAuthOnboarding";
import MentorOnboarding from "./components/MentorOnboarding";
import MenteeDashboard from "./components/MenteeDashboard";
import MentorDashboard from "./components/MentorDashboard";

function AppRoutes({ menteeData, setMenteeData, mentorData, setMentorData }) {
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
      <Route path="/" element={<LandingPage onNavigate={handleNavigation} />} />
      <Route
        path="/onboarding"
        element={
          <MenteeAuthOnboarding
            onBack={() => handleNavigation("/")}
            onComplete={(data) => handleNavigation("/mentee-dashboard", data)}
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
    const savedMenteeData = localStorage.getItem("menteeData");
    const savedMentorData = localStorage.getItem("mentorData");
    const savedPage = localStorage.getItem("currentPage");

    if (savedMenteeData) {
      setMenteeData(JSON.parse(savedMenteeData));
    }
    if (savedMentorData) {
      setMentorData(JSON.parse(savedMentorData));
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
    </Router>
  );
}

export default App;
