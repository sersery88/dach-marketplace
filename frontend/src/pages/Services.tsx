import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Grid, List, Star, Clock, X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useServices } from '@/hooks';
import type { ServiceSearchFilters, Service } from '@/types';

// Format price from cents to display value
function formatPrice(cents: number, currency: string): string {
  const value = cents / 100;
  return `${currency.toUpperCase()} ${value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Service card skeleton for loading state
function ServiceCardSkeleton() {
  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function Services() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Build filters from URL params and local state
  const filters: ServiceSearchFilters = useMemo(() => ({
    q: debouncedQuery || undefined,
    categoryId: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    maxDeliveryDays: searchParams.get('maxDays') ? Number(searchParams.get('maxDays')) : undefined,
    sortBy: (searchParams.get('sort') as ServiceSearchFilters['sortBy']) || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 12,
  }), [debouncedQuery, searchParams]);

  // Fetch services with React Query
  const { data, isLoading, isError, error } = useServices(filters);

  // Debounce search query
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Simple debounce using setTimeout
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(value);
      if (value) {
        searchParams.set('q', value);
      } else {
        searchParams.delete('q');
      }
      searchParams.delete('page'); // Reset to page 1 on new search
      setSearchParams(searchParams);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchParams, setSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    searchParams.set('page', String(page));
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  const services = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            {t('services.title')}
          </h1>
          <p className="text-neutral-600 mb-6">
            {t('services.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('services.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 shrink-0"
            >
              <Card padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filter</h3>
                  <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Filter options would go here */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Kategorie</label>
                    <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
                      <option>Alle Kategorien</option>
                      <option>Workflow-Automatisierung</option>
                      <option>KI & Machine Learning</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Preis</label>
                    <div className="flex gap-2 mt-1">
                      <input type="number" placeholder="Min" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                      <input type="number" placeholder="Max" className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Lieferzeit</label>
                    <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
                      <option>Beliebig</option>
                      <option>Bis 3 Tage</option>
                      <option>Bis 7 Tage</option>
                    </select>
                  </div>
                </div>
              </Card>
            </motion.aside>
          )}

          {/* Services Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              {isLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <p className="text-neutral-600">
                  {meta?.totalItems ?? 0} {t('services.found', 'Dienstleistungen gefunden')}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400'}`}>
                  <Grid className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400'}`}>
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <Card padding="lg" className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('services.error', 'Fehler beim Laden')}
                </h3>
                <p className="text-neutral-600">
                  {error instanceof Error ? error.message : t('services.errorMessage', 'Bitte versuchen Sie es später erneut.')}
                </p>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && services.length === 0 && (
              <Card padding="lg" className="text-center">
                <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('services.noResults', 'Keine Dienstleistungen gefunden')}
                </h3>
                <p className="text-neutral-600">
                  {t('services.noResultsMessage', 'Versuchen Sie andere Suchbegriffe oder Filter.')}
                </p>
              </Card>
            )}

            {/* Services List */}
            {!isLoading && !isError && services.length > 0 && (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {services.map((service: Service, i: number) => (
                    <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/services/${service.id}`}>
                        <Card variant="interactive" padding="none" className="overflow-hidden">
                          {/* Service Image or Gradient */}
                          {service.images && service.images.length > 0 ? (
                            <img src={service.images[0]} alt={service.title} className="h-40 w-full object-cover" />
                          ) : (
                            <div className="h-40 bg-linear-to-br from-primary-100 to-primary-200" />
                          )}
                          <div className="p-4">
                            {/* Expert info - show initials from title if no expert data */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
                                {service.title.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <span className="text-sm text-neutral-600 truncate">
                                {service.shortDescription?.slice(0, 30) || 'Expert'}
                              </span>
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{service.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{service.ratingAverage?.toFixed(1) || '0.0'}</span>
                              <span>({service.ratingCount || 0})</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                              <div className="flex items-center gap-1 text-sm text-neutral-500">
                                <Clock className="w-4 h-4" />
                                <span>{service.deliveryTimeDays} {t('services.days', 'Tage')}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-neutral-500">{t('services.from', 'Ab')}</span>
                                <span className="font-bold text-neutral-900 ml-1">
                                  {formatPrice(service.price, service.currency)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasPrev}
                      onClick={() => handlePageChange(meta.currentPage - 1)}
                    >
                      {t('pagination.prev', 'Zurück')}
                    </Button>
                    <span className="text-sm text-neutral-600 px-4">
                      {t('pagination.page', 'Seite')} {meta.currentPage} {t('pagination.of', 'von')} {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasNext}
                      onClick={() => handlePageChange(meta.currentPage + 1)}
                    >
                      {t('pagination.next', 'Weiter')}
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

