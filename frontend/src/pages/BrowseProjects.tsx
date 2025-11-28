import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search, Clock, DollarSign, Zap, Filter, X, ChevronLeft, ChevronRight,
  Briefcase, Calendar, AlertCircle, FileText
} from 'lucide-react';
import { Button, Card, Input, Skeleton } from '@/components/ui';
import { usePostings, useCategories } from '@/hooks';
import type { ProjectPosting, ProjectPostingStatus } from '@/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatBudget(min?: number, max?: number, currency?: string) {
  const curr = (currency || 'chf').toUpperCase();
  if (min && max) return `${min.toLocaleString('de-CH')} - ${max.toLocaleString('de-CH')} ${curr}`;
  if (min) return `ab ${min.toLocaleString('de-CH')} ${curr}`;
  if (max) return `bis ${max.toLocaleString('de-CH')} ${curr}`;
  return 'Auf Anfrage';
}

export function BrowseProjects() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Build filters from URL params
  const filters = useMemo(() => ({
    status: 'open' as ProjectPostingStatus, // Only show open projects
    categoryId: searchParams.get('category') || undefined,
    isUrgent: searchParams.get('urgent') === 'true' ? true : undefined,
    search: searchParams.get('q') || undefined,
    page: Number(searchParams.get('page')) || 1,
    perPage: 12,
  }), [searchParams]);

  // Fetch data
  const { data: postingsData, isLoading, isError } = usePostings(filters);
  const { data: categories = [] } = useCategories();

  const postings: ProjectPosting[] = postingsData?.data ?? [];
  const meta = postingsData?.meta;

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set('q', searchInput);
    else params.delete('q');
    params.delete('page');
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasActiveFilters = searchParams.get('q') || searchParams.get('category') || searchParams.get('urgent');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">{t('projects.browse', 'Projekte finden')}</h1>
          <p className="text-neutral-600 mt-1">{t('projects.browseDesc', 'Entdecken Sie passende Projekte und reichen Sie Angebote ein')}</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('projects.searchPlaceholder', 'Projekte durchsuchen...')}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              {t('common.filters', 'Filter')}
            </Button>
            <Button onClick={handleSearch}>{t('common.search', 'Suchen')}</Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-neutral-700 mb-1">{t('projects.category', 'Kategorie')}</label>
                <select
                  value={searchParams.get('category') || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('common.all', 'Alle')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchParams.get('urgent') === 'true'}
                    onChange={(e) => handleFilterChange('urgent', e.target.checked ? 'true' : null)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-red-500" />
                    {t('projects.urgentOnly', 'Nur dringende Projekte')}
                  </span>
                </label>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t('common.clearFilters', 'Filter löschen')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Results count */}
        {!isLoading && meta && (
          <p className="text-sm text-neutral-500 mb-4">
            {meta.totalItems} {meta.totalItems === 1 ? 'Projekt' : 'Projekte'} gefunden
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">{t('common.error', 'Fehler beim Laden der Projekte')}</p>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !isError && postings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {postings.map((posting: ProjectPosting, i: number) => (
              <motion.div
                key={posting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/projects/${posting.id}`}>
                  <Card variant="interactive" className="p-6 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">{posting.title}</h3>
                      {posting.isUrgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium shrink-0 ml-2">
                          <Zap className="w-3 h-3" /> Dringend
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-4">{posting.description}</p>

                    {/* Tools */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {posting.toolsRequired.slice(0, 4).map((tool: string) => (
                        <span key={tool} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{tool}</span>
                      ))}
                      {posting.toolsRequired.length > 4 && (
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs">+{posting.toolsRequired.length - 4}</span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 pt-4 border-t border-neutral-100">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatBudget(posting.budgetMin, posting.budgetMax, posting.currency)}
                      </span>
                      {posting.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(posting.deadline)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(posting.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {posting.proposalCount} Angebote
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && postings.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-2">{t('projects.noProjects', 'Keine Projekte gefunden')}</p>
            <p className="text-sm text-neutral-400">{t('projects.tryDifferentFilters', 'Versuchen Sie andere Filtereinstellungen')}</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && meta && meta.totalPages > 1 && (
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
              Seite {meta.currentPage} von {meta.totalPages}
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
      </div>
    </div>
  );
}

