import { useState } from 'react';
import { Search, HelpCircle, MessageCircle, FileText } from 'lucide-react';

const categories = [
  { icon: HelpCircle, title: 'Erste Schritte', articles: ['Wie registriere ich mich?', 'Wie finde ich einen Experten?', 'Wie funktioniert die Bezahlung?'] },
  { icon: MessageCircle, title: 'Kommunikation', articles: ['Wie kontaktiere ich einen Experten?', 'Wie funktioniert das Messaging?', 'Kann ich Videoanrufe machen?'] },
  { icon: FileText, title: 'Projekte', articles: ['Wie erstelle ich ein Projekt?', 'Wie funktioniert die Lieferung?', 'Was ist die Qualitätsgarantie?'] },
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hilfe-Center</h1>
          <p className="text-xl text-gray-600 mb-8">Wie können wir Ihnen helfen?</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Suchen Sie nach Hilfeartikeln..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.articles.map((article, j) => (
                  <li key={j}>
                    <a href="#" className="text-blue-600 hover:underline text-sm">{article}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Noch Fragen?</h2>
          <p className="text-gray-600 mb-6">Unser Support-Team hilft Ihnen gerne weiter.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Kontaktieren Sie uns
          </a>
        </div>
      </div>
    </div>
  );
}

