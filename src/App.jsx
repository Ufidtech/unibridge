import { useState, useNavigate } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MenteeAuthOnboarding from './components/MenteeAuthOnboarding';
import MentorOnboarding from './components/MentorOnboarding';
import MenteeDashboard from './components/MenteeDashboard';
import MentorDashboard from './components/MentorDashboard';

function App() {
  const navigate = useNavigate();
  const [menteeData, setMenteeData] = useState(null);
  const [mentorData, setMentorData] = useState(null);

  const handleNavigation = (page, data) => {
    if (data) {
      if (page.includes('mentee')) {
        setMenteeData(data);
      } else if (page.includes('mentor')) {
        setMentorData(data);
      }
    }
    navigate(page); // Navigate to the specified route
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={handleNavigation} />} />
        <Route
          path="/onboarding"
          element={<MenteeAuthOnboarding onBack={() => handleNavigation('/')} onComplete={(data) => handleNavigation('/mentee-dashboard', data)} />}
        />
        <Route
          path="/mentor-onboarding"
          element={<MentorOnboarding onBack={() => handleNavigation('/')} onComplete={(data) => handleNavigation('/mentor-dashboard', data)} />}
        />
        <Route
          path="/mentee-dashboard"
          element={<MenteeDashboard userInfo={menteeData || { name: 'Student', level: 'SS3' }} onNavigate={handleNavigation} />}
        />
        <Route
          path="/mentor-dashboard"
          element={<MentorDashboard mentorInfo={mentorData || { name: 'Mentor', role: 'Mentor' }} onNavigate={handleNavigation} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
