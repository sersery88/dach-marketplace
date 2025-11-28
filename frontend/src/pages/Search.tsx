import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon, Star, Clock, MapPin,
  SlidersHorizontal, Grid, List, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useSearchExperts, useSearchServices, useCategories } from '@/hooks';
import type { ExpertSearchResult, ServiceSearchResult, ExpertSearchFilters, ServiceSearchFilters } from '@/types';

// Loading skeleton for search results
function SearchResultsSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
      {[...Array(4)].map((_, i) => (
        <Card key={i} padding="md" className={viewMode === 'list' ? 'flex gap-6' : ''}>
          <div className={viewMode === 'list' ? 'shrink-0' : 'mb-4'}>
            <Skeleton className={viewMode === 'list' ? 'w-24 h-24 rounded-xl' : 'w-full h-48 rounded-xl'} />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const sortOptions = [
  { value: 'rating', label: 'Beste Bewertung' },
  { value: 'price_asc', label: 'Preis: Niedrig → Hoch' },
  { value: 'price_desc', label: 'Preis: Hoch → Niedrig' },
  { value: 'newest', label: 'Neueste' },
];

const toolFilters = ['n8n', 'Make', 'Zapier', 'Power Automate', 'ChatGPT', 'Claude', 'Airtable', 'Notion', 'Slack'];
const countryFilters = [
  { value: 'ch', label: '🇨🇭 Schweiz' },
  { value: 'de', label: '🇩🇪 Deutschland' },
  { value: 'at', label: '🇦🇹 Österreich' },
];
const deliveryTimeFilters = [
  { value: 3, label: 'Bis 3 Tage' },
  { value: 7, label: 'Bis 1 Woche' },
  { value: 14, label: 'Bis 2 Wochen' },
  { value: 30, label: 'Bis 1 Monat' },
];

export function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<'experts' | 'services'>(
    (searchParams.get('type') as 'experts' | 'services') || 'experts'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Fetch categories for filter dropdown
  const { data: categories } = useCategories();

  // Build expert search filters
  const expertFilters: ExpertSearchFilters = useMemo(() => ({
    q: query || undefined,
    tools: selectedTools.length > 0 ? selectedTools.join(',') : undefined,
    countries: selectedCountries.length > 0 ? selectedCountries.join(',') : undefined,
    minRate: priceRange[0] > 0 ? priceRange[0] * 100 : undefined,
    maxRate: priceRange[1] < 500 ? priceRange[1] * 100 : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    verifiedOnly: verifiedOnly || undefined,
    page,
    perPage: 12,
  }), [query, selectedTools, selectedCountries, priceRange, minRating, verifiedOnly, page]);

  // Build service search filters
  const serviceFilters: ServiceSearchFilters = useMemo(() => ({
    q: query || undefined,
    categoryId: selectedCategory || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] * 100 : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] * 100 : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxDeliveryDays: maxDeliveryDays || undefined,
    tags: selectedTools.length > 0 ? selectedTools.join(',') : undefined,
    page,
    perPage: 12,
  }), [query, selectedCategory, priceRange, minRating, maxDeliveryDays, selectedTools, page]);

  // Fetch search results
  const {
    data: expertsData,
    isLoading: expertsLoading,
    isError: expertsError
  } = useSearchExperts(expertFilters, searchType === 'experts');

  const {
    data: servicesData,
    isLoading: servicesLoading,
    isError: servicesError
  } = useSearchServices(serviceFilters, searchType === 'services');

  const experts = expertsData?.data || [];
  const services = servicesData?.data || [];
  const isLoading = searchType === 'experts' ? expertsLoading : servicesLoading;
  const isError = searchType === 'experts' ? expertsError : servicesError;
  const totalResults = searchType === 'experts'
    ? (expertsData?.meta?.totalItems || 0)
    : (servicesData?.meta?.totalItems || 0);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, selectedTools, selectedCountries, priceRange, minRating, verifiedOnly, maxDeliveryDays, selectedCategory, searchType]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, type: searchType });
  }, [query, searchType, setSearchParams]);

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const clearFilters = () => {
    setSelectedTools([]);
    setSelectedCountries([]);
    setPriceRange([0, 500]);
    setMinRating(0);
    setVerifiedOnly(false);
    setMaxDeliveryDays(null);
    setSelectedCategory(null);
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Search Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suche nach Experten, Services oder Tools..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSearchType('experts')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchType === 'experts'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Experten
              </button>
              <button
                type="button"
                onClick={() => setSearchType('services')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchType === 'services'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Services
              </button>
            </div>
            <Button type="submit">Suchen</Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-72 shrink-0"
              >
                <Card padding="md" className="sticky top-28">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900">Filter</h3>
                    <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">
                      Zurücksetzen
                    </button>
                  </div>

                  {/* Tools Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {toolFilters.map(tool => (
                        <button
                          key={tool}
                          onClick={() => toggleTool(tool)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedTools.includes(tool)
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Country Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Land</h4>
                    <div className="space-y-2">
                      {countryFilters.map(country => (
                        <label key={country.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country.value)}
                            onChange={() => toggleCountry(country.value)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">{country.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">
                      {searchType === 'experts' ? 'Stundensatz' : 'Preis'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-24 px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                        placeholder="Min"
                      />
                      <span className="text-neutral-400">–</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-24 px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Mindestbewertung</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= minRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified Only */}
                  <label className="flex items-center gap-2 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">Nur verifizierte</span>
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                  </label>

                  {/* Delivery Time Filter (Services only) */}
                  {searchType === 'services' && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-neutral-700 mb-3">Lieferzeit</h4>
                      <div className="space-y-2">
                        {deliveryTimeFilters.map(option => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryTime"
                              checked={maxDeliveryDays === option.value}
                              onChange={() => setMaxDeliveryDays(option.value)}
                              className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">{option.label}</span>
                          </label>
                        ))}
                        {maxDeliveryDays && (
                          <button
                            onClick={() => setMaxDeliveryDays(null)}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            Zurücksetzen
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Filter (Services only) */}
                  {searchType === 'services' && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-neutral-700 mb-3">{t('search.category', 'Kategorie')}</h4>
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
                      >
                        <option value="">{t('search.allCategories', 'Alle Kategorien')}</option>
                        {categories?.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </Card>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm">{t('search.filter', 'Filter')}</span>
                </button>
                <span className="text-sm text-neutral-500">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    `${totalResults} ${t('search.results', 'Ergebnisse')}`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-neutral-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-neutral-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <SearchResultsSkeleton viewMode={viewMode} />
            ) : isError ? (
              <Card padding="lg" className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t('search.error', 'Fehler bei der Suche')}</h2>
                <p className="text-neutral-600">{t('search.errorMessage', 'Die Suche konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.')}</p>
              </Card>
            ) : (searchType === 'experts' ? experts : services).length === 0 ? (
              <Card padding="lg" className="text-center">
                <SearchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t('search.noResults', 'Keine Ergebnisse')}</h2>
                <p className="text-neutral-600">{t('search.noResultsMessage', 'Versuchen Sie andere Suchbegriffe oder Filter.')}</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {t('search.clearFilters', 'Filter zurücksetzen')}
                </Button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {searchType === 'experts' ? (
                  experts.map((expert, index) => (
                    <ExpertCard key={expert.id} expert={expert} index={index} viewMode={viewMode} formatPrice={formatPrice} />
                  ))
                ) : (
                  services.map((service, index) => (
                    <ServiceCard key={service.id} service={service} index={index} viewMode={viewMode} formatPrice={formatPrice} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expert Card Component
function ExpertCard({
  expert,
  index,
  viewMode,
  formatPrice
}: {
  expert: ExpertSearchResult;
  index: number;
  viewMode: 'grid' | 'list';
  formatPrice: (cents: number, currency: string) => string;
}) {
  const countryFlags: Record<string, string> = { ch: '🇨🇭', de: '🇩🇪', at: '🇦🇹' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/experts/${expert.id}`}>
        <Card
          padding="md"
          variant="interactive"
          className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
        >
          <div className={viewMode === 'list' ? 'shrink-0' : 'mb-4'}>
            <div className="relative">
              <img
                src={expert.avatarUrl || '/placeholder-avatar.png'}
                alt={`${expert.firstName} ${expert.lastName}`}
                className={`rounded-xl object-cover ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48'}`}
              />
              {expert.isVerified && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {expert.firstName} {expert.lastName}
                </h3>
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {countryFlags[expert.country]} {expert.country.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary-600">
                  {formatPrice(expert.hourlyRate, expert.currency)}/h
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{expert.ratingAverage.toFixed(1)}</span>
                  <span className="text-neutral-400">({expert.ratingCount})</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{expert.headline}</p>
            <div className="flex flex-wrap gap-1.5">
              {expert.skills.slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
              {expert.skills.length > 4 && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full text-xs">
                  +{expert.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

// Service Card Component
function ServiceCard({
  service,
  index,
  viewMode,
  formatPrice
}: {
  service: ServiceSearchResult;
  index: number;
  viewMode: 'grid' | 'list';
  formatPrice: (cents: number, currency: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/services/${service.id}`}>
        <Card
          padding="md"
          variant="interactive"
          className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={service.expertAvatar || '/placeholder-avatar.png'}
                alt={service.expertName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <span className="text-sm text-neutral-500">{service.expertName}</span>
                <span className="mx-2 text-neutral-300">•</span>
                <span className="text-sm text-primary-600">{service.categoryName}</span>
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{service.shortDescription}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {service.deliveryTimeDays} Tage
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {service.ratingAverage.toFixed(1)} ({service.ratingCount})
                </span>
              </div>
              <div className="font-semibold text-lg text-primary-600">
                ab {formatPrice(service.price, service.currency)}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {service.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

