import { Shield, CheckCircle, Clock, Star } from 'lucide-preact';

const features = [
  {
    icon: Shield,
    title: 'Sichere Zahlungen',
    desc: 'Escrow-System schützt beide Seiten',
  },
  {
    icon: CheckCircle,
    title: 'Verifizierte Experten',
    desc: 'Alle Experten werden geprüft',
  },
  {
    icon: Clock,
    title: 'Schnelle Lieferung',
    desc: 'Projekte termingerecht abgeschlossen',
  },
  {
    icon: Star,
    title: 'Qualitätsgarantie',
    desc: 'Zufriedenheit oder Geld zurück',
  },
];

export function FeaturesSection() {
  return (
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Warum DACH Automation?</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent class="w-8 h-8 text-blue-600" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p class="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

