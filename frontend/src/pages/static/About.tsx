import { Users, Target, Award, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Über DACHFlow</h1>
          <p className="text-xl text-gray-600">Der führende Marktplatz für KI & Automatisierung in der DACH-Region</p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p>
            DACHFlow wurde gegründet, um Unternehmen in der Schweiz, Deutschland und Österreich 
            mit den besten Automatisierungs-Experten zu verbinden. Wir glauben, dass jedes Unternehmen 
            von intelligenter Automatisierung profitieren kann – unabhängig von seiner Größe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Target, title: 'Unsere Mission', desc: 'Automatisierung für alle zugänglich machen und Unternehmen bei der digitalen Transformation unterstützen.' },
            { icon: Users, title: 'Unser Team', desc: 'Ein Team aus Automatisierungs-Enthusiasten, Entwicklern und Unternehmern aus der DACH-Region.' },
            { icon: Award, title: 'Qualität', desc: 'Alle Experten werden sorgfältig geprüft und verifiziert, um höchste Qualitätsstandards zu gewährleisten.' },
            { icon: Globe, title: 'DACH-Fokus', desc: 'Spezialisiert auf die DACH-Region mit lokalem Support, Datenschutz-Konformität und kulturellem Verständnis.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <item.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Haben Sie Fragen?</h2>
          <p className="text-gray-600 mb-6">Wir sind für Sie da und helfen Ihnen gerne weiter.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Kontaktieren Sie uns
          </a>
        </div>
      </div>
    </div>
  );
}

