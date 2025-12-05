import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Github, Mail, Send, CheckCircle, Shield, CreditCard, Lock } from 'lucide-react';
import { Logo } from '@/components/brand';
import { Button } from '@/components/ui';
import { client } from '@/api/client'; // Import client

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  import { client } from '@/api/client';

  // ... inside component
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await client.post('/newsletter/subscribe', { email });
        setSubscribed(true);
        setEmail('');
      } catch (error) {
        console.error('Newsletter subscription failed:', error);
      }
    }
  };

  const footerLinks = {
    company: [
      { href: '/about', label: t('nav.about') },
      { href: '/how-it-works', label: t('nav.howItWorks') },
      { href: '/pricing', label: t('nav.pricing') },
      { href: '/careers', label: 'Karriere' },
    ],
    support: [
      { href: '/help', label: 'Hilfe-Center' },
      { href: '/contact', label: t('nav.contact') },
      { href: '/faq', label: 'FAQ' },
      { href: '/trust-safety', label: 'Vertrauen & Sicherheit' },
    ],
    legal: [
      { href: '/terms', label: t('footer.terms') },
      { href: '/privacy', label: t('footer.privacy') },
      { href: '/imprint', label: t('footer.imprint') },
      { href: '/cookies', label: 'Cookie-Einstellungen' },
    ],
  };

  const socialLinks = [
    { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
    { href: 'mailto:hello@dachflow.com', icon: Mail, label: 'Email' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-neutral-400 text-sm mb-6 max-w-xs">
              {t('footer.tagline')}
            </p>
            {/* Country Flags */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl" title="Schweiz">🇨🇭</span>
              <span className="text-2xl" title="Deutschland">🇩🇪</span>
              <span className="text-2xl" title="Österreich">🇦🇹</span>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-semibold text-white mb-2">Newsletter abonnieren</h3>
              <p className="text-sm text-neutral-400">Erhalten Sie die neuesten Updates zu Automatisierung und KI.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Erfolgreich abonniert!</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre@email.com"
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <Button type="submit" size="md">
                    <Send className="w-4 h-4" />
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-neutral-400">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Lock className="w-5 h-5 text-blue-500" />
              <span className="text-sm">SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Sichere Zahlung via Stripe</span>
            </div>
          </div>

          {/* Payment Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-12 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">VISA</div>
            <div className="w-12 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">MC</div>
            <div className="w-12 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">AMEX</div>
            <div className="w-12 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">TWINT</div>
            <div className="w-12 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">SEPA</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>Made with ❤️ in DACH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

