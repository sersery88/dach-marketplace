import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, User, MessageSquare, Bell,
  ChevronDown, Globe, LogOut, Settings, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { href: '/services', label: t('nav.services') },
    { href: '/experts', label: t('nav.experts') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
  ];

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-neutral-900">DACH<span className="text-primary-600">Flow</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-neutral-500 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
              <Search className="w-4 h-4" />
              <span className="text-sm">{t('common.search')}</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 p-2 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{i18n.language}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                  <button onClick={() => toggleLanguage('de')} className={cn("w-full px-4 py-2 text-left text-sm hover:bg-neutral-50", i18n.language === 'de' && 'text-primary-600 font-medium')}>
                    🇩🇪 Deutsch
                  </button>
                  <button onClick={() => toggleLanguage('en')} className={cn("w-full px-4 py-2 text-left text-sm hover:bg-neutral-50", i18n.language === 'en' && 'text-primary-600 font-medium')}>
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-neutral-600 hover:text-primary-600">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <Link to="/messages" className="p-2 text-neutral-600 hover:text-primary-600">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        <User className="w-4 h-4" /> {t('nav.profile')}
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        <Settings className="w-4 h-4" /> {t('nav.settings')}
                      </Link>
                      <hr className="my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>{t('common.login')}</Button>
                <Button onClick={() => navigate('/register')}>{t('common.register')}</Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={link.href} className="block py-2 text-neutral-700 font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-4 space-y-2"
                >
                  <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>{t('common.login')}</Button>
                  <Button className="w-full" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>{t('common.register')}</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

