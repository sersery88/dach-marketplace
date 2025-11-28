import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Users, DollarSign, ChevronRight, Zap, FileText } from 'lucide-react';
import { Button, Card, Input, Skeleton } from '@/components/ui';
import { useMyPostings } from '@/hooks';
import type { ProjectPosting, ProjectPostingStatus } from '@/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const statusConfig: Record<ProjectPostingStatus, { label: string; color: string }> = {
  draft: { label: 'Entwurf', color: 'bg-neutral-100 text-neutral-700' },
  open: { label: 'Offen', color: 'bg-green-100 text-green-700' },
  in_review: { label: 'In Prüfung', color: 'bg-yellow-100 text-yellow-700' },
  assigned: { label: 'Vergeben', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Abgeschlossen', color: 'bg-neutral-100 text-neutral-700' },
  cancelled: { label: 'Abgebrochen', color: 'bg-red-100 text-red-700' },
};

export function Postings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectPostingStatus | 'all'>('all');

  // Fetch postings from API
  const { data: postingsData, isLoading, error } = useMyPostings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const postings: ProjectPosting[] = postingsData?.data ?? [];

  // Client-side filtering for search (API may not support it)
  const filteredPostings = postings.filter((posting: ProjectPosting) => {
    const matchesSearch = !searchQuery || posting.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Meine Projektausschreibungen</h1>
            <p className="text-neutral-600 mt-1">Verwalten Sie Ihre Projekte und Angebote</p>
          </div>
          <Link to="/postings/new">
            <Button leftIcon={<Plus className="w-4 h-4" />} className="mt-4 sm:mt-0">
              Neues Projekt
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Projekte durchsuchen..."
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectPostingStatus | 'all')}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Alle Status</option>
            <option value="open">Offen</option>
            <option value="in_review">In Prüfung</option>
            <option value="assigned">Vergeben</option>
            <option value="completed">Abgeschlossen</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Fehler beim Laden der Projekte</p>
          </div>
        )}

        {/* Postings List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredPostings.map((posting: ProjectPosting, i: number) => (
              <motion.div
                key={posting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/postings/${posting.id}`}>
                  <Card variant="interactive" className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 truncate">{posting.title}</h3>
                          {posting.isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <Zap className="w-3 h-3" /> Dringend
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-600 text-sm line-clamp-2 mb-3">{posting.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {posting.toolsRequired.map((tool: string) => (
                            <span key={tool} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{tool}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 lg:gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[posting.status].color}`}>
                          {statusConfig[posting.status].label}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{posting.proposalCount} Angebote</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{posting.budgetMin ?? 0}-{posting.budgetMax ?? 0} {posting.currency.toUpperCase()}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-neutral-400"><Clock className="w-3 h-3" />{formatDate(posting.createdAt)}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 hidden lg:block" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPostings.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">Keine Projekte gefunden</p>
            <Link to="/postings/new">
              <Button>Erstes Projekt erstellen</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

