import { Search, Menu, User, ChevronDown } from 'lucide-preact';
import { Logo } from '@/components/brand/Logo.tsx';

export function Header() {
  return (
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" class="flex items-center gap-2">
            <Logo />
            <span class="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              DACH<span class="text-blue-600">Automation</span>
            </span>
          </a>

          {/* Navigation - Desktop */}
          <nav class="hidden md:flex items-center gap-6">
            <a href="/services" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Services
            </a>
            <a href="/experts" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Experten
            </a>
            <a href="/categories" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Kategorien
            </a>
            <a href="/how-it-works" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              So funktioniert's
            </a>
          </nav>

          {/* Search & Actions */}
          <div class="flex items-center gap-4">
            {/* Search */}
            <a 
              href="/search" 
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Suche"
            >
              <Search class="w-5 h-5" />
            </a>

            {/* Auth Buttons */}
            <div class="hidden sm:flex items-center gap-2">
              <a
                href="/auth/login"
                class="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Anmelden
              </a>
              <a
                href="/auth/register"
                class="btn btn-primary"
              >
                Registrieren
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              type="button"
              class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              aria-label="Menü öffnen"
            >
              <Menu class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

