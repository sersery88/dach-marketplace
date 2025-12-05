import { Logo } from '@/components/brand/Logo.tsx';

const footerLinks = {
  platform: [
    { href: '/services', label: 'Services' },
    { href: '/experts', label: 'Experten finden' },
    { href: '/categories', label: 'Kategorien' },
    { href: '/how-it-works', label: 'So funktioniert\'s' },
    { href: '/pricing', label: 'Preise' },
  ],
  company: [
    { href: '/about', label: 'Über uns' },
    { href: '/careers', label: 'Karriere' },
    { href: '/contact', label: 'Kontakt' },
    { href: '/help', label: 'Hilfe' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/terms', label: 'AGB' },
    { href: '/privacy', label: 'Datenschutz' },
    { href: '/imprint', label: 'Impressum' },
    { href: '/cookies', label: 'Cookies' },
    { href: '/trust-safety', label: 'Vertrauen & Sicherheit' },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div class="col-span-2 md:col-span-1">
            <a href="/" class="flex items-center gap-2 mb-4">
              <Logo />
              <span class="font-bold text-lg text-gray-900 dark:text-white">
                DACH<span class="text-blue-600">Automation</span>
              </span>
            </a>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Die führende Plattform für Automatisierungs-Experten in der DACH-Region.
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>🇨🇭</span>
              <span>🇩🇪</span>
              <span>🇦🇹</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Plattform</h3>
            <ul class="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Unternehmen</h3>
            <ul class="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Rechtliches</h3>
            <ul class="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {year} DACH Automation Marketplace. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}

