import { Users, Shield, Globe, Award } from 'lucide-preact';

export default function AboutPage() {
  return (
    <div class="min-h-screen bg-gray-50">
      {/* Hero */}
      <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">Über DACH Automation</h1>
          <p class="text-xl text-blue-100">
            Der führende Marktplatz für Automatisierungsexperten in der DACH-Region
          </p>
        </div>
      </div>

      {/* Mission */}
      <div class="max-w-4xl mx-auto px-4 py-16">
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Unsere Mission</h2>
          <p class="text-gray-600 text-lg leading-relaxed">
            Wir verbinden Unternehmen mit den besten Automatisierungsexperten in der Schweiz, 
            Deutschland und Österreich. Unsere Plattform macht es einfach, qualifizierte Experten 
            für n8n, Make, Zapier, Power Automate und KI-Lösungen zu finden.
          </p>
        </div>
      </div>

      {/* Values */}
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-2xl font-bold text-gray-900 text-center mb-12">Unsere Werte</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Vertrauen', desc: 'Alle Experten werden sorgfältig geprüft' },
              { icon: Award, title: 'Qualität', desc: 'Nur die besten Automatisierungslösungen' },
              { icon: Globe, title: 'DACH-Fokus', desc: 'Spezialisiert auf die DACH-Region' },
              { icon: Users, title: 'Community', desc: 'Eine starke Gemeinschaft von Experten' },
            ].map((value) => {
              const IconComponent = value.icon;
              return (
                <div key={value.title} class="text-center">
                  <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent class="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p class="text-gray-600 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Bereit loszulegen?</h2>
        <p class="text-gray-600 mb-8">
          Finden Sie den perfekten Experten für Ihr Automatisierungsprojekt
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/services" class="btn btn-primary">Services durchsuchen</a>
          <a href="/become-expert" class="btn btn-secondary">Experte werden</a>
        </div>
      </div>
    </div>
  );
}

