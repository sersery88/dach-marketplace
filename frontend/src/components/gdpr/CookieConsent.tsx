import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const COOKIE_CONSENT_KEY = 'dach_cookie_consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, preferences: true });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, preferences: false });
  };

  const cookieTypes = [
    { key: 'necessary' as const, label: 'Notwendig', description: 'Erforderlich für die Grundfunktionen der Website', required: true },
    { key: 'analytics' as const, label: 'Analyse', description: 'Helfen uns zu verstehen, wie Besucher die Website nutzen' },
    { key: 'marketing' as const, label: 'Marketing', description: 'Werden verwendet, um relevante Werbung anzuzeigen' },
    { key: 'preferences' as const, label: 'Präferenzen', description: 'Speichern Ihre Einstellungen und Vorlieben' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
            {!showSettings ? (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Cookie-Einstellungen</h3>
                    <p className="text-neutral-600 text-sm mb-4">
                      Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Sie können Ihre Präferenzen anpassen oder alle Cookies akzeptieren.
                      Weitere Informationen finden Sie in unserer{' '}
                      <a href="/privacy" className="text-primary-600 hover:underline">Datenschutzerklärung</a>.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={acceptAll}>Alle akzeptieren</Button>
                      <Button variant="outline" onClick={rejectAll}>Nur notwendige</Button>
                      <Button variant="ghost" onClick={() => setShowSettings(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Einstellungen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Cookie-Einstellungen</h3>
                  <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-neutral-100 rounded">
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
                <div className="space-y-4 mb-6">
                  {cookieTypes.map((type) => (
                    <div key={type.key} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                      <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                        <input
                          type="checkbox"
                          checked={preferences[type.key]}
                          onChange={(e) => !type.required && setPreferences({ ...preferences, [type.key]: e.target.checked })}
                          disabled={type.required}
                          className="sr-only peer"
                        />
                        <div className={cn(
                          "w-10 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors",
                          preferences[type.key] ? "bg-primary-600" : "bg-neutral-300",
                          type.required && "opacity-50 cursor-not-allowed"
                        )}>
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow transition-transform mt-1",
                            preferences[type.key] ? "translate-x-5" : "translate-x-1"
                          )} />
                        </div>
                      </label>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{type.label}</span>
                          {type.required && <span className="text-xs text-neutral-500">(Erforderlich)</span>}
                        </div>
                        <p className="text-sm text-neutral-600">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={acceptSelected}>Auswahl speichern</Button>
                  <Button variant="outline" onClick={acceptAll}>Alle akzeptieren</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;

