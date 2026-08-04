import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AiWidget from './AiWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hideWidget = user?.role === 'supplier' || pathname === '/assistant' || pathname === '/onboarding';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!hideWidget && <AiWidget />}
    </div>
  );
}
