import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const contactInfo = [
    { icon: Mail, label: 'E-Mail', value: 'hello@dachflow.com', href: 'mailto:hello@dachflow.com', color: 'bg-primary-100 text-primary-600' },
    { icon: Phone, label: 'Telefon', value: '+41 44 000 00 00', href: 'tel:+41440000000', color: 'bg-secondary-100 text-secondary-600' },
    { icon: MapPin, label: 'Standort', value: 'Zürich, Schweiz', href: null, color: 'bg-purple-100 text-purple-600' },
    { icon: Clock, label: 'Support-Zeiten', value: 'Mo-Fr 9:00-18:00', href: null, color: 'bg-orange-100 text-orange-600' },
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
            <MessageSquare className="w-4 h-4" />
            Kontakt
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Wir sind für Sie <span className="text-primary-600">da</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Haben Sie Fragen? Unser Team hilft Ihnen gerne weiter.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {contactInfo.map((info, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${info.color} flex items-center justify-center`}>
                <info.icon className="w-6 h-6" />
              </div>
              <p className="text-sm text-neutral-500 mb-1">{info.label}</p>
              {info.href ? (
                <a href={info.href} className="font-medium text-neutral-900 hover:text-primary-600 transition-colors">
                  {info.value}
                </a>
              ) : (
                <p className="font-medium text-neutral-900">{info.value}</p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100"
        >
          {submitted ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Nachricht gesendet!</h3>
              <p className="text-neutral-600 mb-6">Vielen Dank für Ihre Nachricht. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Weitere Nachricht senden
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Ihr Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="ihre@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Betreff</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Worum geht es?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nachricht *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  placeholder="Ihre Nachricht..."
                />
              </div>
              <Button type="submit" size="lg" className="w-full" rightIcon={<Send className="w-4 h-4" />}>
                Nachricht senden
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

