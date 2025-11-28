import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Github, Mail } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

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
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl text-white">DACH<span className="text-primary-400">Flow</span></span>
            </Link>
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

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
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

