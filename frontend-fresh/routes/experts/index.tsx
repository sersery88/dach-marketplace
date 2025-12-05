import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { ExpertProfile, PaginatedResponse } from '@/types/index.ts';
import { Star, Filter, Search, MapPin, CheckCircle } from 'lucide-preact';
import { formatCurrency, getInitials } from '@/lib/utils.ts';

interface PageData {
  experts: ExpertProfile[];
  page: number;
  totalPages: number;
  query: string;
}

export const handler = define.handlers({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const q = url.searchParams.get('q') || '';

    let experts: ExpertProfile[] = [];
    let totalPages = 1;

    try {
      const params: Record<string, string | number> = { page, perPage: 12 };
      if (q) params.q = q;

      const res = await api.get<{ success: boolean; data: PaginatedResponse<ExpertProfile> }>(
        endpoints.experts.list,
        params
      );
      experts = res.data.data || [];
      totalPages = res.data.meta?.totalPages || 1;
    } catch (e) {
      console.error('Failed to fetch experts:', e);
    }

    return { data: { experts, page, totalPages, query: q } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { experts, page, totalPages, query } = data as PageData;
  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Automatisierungs-Experten</h1>
          <p class="text-gray-600">Finden Sie den perfekten Experten für Ihr Projekt</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <form action="/experts" method="GET" class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Experten durchsuchen..."
                class="input pl-10"
              />
            </div>
          </form>
          <button type="button" class="btn btn-secondary inline-flex items-center gap-2">
            <Filter class="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Experts Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => {
            const displayName = expert.user?.firstName && expert.user?.lastName
              ? `${expert.user.firstName} ${expert.user.lastName}`
              : 'Expert';
            const initials = expert.user?.firstName && expert.user?.lastName
              ? getInitials(expert.user.firstName, expert.user.lastName)
              : 'E';
            const country = expert.user?.country?.toUpperCase() || 'CH';

            return (
              <a
                key={expert.id}
                href={`/experts/${expert.id}`}
                class="card group hover:shadow-lg transition-all duration-200"
              >
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-gray-900 truncate">{displayName}</h3>
                      {expert.isVerified && (
                        <CheckCircle class="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p class="text-sm text-gray-600 line-clamp-1">{expert.headline}</p>
                    <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MapPin class="w-3 h-3" />
                      <span>{country === 'CH' ? '🇨🇭' : country === 'DE' ? '🇩🇪' : '🇦🇹'}</span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span class="font-medium">{expert.ratingAverage?.toFixed(1) || '5.0'}</span>
                    <span class="text-gray-400 text-sm">({expert.ratingCount || 0})</span>
                  </div>
                  <span class="font-semibold text-blue-600">
                    {formatCurrency(expert.hourlyRate / 100, expert.currency)}/h
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {experts.length === 0 && (
          <div class="text-center py-12">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Keine Experten gefunden</h3>
            <p class="text-gray-600">Versuchen Sie eine andere Suche</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div class="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <a href={`/experts?page=${page - 1}${query ? `&q=${query}` : ''}`} class="btn btn-secondary">
                Zurück
              </a>
            )}
            <span class="btn bg-blue-600 text-white">{page}</span>
            {page < totalPages && (
              <a href={`/experts?page=${page + 1}${query ? `&q=${query}` : ''}`} class="btn btn-secondary">
                Weiter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

