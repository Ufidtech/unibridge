import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import HowItWorks from './HowItWorks';
import Contact from './Contact';
import Footer from './Footer';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-950 scroll-smooth">
      <Navbar onNavigate={onNavigate} />
      <div id="hero">
        <Hero 
          onFindMentor={() => onNavigate('/onboarding')} 
          onBecomeMentor={() => onNavigate('/mentor-onboarding')} 
        />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Contact />
      <Footer />
    </div>
  );
}