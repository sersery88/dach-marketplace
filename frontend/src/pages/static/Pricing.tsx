import { Check } from 'lucide-react';

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Transparente Preise</h1>
          <p className="text-xl text-gray-600">Keine versteckten Gebühren – Sie zahlen nur für erfolgreiche Projekte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Für Auftraggeber</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">Kostenlos</div>
            <p className="text-gray-600 mb-6">Finden und kontaktieren Sie Experten ohne Gebühren</p>
            <ul className="space-y-3">
              {['Unbegrenzte Projektanfragen', 'Direkte Kommunikation mit Experten', 'Sichere Escrow-Zahlungen', 'Qualitätsgarantie', '24/7 Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-600 rounded-xl p-8 shadow-lg text-white">
            <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wide mb-2">Für Experten</h3>
            <div className="text-4xl font-bold mb-4">10% Provision</div>
            <p className="text-blue-100 mb-6">Nur auf erfolgreich abgeschlossene Projekte</p>
            <ul className="space-y-3">
              {['Keine monatlichen Gebühren', 'Zugang zu qualifizierten Leads', 'Verifiziertes Experten-Badge', 'Prioritärer Support', 'Marketing-Unterstützung'].map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-200" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bereit loszulegen?</h2>
          <div className="flex justify-center gap-4">
            <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Als Auftraggeber registrieren
            </a>
            <a href="/become-expert" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition border border-gray-200">
              Experte werden
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

