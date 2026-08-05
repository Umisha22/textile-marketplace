import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AiWidget from './AiWidget.jsx';
import ParticleBackground from './design-system/ParticleBackground.jsx';
import CustomCursor from './design-system/CustomCursor.jsx';
import PageTransition from './design-system/PageTransition.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${width}%` }} />;
}

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hideWidget = user?.role === 'supplier' || pathname === '/assistant' || pathname === '/onboarding';

  return (
    <div className="relative flex min-h-screen flex-col bg-void-950">
      <CustomCursor />
      <ScrollProgress />
      <ParticleBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
        {!hideWidget && <AiWidget />}
      </div>
    </div>
  );
}
