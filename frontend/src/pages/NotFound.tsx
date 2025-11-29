import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { SEO } from '@/components/seo';

export function NotFound() {
  return (
    <>
      <SEO 
        title="Seite nicht gefunden" 
        description="Die angeforderte Seite existiert nicht."
        noindex
      />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[180px] font-bold text-neutral-100 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
                <Search className="w-16 h-16 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Seite nicht gefunden
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.
            Keine Sorge, wir helfen Ihnen weiter!
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" leftIcon={<Home className="w-5 h-5" />}>
                Zur Startseite
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" leftIcon={<Search className="w-5 h-5" />}>
                Suche
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-500 mb-4">Oder besuchen Sie:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/experts" className="text-primary-600 hover:underline text-sm">
                Experten finden
              </Link>
              <Link to="/services" className="text-primary-600 hover:underline text-sm">
                Services durchsuchen
              </Link>
              <Link to="/how-it-works" className="text-primary-600 hover:underline text-sm">
                Wie es funktioniert
              </Link>
              <Link to="/faq" className="text-primary-600 hover:underline text-sm">
                Häufige Fragen
              </Link>
            </div>
          </div>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur vorherigen Seite</span>
          </button>
        </motion.div>
      </div>
    </>
  );
}

export default NotFound;

