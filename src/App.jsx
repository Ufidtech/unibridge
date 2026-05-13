import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import MenteeOnboarding from './components/MenteeOnboarding';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  if (currentPage === 'onboarding') {
    return <MenteeOnboarding />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;
