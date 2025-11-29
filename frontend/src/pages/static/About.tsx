import { motion } from 'framer-motion';
import { Users, Target, Award, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand';
import { Button } from '@/components/ui';

export function About() {
  const values = [
    { icon: Target, title: 'Unsere Mission', desc: 'Automatisierung für alle zugänglich machen und Unternehmen bei der digitalen Transformation unterstützen.', color: 'bg-primary-100 text-primary-600' },
    { icon: Users, title: 'Unser Team', desc: 'Ein Team aus Automatisierungs-Enthusiasten, Entwicklern und Unternehmern aus der DACH-Region.', color: 'bg-secondary-100 text-secondary-600' },
    { icon: Award, title: 'Qualität', desc: 'Alle Experten werden sorgfältig geprüft und verifiziert, um höchste Qualitätsstandards zu gewährleisten.', color: 'bg-accent-100 text-accent-600' },
    { icon: Globe, title: 'DACH-Fokus', desc: 'Spezialisiert auf die DACH-Region mit lokalem Support, Datenschutz-Konformität und kulturellem Verständnis.', color: 'bg-purple-100 text-purple-600' },
  ];

  const stats = [
    { value: '500+', label: 'Verifizierte Experten' },
    { value: '2.000+', label: 'Abgeschlossene Projekte' },
    { value: '98%', label: 'Kundenzufriedenheit' },
    { value: '3', label: 'DACH-Länder' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/5 to-secondary-600/5" />
        <div className="max-w-5xl mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Die Zukunft der <span className="text-primary-600">Automatisierung</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              DACHFlow verbindet Unternehmen in der Schweiz, Deutschland und Österreich
              mit den besten Automatisierungs-Experten. Wir glauben, dass jedes Unternehmen
              von intelligenter Automatisierung profitieren kann.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Unsere Werte
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">Was uns antreibt</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-neutral-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Bereit, Ihr Unternehmen zu automatisieren?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Starten Sie noch heute und finden Sie den perfekten Experten für Ihr Projekt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/experts">
              <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Experten entdecken
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Kontakt aufnehmen
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

