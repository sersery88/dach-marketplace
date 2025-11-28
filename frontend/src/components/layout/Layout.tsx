import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from '@/components/gdpr';
import { SkipLink } from '@/components/a11y';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
