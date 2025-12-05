// Legal pages: Terms, Privacy, Imprint, Cookies, Trust & Safety
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Building, Cookie, Lock, Briefcase, Mail, Check } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'dach_cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp?: string;
}

function LegalPageWrapper({ icon: Icon, title, subtitle, color, children }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${color} mb-6`}>
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">{title}</h1>
          <p className="text-neutral-600">{subtitle}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 md:p-12"
        >
          <div className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <LegalPageWrapper
      icon={FileText}
      title="Allgemeine Geschäftsbedingungen"
      subtitle="Gültig ab: 1. Januar 2025"
      color="bg-primary-100 text-primary-600"
    >
      <h2>1. Geltungsbereich</h2>
      <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen DACHFlow und den Nutzern der Plattform.</p>

      <h2>2. Leistungsbeschreibung</h2>
      <p>DACHFlow betreibt einen Online-Marktplatz, der Auftraggeber mit Automatisierungs-Experten verbindet. Wir sind Vermittler und nicht Vertragspartei der zwischen Nutzern geschlossenen Verträge.</p>

      <h2>3. Registrierung</h2>
      <p>Die Nutzung der Plattform erfordert eine Registrierung. Nutzer müssen wahrheitsgemäße Angaben machen und sind für die Sicherheit ihres Kontos verantwortlich.</p>

      <h2>4. Gebühren</h2>
      <p>Die Nutzung ist für Auftraggeber kostenlos. Experten zahlen eine Provision von 10% auf erfolgreich abgeschlossene Projekte.</p>

      <h2>5. Haftung</h2>
      <p>DACHFlow haftet nicht für Leistungen, die von Experten erbracht werden. Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.</p>

      <h2>6. Kontakt</h2>
      <p>Bei Fragen wenden Sie sich an: <a href="mailto:legal@dachflow.com">legal@dachflow.com</a></p>
    </LegalPageWrapper>
  );
}

export function Privacy() {
  return (
    <LegalPageWrapper
      icon={Shield}
      title="Datenschutzerklärung"
      subtitle="Gültig ab: 1. Januar 2025"
      color="bg-green-100 text-green-600"
    >
      <h2>1. Verantwortlicher</h2>
      <p>Verantwortlicher für die Datenverarbeitung ist DACHFlow, Zürich, Schweiz.</p>

      <h2>2. Erhobene Daten</h2>
      <p>Wir erheben: Registrierungsdaten (Name, E-Mail), Profilinformationen, Kommunikationsdaten, Zahlungsdaten und Nutzungsdaten.</p>

      <h2>3. Zweck der Verarbeitung</h2>
      <p>Die Daten werden zur Bereitstellung der Plattform, Abwicklung von Zahlungen, Kommunikation und Verbesserung unserer Services verwendet.</p>

      <h2>4. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit. Kontaktieren Sie uns unter <a href="mailto:privacy@dachflow.com">privacy@dachflow.com</a>.</p>

      <h2>5. Datensicherheit</h2>
      <p>Wir verwenden SSL-Verschlüsselung und moderne Sicherheitsmaßnahmen zum Schutz Ihrer Daten.</p>
    </LegalPageWrapper>
  );
}

export function Imprint() {
  return (
    <LegalPageWrapper
      icon={Building}
      title="Impressum"
      subtitle="Rechtliche Angaben"
      color="bg-purple-100 text-purple-600"
    >
      <h2>Angaben gemäß Art. 3 DSG / § 5 TMG</h2>
      <p>
        <strong>DACHFlow GmbH</strong><br />
        Bahnhofstrasse 1<br />
        8001 Zürich<br />
        Schweiz
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +41 44 000 00 00<br />
        E-Mail: <a href="mailto:hello@dachflow.com">hello@dachflow.com</a>
      </p>

      <h2>Handelsregister</h2>
      <p>
        Handelsregisteramt des Kantons Zürich<br />
        CHE-123.456.789
      </p>

      <h2>Geschäftsführung</h2>
      <p>Max Mustermann, CEO</p>

      <h2>Umsatzsteuer-ID</h2>
      <p>CHE-123.456.789 MWST</p>
    </LegalPageWrapper>
  );
}

export function Cookies() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
      } catch {
        // Invalid stored data, use defaults
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    setPreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, preferences: true });
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, preferences: false });
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    saveConsent(newPrefs);
  };

  return (
    <LegalPageWrapper
      icon={Cookie}
      title="Cookie-Einstellungen"
      subtitle="Verwalten Sie Ihre Datenschutz-Präferenzen"
      color="bg-orange-100 text-orange-600"
    >
      <h2>Was sind Cookies?</h2>
      <p>Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, um Ihre Erfahrung zu verbessern.</p>

      <h2>Notwendige Cookies</h2>
      <p>Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.</p>

      <h2>Analyse-Cookies</h2>
      <p>Diese Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen.</p>

      <h2>Marketing-Cookies</h2>
      <p>Diese Cookies werden verwendet, um relevante Werbung anzuzeigen.</p>

      <div className="not-prose bg-neutral-100 p-6 rounded-xl mt-8">
        <p className="font-semibold text-neutral-900 mb-4">Ihre Cookie-Einstellungen</p>

        {/* Cookie toggles */}
        <div className="space-y-3 mb-6">
          {[
            { key: 'necessary' as const, label: 'Notwendig', required: true },
            { key: 'analytics' as const, label: 'Analyse', required: false },
            { key: 'marketing' as const, label: 'Marketing', required: false },
            { key: 'preferences' as const, label: 'Präferenzen', required: false },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded-lg">
              <span className="font-medium text-neutral-700">
                {item.label}
                {item.required && <span className="text-xs text-neutral-500 ml-2">(Erforderlich)</span>}
              </span>
              <button
                onClick={() => togglePreference(item.key)}
                disabled={item.required}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences[item.key] ? 'bg-primary-600' : 'bg-neutral-300'
                } ${item.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences[item.key] ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={acceptAll}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Alle akzeptieren
          </button>
          <button
            onClick={rejectAll}
            className="bg-white text-neutral-700 px-4 py-2 rounded-lg font-medium border border-neutral-200 hover:bg-neutral-50 transition"
          >
            Nur notwendige
          </button>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-600 mt-4"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Einstellungen gespeichert</span>
          </motion.div>
        )}
      </div>
    </LegalPageWrapper>
  );
}

export function TrustSafety() {
  return (
    <LegalPageWrapper
      icon={Lock}
      title="Vertrauen & Sicherheit"
      subtitle="Ihre Sicherheit ist unsere Priorität"
      color="bg-secondary-100 text-secondary-600"
    >
      <h2>Unsere Sicherheitsmaßnahmen</h2>
      <p>Bei DACHFlow steht Ihre Sicherheit an erster Stelle. Wir implementieren branchenführende Sicherheitsmaßnahmen.</p>

      <h2>Verifizierte Experten</h2>
      <p>Alle Experten durchlaufen einen strengen Verifizierungsprozess, um ihre Identität und Qualifikationen zu bestätigen.</p>

      <h2>Sichere Zahlungen</h2>
      <p>Unser Escrow-System schützt Ihr Geld, bis das Projekt zu Ihrer Zufriedenheit abgeschlossen ist.</p>

      <h2>Datenschutz</h2>
      <p>Ihre Daten werden nach Schweizer Datenschutzstandards geschützt und niemals an Dritte verkauft.</p>

      <h2>Streitbeilegung</h2>
      <p>Bei Problemen steht unser Support-Team zur Verfügung, um eine faire Lösung zu finden.</p>

      <h2>Missbrauch melden</h2>
      <p>Wenn Sie verdächtiges Verhalten bemerken, melden Sie es bitte an <a href="mailto:safety@dachflow.com">safety@dachflow.com</a>.</p>
    </LegalPageWrapper>
  );
}

export function Careers() {
  return (
    <LegalPageWrapper
      icon={Briefcase}
      title="Karriere bei DACHFlow"
      subtitle="Gestalten Sie die Zukunft der Automatisierung mit uns"
      color="bg-pink-100 text-pink-600"
    >
      <div className="not-prose bg-primary-50 rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Derzeit keine offenen Stellen</h2>
        <p className="text-neutral-600 mb-6">Aber wir freuen uns immer über Initiativbewerbungen!</p>
        <a href="mailto:careers@dachflow.com" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition">
          <Mail className="w-4 h-4" />
          Bewerbung senden
        </a>
      </div>

      <h2>Warum DACHFlow?</h2>
      <ul>
        <li><strong>Remote-first Kultur</strong> – Arbeiten Sie von überall in der DACH-Region</li>
        <li><strong>Moderner Tech-Stack</strong> – React, Rust, TypeScript und mehr</li>
        <li><strong>Flache Hierarchien</strong> – Ihre Ideen zählen</li>
        <li><strong>Wettbewerbsfähige Vergütung</strong> – Faire Bezahlung und Benefits</li>
      </ul>
    </LegalPageWrapper>
  );
}

