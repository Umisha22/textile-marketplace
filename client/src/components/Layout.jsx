import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AiWidget from './AiWidget.jsx';
import ParticleBackground from './design-system/ParticleBackground.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hideWidget = user?.role === 'supplier' || pathname === '/assistant' || pathname === '/onboarding';

  return (
    <div className="relative flex min-h-screen flex-col bg-void-950">
      <ParticleBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        {!hideWidget && <AiWidget />}
      </div>
    </div>
  );
}
