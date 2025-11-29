import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, Users, CreditCard, Shield, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

const faqCategories = [
  {
    name: 'Allgemein',
    icon: HelpCircle,
    color: 'bg-primary-100 text-primary-600',
    faqs: [
      { q: 'Was ist DACHFlow?', a: 'DACHFlow ist der führende Marktplatz für KI & Automatisierung in der DACH-Region. Wir verbinden Unternehmen mit verifizierten Automatisierungs-Experten für Tools wie n8n, Make, Zapier, Power Automate und mehr.' },
      { q: 'Für wen ist DACHFlow geeignet?', a: 'DACHFlow ist für alle Unternehmen geeignet, die ihre Prozesse automatisieren möchten – von Startups bis zu etablierten Unternehmen. Auch Freelancer und Agenturen können als Experten ihre Dienste anbieten.' },
    ]
  },
  {
    name: 'Für Auftraggeber',
    icon: Users,
    color: 'bg-secondary-100 text-secondary-600',
    faqs: [
      { q: 'Wie finde ich einen Experten?', a: 'Nutzen Sie unsere Suchfunktion, um Experten nach Fachgebiet, Bewertung, Preis oder Verfügbarkeit zu filtern. Jeder Experte hat ein detailliertes Profil mit Portfolio und Bewertungen.' },
      { q: 'Was kostet die Nutzung?', a: 'Für Auftraggeber ist die Nutzung komplett kostenlos. Sie zahlen nur den vereinbarten Projektpreis – keine versteckten Gebühren.' },
      { q: 'Was passiert, wenn ich nicht zufrieden bin?', a: 'Wir bieten eine Qualitätsgarantie. Wenn das Projekt nicht Ihren Anforderungen entspricht, helfen wir bei der Lösung oder erstatten den Betrag.' },
    ]
  },
  {
    name: 'Für Experten',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-600',
    faqs: [
      { q: 'Wie werde ich Experte?', a: 'Registrieren Sie sich, vervollständigen Sie Ihr Profil mit Portfolio und Zertifikaten, und durchlaufen Sie unseren Verifizierungsprozess. Nach erfolgreicher Prüfung können Sie sofort Projekte annehmen.' },
      { q: 'Welche Gebühren fallen für Experten an?', a: 'Experten zahlen eine Provision von 10% auf erfolgreich abgeschlossene Projekte. Es gibt keine monatlichen Gebühren oder Vorabkosten.' },
    ]
  },
  {
    name: 'Zahlung & Sicherheit',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600',
    faqs: [
      { q: 'Wie funktioniert die Bezahlung?', a: 'Wir nutzen ein sicheres Escrow-System. Sie zahlen den vereinbarten Betrag, der sicher verwahrt wird, bis das Projekt zu Ihrer Zufriedenheit abgeschlossen ist.' },
      { q: 'Welche Zahlungsmethoden werden akzeptiert?', a: 'Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte (Visa, Mastercard, Amex), SEPA-Lastschrift, TWINT (Schweiz) und Banküberweisung.' },
      { q: 'Sind meine Daten sicher?', a: 'Ja, wir sind DSGVO-konform und verwenden modernste Verschlüsselung. Alle Zahlungen werden über Stripe abgewickelt, einen der sichersten Zahlungsanbieter weltweit.' },
    ]
  },
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => activeCategory ? cat.name === activeCategory : true);

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Häufig gestellte <span className="text-primary-600">Fragen</span>
          </h1>
          <p className="text-xl text-neutral-600">
            Finden Sie schnell Antworten auf Ihre Fragen
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen Sie nach Antworten..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            Alle
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-8">
          {filteredCategories.map((category, catIndex) => (
            category.faqs.length > 0 && (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + catIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-900">{category.name}</h2>
                </div>
                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const key = `${catIndex}-${faqIndex}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 transition-colors"
                        >
                          <span className="font-medium text-neutral-900 pr-4">{faq.q}</span>
                          <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-5 pb-5 text-neutral-600 border-t border-neutral-100 pt-4">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center"
        >
          <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Noch Fragen?</h3>
          <p className="text-neutral-600 mb-6">Unser Support-Team hilft Ihnen gerne weiter.</p>
          <Link to="/contact">
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              Kontakt aufnehmen
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

