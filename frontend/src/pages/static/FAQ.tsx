import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'Was ist DACHFlow?', a: 'DACHFlow ist der führende Marktplatz für KI & Automatisierung in der DACH-Region. Wir verbinden Unternehmen mit verifizierten Automatisierungs-Experten für Tools wie n8n, Make, Zapier, Power Automate und mehr.' },
  { q: 'Wie finde ich einen Experten?', a: 'Nutzen Sie unsere Suchfunktion, um Experten nach Fachgebiet, Bewertung, Preis oder Verfügbarkeit zu filtern. Jeder Experte hat ein detailliertes Profil mit Portfolio und Bewertungen.' },
  { q: 'Wie funktioniert die Bezahlung?', a: 'Wir nutzen ein sicheres Escrow-System. Sie zahlen den vereinbarten Betrag, der sicher verwahrt wird, bis das Projekt zu Ihrer Zufriedenheit abgeschlossen ist.' },
  { q: 'Welche Gebühren fallen an?', a: 'Für Auftraggeber ist die Nutzung kostenlos. Experten zahlen eine Provision von 10% auf erfolgreich abgeschlossene Projekte.' },
  { q: 'Was passiert, wenn ich nicht zufrieden bin?', a: 'Wir bieten eine Qualitätsgarantie. Wenn das Projekt nicht Ihren Anforderungen entspricht, helfen wir bei der Lösung oder erstatten den Betrag.' },
  { q: 'Wie werde ich Experte?', a: 'Registrieren Sie sich, vervollständigen Sie Ihr Profil mit Portfolio und Zertifikaten, und durchlaufen Sie unseren Verifizierungsprozess.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Häufig gestellte Fragen</h1>
          <p className="text-xl text-gray-600">Antworten auf die wichtigsten Fragen</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                {openIndex === index ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Haben Sie weitere Fragen?</p>
          <a href="/contact" className="text-blue-600 hover:underline font-medium">Kontaktieren Sie uns</a>
        </div>
      </div>
    </div>
  );
}

