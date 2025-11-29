import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, User, MessageSquare, Bell,
  ChevronDown, Globe, LogOut, Settings, LayoutDashboard,
  Zap, Bot, Database, Users, ShoppingCart, Megaphone, FileText, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo } from '@/components/brand';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// Category icons for mega menu
const categoryItems = [
  { slug: 'workflow', name: 'Workflow Automation', icon: Zap, color: 'text-blue-500' },
  { slug: 'ai', name: 'KI & Machine Learning', icon: Bot, color: 'text-purple-500' },
  { slug: 'data', name: 'Datenintegration', icon: Database, color: 'text-green-500' },
  { slug: 'crm', name: 'CRM Automation', icon: Users, color: 'text-orange-500' },
  { slug: 'ecommerce', name: 'E-Commerce', icon: ShoppingCart, color: 'text-pink-500' },
  { slug: 'marketing', name: 'Marketing Automation', icon: Megaphone, color: 'text-yellow-600' },
  { slug: 'documents', name: 'Dokumenten-Workflows', icon: FileText, color: 'text-teal-500' },
  { slug: 'chatbots', name: 'Chatbots & Support', icon: MessageCircle, color: 'text-indigo-500' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = [
    { href: '/services', label: t('nav.services') },
    { href: '/experts', label: t('nav.experts') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
  ];

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setCategoriesOpen(true);
  };

  const handleCategoriesLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => setCategoriesOpen(false), 150);
  };

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Categories Mega Menu */}
            <div
              className="relative"
              onMouseEnter={handleCategoriesEnter}
              onMouseLeave={handleCategoriesLeave}
            >
              <button className="flex items-center gap-1 text-neutral-600 hover:text-primary-600 font-medium transition-colors py-4">
                {t('nav.categories', 'Kategorien')}
                <ChevronDown className={cn("w-4 h-4 transition-transform", categoriesOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-0 w-[500px] bg-white rounded-xl shadow-xl border border-neutral-200 p-4 grid grid-cols-2 gap-2"
                  >
                    {categoryItems.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/categories/${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <div className={cn("w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform", cat.color)}>
                          <cat.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-neutral-700 group-hover:text-primary-600">{cat.name}</span>
                      </Link>
                    ))}
                    <Link
                      to="/categories"
                      onClick={() => setCategoriesOpen(false)}
                      className="col-span-2 text-center py-2 text-primary-600 hover:text-primary-700 font-medium border-t border-neutral-100 mt-2"
                    >
                      Alle Kategorien anzeigen →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="flex items-center"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={t('common.searchPlaceholder', 'Suchen...')}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
                    <button
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="absolute right-2 p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-neutral-500 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">{t('common.search')}</span>
                    <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs bg-neutral-200 rounded">⌘K</kbd>
                  </button>
                )}
              </AnimatePresence>
            </div>

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

