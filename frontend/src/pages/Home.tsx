import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Zap, Bot, Database, Users,
  ShoppingCart, Megaphone, FileText, MessageCircle,
  Star, CheckCircle, Shield, Clock, ArrowRight
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useFeaturedExperts, useFeaturedServices, useFeaturedCategories } from '@/hooks';
import type { ExpertProfile, Service, Category } from '@/types';

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  workflow: Zap, ai: Bot, data: Database, crm: Users,
  ecommerce: ShoppingCart, marketing: Megaphone, documents: FileText, chatbots: MessageCircle,
};
const categoryColors: Record<string, string> = {
  workflow: 'bg-blue-500', ai: 'bg-purple-500', data: 'bg-green-500', crm: 'bg-orange-500',
  ecommerce: 'bg-pink-500', marketing: 'bg-yellow-500', documents: 'bg-teal-500', chatbots: 'bg-indigo-500',
};

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from API
  const { data: featuredExperts, isLoading: expertsLoading } = useFeaturedExperts();
  const { data: featuredServices, isLoading: servicesLoading } = useFeaturedServices();
  const { data: featuredCategories, isLoading: categoriesLoading } = useFeaturedCategories();

  const stats = [
    { value: '500+', label: 'Experten' },
    { value: '2,000+', label: 'Projekte' },
    { value: '98%', label: 'Zufriedenheit' },
    { value: '24h', label: 'Antwortzeit' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary-700 via-primary-800 to-secondary-900 text-white overflow-hidden">
        {/* Animated Flow Lines Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <path d="M0 400 Q360 300, 720 400 T1440 400" stroke="white" strokeWidth="2" fill="none" opacity="0.5">
              <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0 400 Q360 300, 720 400 T1440 400;M0 400 Q360 500, 720 400 T1440 400;M0 400 Q360 300, 720 400 T1440 400"/>
            </path>
            <path d="M0 500 Q360 400, 720 500 T1440 500" stroke="white" strokeWidth="2" fill="none" opacity="0.3">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0 500 Q360 400, 720 500 T1440 500;M0 500 Q360 600, 720 500 T1440 500;M0 500 Q360 400, 720 500 T1440 500"/>
            </path>
            <path d="M0 300 Q360 200, 720 300 T1440 300" stroke="white" strokeWidth="2" fill="none" opacity="0.4">
              <animate attributeName="d" dur="12s" repeatCount="indefinite" values="M0 300 Q360 200, 720 300 T1440 300;M0 300 Q360 400, 720 300 T1440 300;M0 300 Q360 200, 720 300 T1440 300"/>
            </path>
          </svg>
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-primary-900/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
                <span className="flex gap-1">🇨🇭 🇩🇪 🇦🇹</span>
                <span>Der #1 Marktplatz für Automatisierung in DACH</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full pl-12 pr-32 py-4 rounded-xl text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="lg" onClick={handleSearch}>
                  {t('hero.cta')}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-primary-200"
            >
              <span>Beliebt:</span>
              {['n8n', 'Make', 'ChatGPT', 'Zapier', 'Power Automate'].map((tag) => (
                <button key={tag} className="hover:text-white transition-colors">
                  {tag}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">{t('categories.title')}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Finden Sie Experten für jede Art von Automatisierung
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoriesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="text-center">
                    <div className="w-14 h-14 bg-neutral-200 rounded-xl mx-auto mb-4" />
                    <div className="h-4 bg-neutral-200 rounded w-24 mx-auto" />
                  </Card>
                </div>
              ))
            ) : (
              (featuredCategories || []).slice(0, 8).map((cat: Category, i: number) => {
                const IconComponent = categoryIcons[cat.slug] || Zap;
                const colorClass = categoryColors[cat.slug] || 'bg-primary-500';
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card variant="interactive" className="text-center group" onClick={() => navigate(`/categories/${cat.slug}`)}>
                      <div className={`w-14 h-14 ${colorClass} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-neutral-900">{cat.name}</h3>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/categories')}>
              {t('categories.viewAll', 'Alle Kategorien')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('home.featuredServices', 'Beliebte Services')}</h2>
              <p className="text-neutral-600">Top-bewertete Automatisierungslösungen</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/services')}>
              {t('home.viewAllServices', 'Alle Services')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <div className="h-40 bg-neutral-200 rounded-lg mb-4" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                  </Card>
                </div>
              ))
            ) : (
              (featuredServices || []).slice(0, 6).map((service: Service) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card variant="interactive" onClick={() => navigate(`/services/${service.slug}`)}>
                    <div className="h-40 bg-linear-to-br from-primary-100 to-primary-50 rounded-lg mb-4 flex items-center justify-center">
                      <Zap className="w-12 h-12 text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{service.title}</h3>
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{service.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{service.ratingAverage?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="font-semibold text-primary-600">
                        {service.currency === 'chf' ? 'CHF' : '€'} {(service.price / 100).toFixed(0)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Experts Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('home.featuredExperts', 'Top Experten')}</h2>
              <p className="text-neutral-600">Verifizierte Automatisierungs-Profis</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/experts')}>
              {t('home.viewAllExperts', 'Alle Experten')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="text-center">
                    <div className="w-20 h-20 bg-neutral-200 rounded-full mx-auto mb-4" />
                    <div className="h-4 bg-neutral-200 rounded w-24 mx-auto mb-2" />
                    <div className="h-3 bg-neutral-200 rounded w-32 mx-auto" />
                  </Card>
                </div>
              ))
            ) : (
              (featuredExperts || []).slice(0, 4).map((expert: ExpertProfile) => {
                const displayName = expert.user?.firstName && expert.user?.lastName
                  ? `${expert.user.firstName} ${expert.user.lastName}`
                  : expert.user?.email?.split('@')[0] || 'Expert';
                return (
                  <motion.div key={expert.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <Card variant="interactive" className="text-center" onClick={() => navigate(`/experts/${expert.id}`)}>
                      <div className="w-20 h-20 bg-linear-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-1">{displayName}</h3>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-1">{expert.headline}</p>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-primary-600 font-medium">
                          {expert.currency === 'chf' ? 'CHF' : '€'} {(expert.hourlyRate / 100).toFixed(0)}/h
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">{t('home.whyUs', 'Warum DACHFlow?')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Sichere Zahlungen', desc: 'Escrow-System schützt beide Seiten' },
              { icon: CheckCircle, title: 'Verifizierte Experten', desc: 'Alle Experten werden geprüft' },
              { icon: Clock, title: 'Schnelle Lieferung', desc: 'Projekte termingerecht abgeschlossen' },
              { icon: Star, title: 'Qualitätsgarantie', desc: 'Zufriedenheit oder Geld zurück' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle', 'Bereit loszulegen?')}</h2>
          <p className="text-primary-100 mb-8 text-lg">{t('home.ctaSubtitle', 'Finden Sie den perfekten Experten für Ihr Automatisierungsprojekt')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/services')}>
              {t('home.browseServices', 'Services durchsuchen')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate('/become-expert')}>
              {t('home.becomeExpert', 'Experte werden')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

