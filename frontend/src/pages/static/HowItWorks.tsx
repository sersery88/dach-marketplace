import { motion } from 'framer-motion';
import { CheckCircle, Search, MessageCircle, CreditCard, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function HowItWorks() {
  const steps = [
    { icon: Search, title: 'Experten finden', desc: 'Durchsuchen Sie unsere verifizierten Automatisierungs-Experten und finden Sie den perfekten Match für Ihr Projekt.', color: 'bg-primary-100 text-primary-600' },
    { icon: MessageCircle, title: 'Projekt besprechen', desc: 'Kontaktieren Sie Experten direkt, besprechen Sie Ihre Anforderungen und erhalten Sie maßgeschneiderte Angebote.', color: 'bg-secondary-100 text-secondary-600' },
    { icon: CreditCard, title: 'Sicher bezahlen', desc: 'Nutzen Sie unser Escrow-System für sichere Zahlungen. Das Geld wird erst freigegeben, wenn Sie zufrieden sind.', color: 'bg-purple-100 text-purple-600' },
    { icon: CheckCircle, title: 'Projekt abschließen', desc: 'Erhalten Sie Ihre Automatisierungslösung, geben Sie Feedback und bewerten Sie den Experten.', color: 'bg-green-100 text-green-600' },
  ];

  const benefits = [
    { icon: Shield, title: 'Sichere Zahlungen', desc: 'Escrow-System schützt beide Seiten' },
    { icon: Clock, title: 'Schnelle Vermittlung', desc: 'Innerhalb von 24h erste Angebote' },
    { icon: Star, title: 'Geprüfte Qualität', desc: 'Alle Experten sind verifiziert' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-secondary-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            So funktioniert <span className="text-primary-600">DACHFlow</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            In 4 einfachen Schritten zu Ihrer maßgeschneiderten Automatisierungslösung
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary-200 via-secondary-200 to-green-200 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
              >
                <div className={`shrink-0 w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center relative z-10`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                  </div>
                  <p className="text-neutral-600">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <benefit.icon className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">{benefit.title}</h4>
              <p className="text-sm text-neutral-600">{benefit.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Link to="/experts">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Jetzt Experten finden
            </Button>
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Kostenlos registrieren • Keine versteckten Gebühren
          </p>
        </motion.div>
      </div>
    </div>
  );
}

