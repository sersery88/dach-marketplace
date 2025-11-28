import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search, Star, MapPin, Clock, CheckCircle,
  SlidersHorizontal, X, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useExperts } from '@/hooks';
import type { ExpertSearchFilters } from '@/types';

const countryFlags: Record<string, string> = { CH: '🇨🇭', DE: '🇩🇪', AT: '🇦🇹' };

// Loading skeleton for expert cards
function ExpertCardSkeleton() {
  return (
    <Card className="text-center">
      <div className="flex flex-col items-center">
        <Skeleton className="w-20 h-20 rounded-full mb-4" />
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  );
}

export function Experts() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Build filters from URL params
  const filters: ExpertSearchFilters = useMemo(() => ({
    q: searchParams.get('q') || undefined,
    countries: searchParams.get('countries') || undefined,
    minRate: searchParams.get('minRate') ? Number(searchParams.get('minRate')) : undefined,
    maxRate: searchParams.get('maxRate') ? Number(searchParams.get('maxRate')) : undefined,
    verifiedOnly: searchParams.get('verified') === 'true' || undefined,
    page: Number(searchParams.get('page')) || 1,
    perPage: 12,
  }), [searchParams]);

  // Fetch experts
  const { data, isLoading, isError, error } = useExperts(filters);
  const experts = data?.data ?? [];
  const meta = data?.meta;

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchParams, setSearchParams]);

  // Handle filter changes
  const handleCountryChange = useCallback((country: string) => {
    const params = new URLSearchParams(searchParams);
    if (country && country !== 'all') {
      params.set('countries', country);
    } else {
      params.delete('countries');
    }
    params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            {t('experts.title')}
          </h1>
          <p className="text-neutral-600 mb-6">
            {t('experts.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('experts.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              {t('common.filter', 'Filter')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-64 shrink-0">
              <Card padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{t('common.filter', 'Filter')}</h3>
                  <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">{t('experts.country', 'Land')}</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
                      value={searchParams.get('countries') || 'all'}
                      onChange={(e) => handleCountryChange(e.target.value)}
                    >
                      <option value="all">{t('experts.allCountries', 'Alle Länder')}</option>
                      <option value="CH">🇨🇭 {t('countries.CH', 'Schweiz')}</option>
                      <option value="DE">🇩🇪 {t('countries.DE', 'Deutschland')}</option>
                      <option value="AT">🇦🇹 {t('countries.AT', 'Österreich')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">{t('experts.hourlyRate', 'Stundensatz')}</label>
                    <div className="flex gap-2 mt-1">
                      <input type="number" placeholder="Min" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                      <input type="number" placeholder="Max" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={searchParams.get('verified') === 'true'}
                        onChange={(e) => {
                          const params = new URLSearchParams(searchParams);
                          if (e.target.checked) {
                            params.set('verified', 'true');
                          } else {
                            params.delete('verified');
                          }
                          setSearchParams(params);
                        }}
                        className="rounded border-neutral-300"
                      />
                      {t('experts.verifiedOnly', 'Nur verifizierte')}
                    </label>
                  </div>
                </div>
              </Card>
            </motion.aside>
          )}

          {/* Experts Grid */}
          <div className="flex-1">
            {/* Results count */}
            <p className="text-neutral-600 mb-6">
              {isLoading ? (
                <Skeleton className="h-5 w-32 inline-block" />
              ) : (
                `${meta?.totalItems ?? 0} ${t('experts.found', 'Experten gefunden')}`
              )}
            </p>

            {/* Error state */}
            {isError && (
              <Card padding="lg" className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('common.error', 'Fehler')}</h3>
                <p className="text-neutral-600">
                  {error instanceof Error ? error.message : t('experts.loadError', 'Experten konnten nicht geladen werden.')}
                </p>
              </Card>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ExpertCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && experts.length === 0 && (
              <Card padding="lg" className="text-center">
                <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('experts.noResults', 'Keine Experten gefunden')}</h3>
                <p className="text-neutral-600">{t('experts.tryDifferentSearch', 'Versuchen Sie eine andere Suche.')}</p>
              </Card>
            )}

            {/* Experts grid */}
            {!isLoading && !isError && experts.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experts.map((expert, i) => (
                    <motion.div key={expert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/experts/${expert.id}`}>
                        <Card variant="interactive" className="text-center">
                          <div className="relative inline-block mb-4">
                            {expert.user?.avatarUrl ? (
                              <img src={expert.user.avatarUrl} alt={expert.headline} className="w-20 h-20 rounded-full object-cover mx-auto" />
                            ) : (
                              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl mx-auto">
                                {expert.headline.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                            {expert.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-primary-600 rounded-full p-1">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-neutral-900">{expert.headline}</h3>
                          <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{expert.bio}</p>
                          <div className="flex items-center justify-center gap-1 text-sm text-neutral-500 mb-3">
                            <span>{countryFlags[expert.user?.country?.toUpperCase() || ''] || '🌍'}</span>
                            <MapPin className="w-3 h-3" />
                            <span>{expert.timezone.split('/').pop()?.replace('_', ' ') || expert.user?.country?.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{expert.ratingAverage?.toFixed(1) || '0.0'}</span>
                            <span className="text-neutral-400">({expert.ratingCount || 0})</span>
                          </div>
                          <div className="flex flex-wrap justify-center gap-1 mb-4">
                            {expert.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">{skill}</span>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <div className={`flex items-center gap-1 text-sm ${expert.availabilityStatus === 'available' ? 'text-green-600' : 'text-neutral-400'}`}>
                              <Clock className="w-4 h-4" />
                              <span>{expert.availabilityStatus === 'available' ? t('experts.available', 'Verfügbar') : t('experts.busy', 'Beschäftigt')}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-neutral-900">{expert.currency} {expert.hourlyRate}</span>
                              <span className="text-xs text-neutral-500">/h</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.currentPage - 1)}
                      disabled={!meta.hasPrev}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-neutral-600">
                      {t('common.page', 'Seite')} {meta.currentPage} {t('common.of', 'von')} {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(meta.currentPage + 1)}
                      disabled={!meta.hasNext}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

