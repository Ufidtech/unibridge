import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import MenteeOnboarding from './components/MenteeOnboarding';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (currentPage === 'onboarding') {
    return <MenteeOnboarding onBack={() => navigateTo('landing')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar onNavigate={navigateTo} />
      <Hero onFindMentor={() => navigateTo('onboarding')} />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;
