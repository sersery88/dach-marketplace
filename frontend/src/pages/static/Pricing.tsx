import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function Pricing() {
  const clientFeatures = [
    'Unbegrenzte Projektanfragen',
    'Direkte Kommunikation mit Experten',
    'Sichere Escrow-Zahlungen',
    'Qualitätsgarantie',
    '24/7 Support',
    'Keine Vorabkosten',
  ];

  const expertFeatures = [
    'Keine monatlichen Gebühren',
    'Zugang zu qualifizierten Leads',
    'Verifiziertes Experten-Badge',
    'Prioritärer Support',
    'Marketing-Unterstützung',
    'Eigenes Profil & Portfolio',
  ];

  const faqs = [
    { q: 'Wann wird die Provision fällig?', a: 'Die 10% Provision wird nur bei erfolgreich abgeschlossenen Projekten berechnet und automatisch vom Projektbetrag abgezogen.' },
    { q: 'Gibt es versteckte Kosten?', a: 'Nein, es gibt keine versteckten Kosten. Auftraggeber zahlen nichts, Experten zahlen nur die Provision bei Erfolg.' },
    { q: 'Wie funktioniert das Escrow-System?', a: 'Der Auftraggeber zahlt den Betrag auf ein Treuhandkonto. Das Geld wird erst an den Experten freigegeben, wenn das Projekt abgeschlossen ist.' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-secondary-50">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Faire Preise
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Transparente <span className="text-primary-600">Preisgestaltung</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Keine versteckten Gebühren – Sie zahlen nur für erfolgreiche Projekte
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-4">
              Für Auftraggeber
            </div>
            <div className="text-5xl font-bold text-neutral-900 mb-2">Kostenlos</div>
            <p className="text-neutral-600 mb-8">Finden und kontaktieren Sie Experten ohne Gebühren</p>
            <ul className="space-y-4 mb-8">
              {clientFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="outline" className="w-full" size="lg">
                Kostenlos registrieren
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
                Für Experten
              </div>
              <div className="text-5xl font-bold mb-2">10%</div>
              <p className="text-primary-100 mb-8">Provision nur auf erfolgreich abgeschlossene Projekte</p>
              <ul className="space-y-4 mb-8">
                {expertFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/become-expert">
                <Button variant="secondary" className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Experte werden
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-neutral-900">Häufige Fragen zu Preisen</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                <h3 className="font-semibold text-neutral-900 mb-2">{faq.q}</h3>
                <p className="text-neutral-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

