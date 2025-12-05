import { define } from '@/utils.ts';
import { api, endpoints } from '@/lib/api.ts';
import type { Service, PaginatedResponse } from '@/types/index.ts';
import { Star, Zap, Filter, Search } from 'lucide-preact';
import { formatCurrency } from '@/lib/utils.ts';

interface PageData {
  services: Service[];
  page: number;
  totalPages: number;
  query: string;
}

export const handler = define.handlers({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const q = url.searchParams.get('q') || '';

    let services: Service[] = [];
    let totalPages = 1;

    try {
      const params: Record<string, string | number> = { page, perPage: 12 };
      if (q) params.q = q;

      const res = await api.get<{ success: boolean; data: PaginatedResponse<Service> }>(
        endpoints.services.list,
        params
      );
      services = res.data.data || [];
      totalPages = res.data.meta?.totalPages || 1;
    } catch (e) {
      console.error('Failed to fetch services:', e);
    }

    return { data: { services, page, totalPages, query: q } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { services, page, totalPages, query } = data as PageData;
  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Automatisierungs-Services</h1>
          <p class="text-gray-600">Entdecken Sie professionelle Automatisierungslösungen</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <form action="/services" method="GET" class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Services durchsuchen..."
                class="input pl-10"
              />
            </div>
          </form>
          <button type="button" class="btn btn-secondary inline-flex items-center gap-2">
            <Filter class="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Services Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <a
              key={service.id}
              href={`/services/${service.slug || service.id}`}
              class="card group hover:shadow-lg transition-all duration-200"
            >
              <div class="h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-200 transition-colors">
                <Zap class="w-12 h-12 text-blue-400" />
              </div>
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h3>
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{service.shortDescription}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span class="text-sm font-medium">{service.ratingAverage?.toFixed(1) || '5.0'}</span>
                  <span class="text-sm text-gray-400">({service.ratingCount || 0})</span>
                </div>
                <span class="font-semibold text-blue-600">
                  {formatCurrency(service.price / 100, service.currency)}
                </span>
              </div>
            </a>
          ))}
        </div>

        {services.length === 0 && (
          <div class="text-center py-12">
            <Zap class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Keine Services gefunden</h3>
            <p class="text-gray-600">Versuchen Sie eine andere Suche</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div class="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <a href={`/services?page=${page - 1}${query ? `&q=${query}` : ''}`} class="btn btn-secondary">
                Zurück
              </a>
            )}
            <span class="btn bg-blue-600 text-white">{page}</span>
            {page < totalPages && (
              <a href={`/services?page=${page + 1}${query ? `&q=${query}` : ''}`} class="btn btn-secondary">
                Weiter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

